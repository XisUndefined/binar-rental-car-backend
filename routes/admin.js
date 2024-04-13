import express from "express";
import { protect } from "../controller/authController.js";
import {
  createCar,
  getAllCars,
  verifyAdmin,
} from "../controller/adminController.js";
import multer from "multer";
import CustomError from "../utils/customErrorHandler.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/data");
  },
  filename: (req, file, callback) => {
    const extension = file.originalname.split(".").slice(-1);
    // console.log(req.body);
    callback(
      null,
      `${file.fieldname}/${
        req.body.plate ? req.body.plate : req.body.avatar
      }.${extension}`
    );
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 5000000, // 5MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new CustomError("Invalid file type", 422);
      return callback(error, false);
    }
    callback(null, true);
  },
});

router
  .route("/cars")
  .get(protect, verifyAdmin, getAllCars)
  .post(protect, verifyAdmin, upload.single("car"), createCar);

export default router;
