const axios = require("axios");
const { Log } = require("./logging_middleware/logger");

const BASE_URL = "http://20.207.122.201/evaluation-service";

const getTopNotifications = async (token) => {
    try {
        await Log("backend", "info", "service", "Fetching notifications");

        const res = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        let notifications = res.data.notifications;

        // Normalize fields
        let normalized = notifications.map((n) => ({
            id: n.id || n.ID,
            type: (n.type || n.Type || "").toLowerCase(),
            message: n.message || n.Message,
            timestamp: new Date(n.timestamp || n.Timestamp)
        }));

        // Priority mapping
        const typePriority = {
            placement: 3,
            result: 2,
            event: 1
        };

        normalized.sort((a, b) => {
            const typeDiff =
                (typePriority[b.type] || 0) -
                (typePriority[a.type] || 0);

            if (typeDiff !== 0) return typeDiff;

            return b.timestamp - a.timestamp;
        });

        const top10 = normalized.slice(0, 10);

        await Log(
            "backend",
            "info",
            "service",
            "Top notifications computed"
        );

        return top10;

    } catch (err) {
        await Log("backend", "error", "service", err.message);
        throw err;
    }
};

module.exports = { getTopNotifications };