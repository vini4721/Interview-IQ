import express from "express";
import { generateToken } from "../controllers/stream.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route to generate Stream tokens
router.post("/token", protectRoute, generateToken);

export default router;
