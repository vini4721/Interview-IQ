import express from "express";
import { getUserStats } from "../controllers/stat.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getUserStats);

export default router;
