import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { existsSync } from "fs";
import express from "express";
import { serve } from "inngest/express";
import path from "path";

import { getSessionById } from "./controllers/sessionController.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { functions, inngest } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __dirname = path.resolve();
const frontendDistPath = path.join(__dirname, "../../Frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const shouldServeFrontend =
  ENV.NODE_ENV === "production" && existsSync(frontendIndexPath);

app.use(express.json());

app.use(
  cors({
    // In development, reflect the current origin (localhost port can vary).
    origin: ENV.NODE_ENV === "production" ? ENV.CLIENT_URL : true,
    credentials: true,
  }),
);

if (ENV.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      );
      res.header(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      );
      if (req.method === "OPTIONS") {
        return res.sendStatus(204);
      }
    }
    return next();
  });
}

// Public read endpoint for guest invite flows (avoids Clerk dev redirect when signed out).
app.get("/api/public/sessions/:id", getSessionById);

app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/execute", executeRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

if (shouldServeFrontend) {
  app.use(express.static(frontendDistPath));

  app.get("/{*any}", (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({ msg: "api is up and running" });
  });
}

const startServer = async () => {
  try {
    await connectDB();
    const port = ENV.PORT || 3000;
    app.listen(port, () => console.log("Server is running on port:", port));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
