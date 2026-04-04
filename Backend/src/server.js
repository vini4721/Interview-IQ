import express from 'express';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const app = express()

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