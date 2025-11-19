import express from "express";
import {
  getAllFound,
  addFound,
  upload,
  getFoundById,
  deleteFound,
} from "../Controllers/foundController.js";

const router = express.Router();

router.get("/", getAllFound);
router.post("/", upload.single("imageURL"), addFound);

router.get("/:id", getFoundById);
router.delete("/:id", deleteFound);

export default router;
