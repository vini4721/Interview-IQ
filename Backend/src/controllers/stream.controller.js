import { streamClient } from "../lib/stream.js";

export const generateToken = async (req, res) => {
  try {
    // Usually, you should extract the userId from Clerk Auth middleware here!
    // For now, we expect the frontend to pass the userId securely, or we extract it from req.auth (if using Clerk middleware)
    const { userId } = req.body;

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
