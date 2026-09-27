import express from "express";

import { getDashboardAnalytics } from "../controllers/analyticsController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticateUser,
  getDashboardAnalytics
);

export default router;