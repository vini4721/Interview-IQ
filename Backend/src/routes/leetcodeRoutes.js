import express from "express";
import { fetchLeetCodeQuestion } from "../controllers/leetcodeController.js";

const router = express.Router();

router.post("/question", fetchLeetCodeQuestion);

export default router;
