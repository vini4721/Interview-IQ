import User from "../models/User.js";

export const getUserStats = async (req, res) => {
  try {
    const currentUserId = req.auth.userId;

    // Fetch dashboard statistics
    // 1. Get total users count
    const totalUsers = await User.countDocuments();
    
    // In the future, once we integrate the interview/feedback schemas, 
    // we will aggregate total interviews and feedback score here.
    
    res.status(200).json({
      totalUsers,
    });
  } catch (error) {
    console.error("Error in getUserStats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
