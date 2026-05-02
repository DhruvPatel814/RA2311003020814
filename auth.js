const axios = require("axios");

const getToken = async () => {
    try {
        const res = await axios.post(
            "http://20.207.122.201/evaluation-service/auth",
            {
                email: "dp6492@srmist.edu.in",
                name: "dhruv patel",
                rollNo: "ra2311003020814",
                accessCode: "QkbpxH",
                clientID: "7d2611a3-8c7d-41c9-9c8b-f925b182e9d5",
                clientSecret: "eMVtzmDRbvgZBAvf"
            }
        );

        return res.data.access_token;

    } catch (err) {
        console.error("❌ Token fetch failed:", err.response?.data || err.message);
        throw err;
    }
};

module.exports = { getToken };