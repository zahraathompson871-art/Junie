import express from "express";
import cors from "cors";
dotenv.config();
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./config/db.js";



const app = express();

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
    })
);
app.use(express.json());

app.get("/api/health/db", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({ status: "ok", db: "connected" });
    } catch (err) {
        res.status(500).json({
            status: "error",
            db: "disconnected",
            error: err.message,
        });
    }
});

app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`);
})
