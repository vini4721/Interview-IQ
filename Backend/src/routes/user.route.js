import express from "express";
import { getUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Fetch all users to populate exactly how it's done in the tutorial
router.get("/", protectRoute, getUsers);

export default router;
