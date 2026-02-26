import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import templateRoutes from "./routes/tempRoutes.js";
import checkoutRoutes from "./routes/checkout.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import blockRoutes from "./routes/blockRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = new Set([
                (process.env.FRONTEND_URL || "").trim(),
            ]);
            const isLocalhost = /^https?:\/\/localhost:\d+$/.test(origin || "");
            const isLoopback = /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin || "");

            if (!origin || allowed.has(origin) || isLocalhost || isLoopback) {
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
app.use("/api/templates", templateRoutes);
app.use("/api/stripe", checkoutRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/blocks", blockRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`);
})
