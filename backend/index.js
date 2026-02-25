import express from "express";
import cors from "cors";
dotenv.config();
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";



const app = express();

app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());

app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`);
})