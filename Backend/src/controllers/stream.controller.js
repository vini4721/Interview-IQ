import { streamClient } from "../lib/stream.js";

export const generateToken = async (req, res) => {
  try {
    // Extract userId from Clerk Auth middleware
    const { userId } = req.auth;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Generate token valid for 1 hour
    const token = streamClient.generateUserToken({ user_id: userId });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating stream token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
