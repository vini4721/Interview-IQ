import express from "express";
import { generateToken } from "../controllers/stream.controller.js";

const router = express.Router();

// Route to generate Stream tokens
router.post("/token", generateToken);

export default router;
