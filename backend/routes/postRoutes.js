import express from "express";

import {
  createPost,
  getFeed,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment
} from "../controllers/postController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createPost);

router.get("/feed", authenticateUser, getFeed);

router.delete("/:id", authenticateUser, deletePost);

router.post("/:id/like", authenticateUser, likePost);

router.delete("/:id/like", authenticateUser, unlikePost);

router.post("/:id/comments", authenticateUser, addComment);

router.get("/:id/comments", authenticateUser, getComments);

router.delete(
  "/:id/comments/:commentId",
  authenticateUser,
  deleteComment
);

export default router;