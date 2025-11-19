import express from "express";
import {
  getAllLost,
  upload,
  addLost,
  getLostById,
  deleteLost,
} from "../Controllers/lostController.js";

const router = express.Router();

router.get("/", getAllLost);
router.post("/", upload.single("imageURL"), addLost);
router.get("/:id", getLostById);
router.delete("/:id", deleteLost);

export default router;
