import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lostRoutes from "./routes/lostRoutes.js";
import foundRoutes from "./routes/foundRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

// app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local development
      "https://lost-and-found-front-end-pearl.vercel.app", // your Vercel frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// routes
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);
app.use("/api/users", userRoutes);

console.log("Backend restarted at:", Date.now());

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
