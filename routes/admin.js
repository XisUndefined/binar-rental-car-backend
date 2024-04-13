import express from "express";
import { protect } from "../controller/authController.js";
import {
  createCar,
  getAllCars,
  getCar,
  updateCar,
  verifyAdmin,
} from "../controller/adminController.js";
import { upload } from "../utils/uploadHandler.js";

const router = express.Router();

router
  .route("/cars")
  .get(protect, verifyAdmin, getAllCars)
  .post(protect, verifyAdmin, upload.single("car"), createCar);

router
  .route("/cars/:id")
  .get(protect, verifyAdmin, getCar)
  .patch(protect, verifyAdmin, upload.single("car"), updateCar);

export default router;
