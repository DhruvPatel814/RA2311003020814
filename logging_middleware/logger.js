const axios = require("axios");

let token = "";

// Set token after auth

const setToken = (t) => {
    token = t;
};

// Logging Function

const Log = async (stack, level, pkg, message) => {
    if (!token) {
        console.warn("⚠️ Log skipped (no token yet)");
        return;
    }

    try {
        await axios.post(
            "http://20.207.122.201/evaluation-service/logs",
            {
                stack,
                level,
                package: pkg,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

    } catch (err) {
        console.error("❌ Log failed:", err.response?.data || err.message);
    }
};

module.exports = { Log, setToken };