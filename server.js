import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lostRoutes from "./routes/lostRoutes.js";
import foundRoutes from "./routes/foundRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
