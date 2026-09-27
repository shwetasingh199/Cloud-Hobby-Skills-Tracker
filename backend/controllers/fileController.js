import { bucket, db } from "../config/firebase.js";
import {
  successResponse,
  errorResponse
} from "../utils/response.js";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, "No file uploaded.");
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return errorResponse(
        res,
        "Only JPG, PNG, WEBP and GIF images are allowed."
      );
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return errorResponse(
        res,
        "File size must be less than 5 MB."
      );
    }

    const fileName =
      `uploads/${req.user.uid}/${Date.now()}-${req.file.originalname}`;

    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype
      }
    });

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000
    });

    const record = {
      userId: req.user.uid,
      fileName: req.file.originalname,
      storagePath: fileName,
      contentType: req.file.mimetype,
      size: req.file.size,
      url: signedUrl,
      createdAt: new Date()
    };

    const ref = await db.collection("files").add(record);

    return successResponse(
      res,
      {
        id: ref.id,
        ...record
      },
      "File uploaded successfully."
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      "File upload failed.",
      500
    );
  }
}