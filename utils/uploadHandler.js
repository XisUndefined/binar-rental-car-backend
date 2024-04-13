import multer from "multer";
import CustomError from "./customErrorHandler.js";

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

export const upload = multer({
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
