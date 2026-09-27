const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { db } = require("./config/firebase");

const authRoutes =
    require("./routes/authRoutes");

const profileRoutes =
    require("./routes/profileRoutes");

const skillRoutes =
    require("./routes/skillRoutes");

const practiceRoutes =
    require("./routes/practiceRoutes");

const goalRoutes =
    require("./routes/goalRoutes");

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const communityRoutes =
    require("./routes/communityRoutes");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message:
            "Cloud Hobby Skills Tracker API is running"
    });
});

app.get("/api/test-firebase", async (req, res) => {
    try {
        const testRef =
            db.collection("system")
                .doc("connectionTest");

        await testRef.set({
            message:
                "Firebase connection successful",
            timestamp:
                new Date().toISOString()
        });

        res.json({
            success: true,
            message:
                "Node.js is successfully connected to Firebase Firestore"
        });

    } catch (error) {

        console.error(
            "Firebase connection error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Firebase connection failed",
            error: error.message
        });
    }
});

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/profile",
    profileRoutes
);

app.use(
    "/api/skills",
    skillRoutes
);

app.use(
    "/api/practice",
    practiceRoutes
);

app.use(
    "/api/goals",
    goalRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/community",
    communityRoutes
);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});