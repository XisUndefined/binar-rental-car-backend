import express from "express";
import { signup } from "../controller/authController.js";

const router = express.Router();

router.route("/signup").post(signup);

export default router;
