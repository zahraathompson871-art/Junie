import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import templateRoutes from "./routes/tempRoutes.js";
import checkoutRoutes from "./routes/checkout.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/paypal", checkoutRoutes);
app.use("/api/checkout", checkoutRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
