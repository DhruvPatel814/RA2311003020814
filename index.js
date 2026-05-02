const express = require("express");
const { Log, setToken } = require("./logging_middleware/logger");
const { getToken } = require("./auth");
const { getOptimalSchedule } = require("./scheduler");
const { getTopNotifications } = require("./notification");

const app = express();
app.use(express.json());

let token = "";

// Initialize Auth
const init = async () => {
    try {
        token = await getToken();
        setToken(token);

        console.log("✅ Auth completed");
    } catch (err) {
        console.error("❌ Auth failed", err.message);
    }
};

// ROOT ROUTE
app.get("/", async (req, res) => {
    try {
        await Log("backend", "info", "route", "Root API called");
        res.json({ message: "API is running" });
    } catch (err) {
        await Log("backend", "error", "route", "Root API error");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// VEHICLE SCHEDULER ROUTE

app.get("/schedule", async (req, res) => {
    try {
        await Log("backend", "info", "route", "Schedule API called");

        const result = await getOptimalSchedule(token);

        await Log("backend", "info", "service", "Schedule computed");

        res.json(result);
    } catch (err) {
        await Log("backend", "error", "route", "Schedule API error");
        res.status(500).json({ error: "Failed to compute schedule" });
    }
});

// NOTIFICATIONS ROUTE

app.get("/notifications", async (req, res) => {
    try {
        await Log("backend", "info", "route", "Notifications API called");

        const result = await getTopNotifications(token);

        await Log("backend", "info", "service", "Notifications processed");

        res.json(result);
    } catch (err) {
        await Log("backend", "error", "route", "Notifications API error");
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// START SERVER ONLY AFTER AUTH

const startServer = async () => {
    await init();

    app.listen(3000, async () => {
        console.log("🚀 Server running on port 3000");
        await Log("backend", "info", "service", "Server started");
    });
};

startServer();