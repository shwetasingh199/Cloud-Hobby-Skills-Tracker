import { db } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function getProfile(req, res) {
  try {
    const uid = req.user.uid;

    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      return errorResponse(res, "Profile not found.", 404);
    }

    return successResponse(res, {
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function updateProfile(req, res) {
  try {
    const uid = req.user.uid;

    const allowedFields = [
      "name",
      "username",
      "bio",
      "interests",
      "profilePicture"
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    updateData.updatedAt = new Date();

    await db.collection("users").doc(uid).set(updateData, {
      merge: true
    });

    const updated = await db.collection("users").doc(uid).get();

    return successResponse(
      res,
      {
        id: updated.id,
        ...updated.data()
      },
      "Profile updated successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}