import { db } from "../config/firebase.js";
import {
  successResponse,
  createdResponse,
  errorResponse
} from "../utils/response.js";
import {
  requireFields,
  isValidLevel,
  isValidSkillStatus
} from "../utils/validation.js";

export async function createSkill(req, res) {
  try {
    const missing = requireFields(req.body, [
      "skillName",
      "category",
      "currentLevel",
      "targetLevel"
    ]);

    if (missing.length > 0) {
      return errorResponse(
        res,
        `Missing fields: ${missing.join(", ")}`
      );
    }

    if (!isValidLevel(req.body.currentLevel)) {
      return errorResponse(res, "Invalid current level.");
    }

    if (!isValidLevel(req.body.targetLevel)) {
      return errorResponse(res, "Invalid target level.");
    }

    const skill = {
      userId: req.user.uid,
      skillName: req.body.skillName,
      category: req.body.category,
      currentLevel: req.body.currentLevel,
      targetLevel: req.body.targetLevel,
      startDate: req.body.startDate || null,
      targetDate: req.body.targetDate || null,
      status: req.body.status || "ACTIVE",
      description: req.body.description || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const ref = await db.collection("skills").add(skill);

    return createdResponse(
      res,
      {
        id: ref.id,
        ...skill
      },
      "Skill created successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function getSkills(req, res) {
  try {
    const snapshot = await db
      .collection("skills")
      .where("userId", "==", req.user.uid)
      .get();

    const skills = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return successResponse(res, skills);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function getSkill(req, res) {
  try {
    const doc = await db.collection("skills").doc(req.params.id).get();

    if (!doc.exists) {
      return errorResponse(res, "Skill not found.", 404);
    }

    if (doc.data().userId !== req.user.uid) {
      return errorResponse(res, "Access denied.", 403);
    }

    return successResponse(res, {
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function updateSkill(req, res) {
  try {
    const ref = db.collection("skills").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return errorResponse(res, "Skill not found.", 404);
    }

    if (doc.data().userId !== req.user.uid) {
      return errorResponse(res, "Access denied.", 403);
    }

    const allowedFields = [
      "skillName",
      "category",
      "currentLevel",
      "targetLevel",
      "startDate",
      "targetDate",
      "status",
      "description"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      updates.currentLevel &&
      !isValidLevel(updates.currentLevel)
    ) {
      return errorResponse(res, "Invalid current level.");
    }

    if (
      updates.targetLevel &&
      !isValidLevel(updates.targetLevel)
    ) {
      return errorResponse(res, "Invalid target level.");
    }

    if (
      updates.status &&
      !isValidSkillStatus(updates.status)
    ) {
      return errorResponse(res, "Invalid skill status.");
    }

    updates.updatedAt = new Date();

    await ref.update(updates);

    const updated = await ref.get();

    return successResponse(
      res,
      {
        id: updated.id,
        ...updated.data()
      },
      "Skill updated successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function deleteSkill(req, res) {
  try {
    const ref = db.collection("skills").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return errorResponse(res, "Skill not found.", 404);
    }

    if (doc.data().userId !== req.user.uid) {
      return errorResponse(res, "Access denied.", 403);
    }

    await ref.delete();

    return successResponse(
      res,
      null,
      "Skill deleted successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}