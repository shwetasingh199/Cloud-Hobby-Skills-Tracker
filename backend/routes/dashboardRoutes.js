const express = require("express");

const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const {
    serializeSnapshot
} = require("../utils/firestore");

const router = express.Router();

function calculateStreak(sessions) {
    const dates = new Set(
        sessions
            .map((session) => session.practicedAt)
            .filter(Boolean)
            .map((date) => String(date).slice(0, 10))
    );

    let streak = 0;

    const current = new Date();

    while (true) {
        const dateString =
            current.toISOString().slice(0, 10);

        if (!dates.has(dateString)) {
            break;
        }

        streak++;

        current.setDate(
            current.getDate() - 1
        );
    }

    return streak;
}

router.get("/", verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;

        const [
            skillsSnapshot,
            practiceSnapshot,
            goalsSnapshot,
            postsSnapshot
        ] = await Promise.all([
            db.collection("skills")
                .where("userId", "==", uid)
                .get(),

            db.collection("practiceSessions")
                .where("userId", "==", uid)
                .get(),

            db.collection("goals")
                .where("userId", "==", uid)
                .get(),

            db.collection("posts")
                .where("userId", "==", uid)
                .get()
        ]);

        const skills =
            serializeSnapshot(skillsSnapshot);

        const practice =
            serializeSnapshot(practiceSnapshot);

        const goals =
            serializeSnapshot(goalsSnapshot);

        const posts =
            serializeSnapshot(postsSnapshot);

        const activeSkills =
            skills.filter(
                (skill) => skill.status === "ACTIVE"
            ).length;

        const completedGoals =
            goals.filter(
                (goal) => goal.status === "COMPLETED"
            ).length;

        const totalPracticeMinutes =
            practice.reduce(
                (total, session) =>
                    total +
                    Number(session.durationMinutes || 0),
                0
            );

        const totalPracticeHours =
            Math.round(
                (totalPracticeMinutes / 60) * 10
            ) / 10;

        const currentStreak =
            calculateStreak(practice);

        const weeklyPractice = {};

        for (const session of practice) {
            const date =
                String(session.practicedAt || "")
                    .slice(0, 10);

            if (!date) continue;

            const sessionDate =
                new Date(`${date}T00:00:00`);

            const now = new Date();

            const difference =
                Math.floor(
                    (
                        new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            now.getDate()
                        ) -
                        sessionDate
                    ) /
                    (1000 * 60 * 60 * 24)
                );

            if (difference >= 0 && difference < 7) {
                weeklyPractice[date] =
                    (weeklyPractice[date] || 0) +
                    Number(
                        session.durationMinutes || 0
                    );
            }
        }

        const recentPractice =
            practice
                .sort((a, b) =>
                    String(b.practicedAt || "")
                        .localeCompare(
                            String(a.practicedAt || "")
                        )
                )
                .slice(0, 5);

        res.json({
            success: true,
            analytics: {
                activeSkills,
                completedGoals,
                totalPracticeHours,
                currentStreak,
                totalPosts: posts.length,
                weeklyPractice,
                recentPractice
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard"
        });
    }
});

module.exports = router;