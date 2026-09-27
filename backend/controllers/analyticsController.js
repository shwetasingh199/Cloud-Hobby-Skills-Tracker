import { db } from "../config/firebase.js";
import {
  successResponse,
  errorResponse
} from "../utils/response.js";

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  const dates = [
    ...new Set(
      sessions.map((session) => {
        const date = new Date(session.practicedAt);

        return date.toISOString().split("T")[0];
      })
    )
  ].sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;

  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const previous = new Date(dates[i + 1]);

    const difference =
      (current - previous) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getDashboardAnalytics(req, res) {
  try {
    const uid = req.user.uid;

    const skillsSnapshot = await db
      .collection("skills")
      .where("userId", "==", uid)
      .get();

    const practiceSnapshot = await db
      .collection("practiceSessions")
      .where("userId", "==", uid)
      .get();

    const goalsSnapshot = await db
      .collection("goals")
      .where("userId", "==", uid)
      .get();

    const postsSnapshot = await db
      .collection("posts")
      .where("userId", "==", uid)
      .get();

    const skills = skillsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const practices = practiceSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const goals = goalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalPracticeMinutes = practices.reduce(
      (sum, session) =>
        sum + Number(session.durationMinutes || 0),
      0
    );

    const completedGoals = goals.filter(
      (goal) => goal.status === "COMPLETED"
    ).length;

    const activeSkills = skills.filter(
      (skill) => skill.status === "ACTIVE"
    ).length;

    const skillPractice = {};

    practices.forEach((session) => {
      skillPractice[session.skillId] =
        (skillPractice[session.skillId] || 0) +
        Number(session.durationMinutes || 0);
    });

    const weeklyPractice = {};

    practices.forEach((session) => {
      const date = new Date(session.practicedAt);

      const weekDay = date.toLocaleDateString("en-US", {
        weekday: "short"
      });

      weeklyPractice[weekDay] =
        (weeklyPractice[weekDay] || 0) +
        Number(session.durationMinutes || 0);
    });

    return successResponse(res, {
      activeSkills,
      totalSkills: skills.length,
      totalPracticeMinutes,
      totalPracticeHours: Number(
        (totalPracticeMinutes / 60).toFixed(2)
      ),
      completedGoals,
      totalGoals: goals.length,
      currentStreak: calculateStreak(practices),
      totalPosts: posts.length,

      skillPractice,

      weeklyPractice,

      skillDistribution: skills.reduce((result, skill) => {
        result[skill.category] =
          (result[skill.category] || 0) + 1;

        return result;
      }, {})
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}