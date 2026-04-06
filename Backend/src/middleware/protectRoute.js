import { requireAuth, getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const { userId: clerkId } = getAuth(req);

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      let user = await User.findOne({ clerkId });

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        user = await User.create({
          clerkId,
          name:
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
            clerkUser.username ||
            "User",
          email: clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@placeholder.local`,
          profileImage: clerkUser.imageUrl || "",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
