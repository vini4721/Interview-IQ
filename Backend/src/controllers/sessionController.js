import mongoose from "mongoose";
import { chatClient, streamClient, upsertStreamUser } from "../lib/stream.js";
import Session from "../models/Session.js";

const HEX_PREFIX_RE = /^[a-f0-9]{8,23}$/i;

const resolveSessionByRouteId = async (rawId, { populate = false } = {}) => {
  const routeId = String(rawId || "").trim();

  if (!routeId) return null;

  const populateSession = (query) =>
    populate
      ? query
          .populate("host", "name email profileImage clerkId")
          .populate("participant", "name email profileImage clerkId")
      : query;

  if (mongoose.Types.ObjectId.isValid(routeId) && routeId.length === 24) {
    return await populateSession(Session.findById(routeId));
  }

  if (!HEX_PREFIX_RE.test(routeId)) return null;

  const collectMatchesByRegex = async (regex) => {
    return Session.aggregate([
      {
        $match: {
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex,
              options: "i",
            },
          },
        },
      },
      { $project: { _id: 1 } },
      { $limit: 5 },
    ]);
  };

  let matches = await collectMatchesByRegex(`^${routeId}`);

  // If no direct prefix match (common when one character is missing in the middle),
  // try fuzzy reconstruction for 23-char IDs by allowing one wildcard insertion.
  if (matches.length === 0 && routeId.length === 23) {
    const regexCandidates = [];
    for (let i = 0; i <= routeId.length; i += 1) {
      const left = routeId.slice(0, i);
      const right = routeId.slice(i);
      regexCandidates.push(`^${left}[a-f0-9]${right}$`);
    }

    const uniqueIds = new Set();
    for (const regex of regexCandidates) {
      const candidateMatches = await collectMatchesByRegex(regex);
      for (const candidate of candidateMatches) {
        uniqueIds.add(String(candidate._id));
      }
      if (uniqueIds.size > 1) break;
    }

    matches = Array.from(uniqueIds).map((_id) => ({ _id }));
  }

  if (matches.length === 0) return null;
  if (matches.length > 1) {
    const err = new Error("Ambiguous session link");
    err.code = "AMBIGUOUS_SESSION_LINK";
    throw err;
  }

  return await populateSession(Session.findById(matches[0]._id));
};

export async function createSession(req, res) {
  let createdSession = null;

  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res
        .status(400)
        .json({ message: "Problem and difficulty are required" });
    }

    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    createdSession = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
    });

    await upsertStreamUser({
      id: clerkId,
      name: req.user.name,
      image: req.user.profileImage,
    });

    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: {
          problem,
          difficulty,
          sessionId: createdSession._id.toString(),
        },
      },
    });

    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session: createdSession });
  } catch (error) {
    if (createdSession?._id) {
      try {
        await Session.findByIdAndDelete(createdSession._id);
      } catch (cleanupError) {
        console.error(
          "Error while rolling back failed session creation:",
          cleanupError.message,
        );
      }
    }

    console.log("Error in createSession controller:", error.message);
    res.status(500).json({
      message:
        "Failed to initialize realtime session. Please verify Stream API configuration and try again.",
    });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "active",
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await resolveSessionByRouteId(id, { populate: true });

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    if (error?.code === "AMBIGUOUS_SESSION_LINK") {
      return res.status(400).json({ message: "Session link is ambiguous" });
    }
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await resolveSessionByRouteId(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res
        .status(400)
        .json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "Host cannot join their own session as participant" });
    }

    if (session.participant?.toString() === userId.toString()) {
      return res.status(200).json({ session });
    }

    if (session.participant)
      return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    await upsertStreamUser({
      id: clerkId,
      name: req.user.name,
      image: req.user.profileImage,
    });

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await resolveSessionByRouteId(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the host can end the session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // Mark completed first so dashboard/state never keeps offering rejoin
    // if external provider cleanup fails.
    session.status = "completed";
    await session.save();

    const call = streamClient.video.call("default", session.callId);
    try {
      await call.delete({ hard: true });
    } catch (cleanupError) {
      console.warn(
        "Warning deleting Stream call during session end:",
        cleanupError.message,
      );
    }

    const channel = chatClient.channel("messaging", session.callId);
    try {
      await channel.delete();
    } catch (cleanupError) {
      console.warn(
        "Warning deleting Stream channel during session end:",
        cleanupError.message,
      );
    }

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateSessionQuestion(req, res) {
  try {
    const { id } = req.params;
    const { question } = req.body;
    const userId = req.user._id;

    if (!question || typeof question !== "object") {
      return res.status(400).json({ message: "Question payload is required" });
    }

    const session = await resolveSessionByRouteId(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the host can update the session question" });
    }

    session.currentQuestion = question;
    await session.save();

    res.status(200).json({ session, message: "Session question updated" });
  } catch (error) {
    console.log("Error in updateSessionQuestion controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
