import { db } from "../config/firebase.js";
import {
  successResponse,
  createdResponse,
  errorResponse
} from "../utils/response.js";

export async function createPracticeSession(req, res) {
  try {
    const {
      skillId,
      durationMinutes,
      activity,
      notes,
      practicedAt
    } = req.body;

    if (!skillId || !durationMinutes || !activity) {
      return errorResponse(
        res,
        "skillId, durationMinutes and activity are required."
      );
    }

    const skill = await db
      .collection("skills")
      .doc(skillId)
      .get();

    if (!skill.exists) {
      return errorResponse(res, "Skill not found.", 404);
    }

    if (skill.data().userId !== req.user.uid) {
      return errorResponse(res, "Access denied.", 403);
    }

    const session = {
      userId: req.user.uid,
      skillId,
      durationMinutes: Number(durationMinutes),
      activity,
      notes: notes || "",
      practicedAt: practicedAt
        ? new Date(practicedAt)
        : new Date(),
      createdAt: new Date()
    };

    const ref = await db
      .collection("practiceSessions")
      .add(session);

    return createdResponse(
      res,
      {
        id: ref.id,
        ...session
      },
      "Practice session recorded."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function getPracticeSessions(req, res) {
  try {
    const snapshot = await db
      .collection("practiceSessions")
      .where("userId", "==", req.user.uid)
      .get();

    const sessions = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort(
        (a, b) =>
          new Date(b.practicedAt) -
          new Date(a.practicedAt)
      );

    return successResponse(res, sessions);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function getPracticeBySkill(req, res) {
  try {
    const snapshot = await db
      .collection("practiceSessions")
      .where("userId", "==", req.user.uid)
      .where("skillId", "==", req.params.skillId)
      .get();

    const sessions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return successResponse(res, sessions);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}