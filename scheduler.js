const axios = require("axios");
const { Log } = require("./logging_middleware/logger");

const BASE_URL = "http://20.207.122.201/evaluation-service";

const findNumericField = (obj, keywords) => {
  for (let key of Object.keys(obj)) {
    for (let word of keywords) {
      if (key.toLowerCase().includes(word)) {
        const val = Number(obj[key]);
        if (!isNaN(val)) return val;
      }
    }
  }
  return 0;
};

const findIdField = (obj) => {
  return (
    obj.taskId ||
    obj.vehicleId ||
    obj.id ||
    obj.ID ||
    obj._id ||
    obj.task ||
    JSON.stringify(obj)
  );
};

const getOptimalSchedule = async (token) => {
  try {
    await Log("backend", "info", "service", "Fetching depot data");

    const depotRes = await axios.get(`${BASE_URL}/depots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const depots = depotRes.data.depots;

    await Log("backend", "info", "service", "Fetching vehicles data");

    const vehicleRes = await axios.get(`${BASE_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const vehicles = vehicleRes.data.vehicles;


    let results = [];

    for (let depot of depots) {

      let capacity = findNumericField(depot, ["hour", "capacity", "time"]);

      let normalized = vehicles.map((v) => {
        let parsed = null;

        try {
          if (typeof v === "string") {
            parsed = JSON.parse(v);
          } else if (typeof v === "object" && v !== null) {
            parsed = v;
          }
        } catch (e) {
          parsed = null;
        }

        return {
          id:
            parsed?.TaskID ||
            parsed?.taskId ||
            parsed?.id ||
            parsed?.ID ||
            "unknown",

          duration: Number(
            parsed?.Duration ||
            parsed?.duration ||
            parsed?.time ||
            0
          ),

          impact: Number(
            parsed?.Impact ||
            parsed?.impact ||
            parsed?.score ||
            0
          )
        };
      });

      normalized = normalized.filter(
        (t) => t.duration > 0 && t.impact > 0
      );

      normalized.sort(
        (a, b) => (b.impact / b.duration) - (a.impact / a.duration)
      );

      let totalImpact = 0;
      let selectedTasks = [];

      for (let task of normalized) {
        if (task.duration <= capacity) {
          capacity -= task.duration;
          totalImpact += task.impact;
          selectedTasks.push(task.id);
        }
      }

      results.push({
        depotId: depot.id || depot.depotId || depot.ID,
        totalImpact,
        selectedTasks
      });

      await Log("backend", "info", "service", `Processed depot`);
    }

    return results;

  } catch (err) {
    await Log("backend", "error", "service", err.message);
    throw err;
  }
};

module.exports = { getOptimalSchedule };