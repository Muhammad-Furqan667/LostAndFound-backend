import express from "express";
import {
  getAllFound,
  addFound,
  upload,
  getFoundById,
  deleteFound,
} from "../Controllers/foundController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllFound);
router.post("/", authenticateUser, upload.single("imageURL"), addFound);

router.get("/:id", getFoundById);
router.delete("/:id", deleteFound);

export default router;
