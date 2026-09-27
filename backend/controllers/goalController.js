import { db } from "../config/firebase.js";
import {
  successResponse,
  createdResponse,
  errorResponse
} from "../utils/response.js";

export async function createGoal(req, res) {
  try {
    const {
      skillId,
      title,
      targetValue,
      unit,
      deadline
    } = req.body;

    if (!skillId || !title || targetValue === undefined || !unit) {
      return errorResponse(
        res,
        "skillId, title, targetValue and unit are required."
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

    const goal = {
      userId: req.user.uid,
      skillId,
      title,
      targetValue: Number(targetValue),
      currentValue: 0,
      unit,
      deadline: deadline || null,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const ref = await db.collection("goals").add(goal);

    return createdResponse(
      res,
      {
        id: ref.id,
        ...goal
      },
      "Goal created successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function getGoals(req, res) {
  try {
    const snapshot = await db
      .collection("goals")
      .where("userId", "==", req.user.uid)
      .get();

    const goals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return successResponse(res, goals);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function updateGoal(req, res) {
  try {
    const ref = db.collection("goals").doc(req.params.id);

    const doc = await ref.get();

    if (!doc.exists) {
      return errorResponse(res, "Goal not found.", 404);
    }

    if (doc.data().userId !== req.user.uid) {
      return errorResponse(res, "Access denied.", 403);
    }

    const updates = {
      ...req.body,
      updatedAt: new Date()
    };

    if (updates.currentValue !== undefined) {
      updates.currentValue = Number(updates.currentValue);

      if (
        updates.currentValue >=
        Number(doc.data().targetValue)
      ) {
        updates.status = "COMPLETED";
      }
    }

    await ref.update(updates);

    const updated = await ref.get();

    return successResponse(
      res,
      {
        id: updated.id,
        ...updated.data()
      },
      "Goal updated successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function deleteGoal(req, res) {
  try {
    const ref = db.collection("goals").doc(req.params.id);

    const doc = await ref.get();

    if (!doc.exists) {
      return errorResponse(res, "Goal not found.", 404);
    }

    if (doc.data().userId !== req.user.uid) {
      return errorResponse(res, "Access denied.", 403);
    }

    await ref.delete();

    return successResponse(
      res,
      null,
      "Goal deleted successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}