import express from 'express';
import { ENV } from './lib/env.js';
import { serve } from "inngest/express";
import { connectDB } from './lib/db.js';
import { inngest, functions } from './lib/inngest.js';
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

import cors from 'cors'

import { clerkAuthMiddleware } from './middleware/protectRoute.js';

const app = express()

// middlewares

app.use(express.json())
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkAuthMiddleware);
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);


app.get('/', (req,res) => {
    res.status(200).json({msg: "success from api"})
})

const startServer = async () => {
    try {
        await connectDB();
        app.listen(3000, () => {
            console.log("sever started");
        })
    } catch (error) {
        console.log("server not started ❌");
    }
}

startServer();