import { getAuth, requireAuth } from "@clerk/express";
import User from "../models/User.js";

const asString = (value) => (typeof value === "string" ? value.trim() : "");

const getEmailFromClaims = (claims = {}) => {
  const direct = asString(claims.email) || asString(claims.email_address);
  if (direct) return direct;

  const primary = claims.primary_email_address;
  if (typeof primary === "string") return primary.trim();
  if (primary && typeof primary === "object") {
    return asString(primary.email_address) || asString(primary.emailAddress);
  }

  if (Array.isArray(claims.email_addresses) && claims.email_addresses.length) {
    const first = claims.email_addresses[0];
    if (typeof first === "string") return first.trim();
    if (first && typeof first === "object") {
      return asString(first.email_address) || asString(first.emailAddress);
    }
  }

  return "";
};

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const { userId: clerkId, sessionClaims } = getAuth(req);

      if (!clerkId) {
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });
      }

      const resolvedName =
        `${asString(sessionClaims?.first_name)} ${asString(sessionClaims?.last_name)}`.trim() ||
        asString(sessionClaims?.username) ||
        "User";
      const resolvedImage =
        asString(sessionClaims?.image_url) || asString(sessionClaims?.picture);

      // Keep this stable and unique for each Clerk user to avoid duplicate-email race/failures.
      const fallbackUniqueEmail = `${clerkId}@placeholder.local`;
      const claimedEmail = getEmailFromClaims(sessionClaims);

      let user = await User.findOne({ clerkId });

      if (!user) {
        try {
          user = await User.create({
            clerkId,
            name: resolvedName,
            email: claimedEmail || fallbackUniqueEmail,
            profileImage: resolvedImage,
          });
        } catch (createError) {
          // Duplicate key can happen if email already exists for the same human user
          // or due parallel requests during first sign-in.
          if (createError?.code === 11000) {
            const conflictEmail =
              createError?.keyValue?.email ||
              claimedEmail ||
              fallbackUniqueEmail;

            const existingByEmail = await User.findOne({
              email: conflictEmail,
            });
            if (existingByEmail) {
              existingByEmail.clerkId = clerkId;
              existingByEmail.name = resolvedName || existingByEmail.name;
              if (resolvedImage) existingByEmail.profileImage = resolvedImage;
              user = await existingByEmail.save();
            } else {
              user = await User.findOne({ clerkId });
            }
          } else {
            throw createError;
          }
        }
      } else {
        user.name = resolvedName || user.name;
        if (resolvedImage) user.profileImage = resolvedImage;
        await user.save();
      }

      if (!user) {
        return res.status(500).json({
          message: "Auth middleware failed",
          details: "Unable to resolve authenticated user",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error?.message);
      console.error(error);
      res.status(500).json({
        message: "Auth middleware failed",
        details: error?.message || "Unknown error",
      });
    }
  },
];
