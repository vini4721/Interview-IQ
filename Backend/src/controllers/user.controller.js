import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.auth.userId;

    // Fetch all users except the currently logged-in user
    const users = await User.find({ clerkId: { $ne: currentUserId } });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
