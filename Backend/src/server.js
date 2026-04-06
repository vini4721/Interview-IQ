import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { serve } from "inngest/express";
import path from "path";

import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { functions, inngest } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __dirname = path.resolve();

app.use(express.json());

const devOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

app.use(
  cors({
    origin: ENV.NODE_ENV === "production" ? ENV.CLIENT_URL : devOrigins,
    credentials: true,
  }),
);
app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/execute", executeRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../Frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../../Frontend", "dist", "index.html"));
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
