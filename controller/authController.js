import { User } from "../models/index.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customErrorHandler.js";
import jwt from "jsonwebtoken";
import util from "node:util";
import crypto from "node:crypto";

const sendResposeToken = (user, statusCode, res) => {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const data = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  };

  res.status(statusCode).json({
    status:
      statusCode >= 200 && statusCode < 300
        ? "success"
        : statusCode >= 400 && statusCode < 500
        ? "fail"
        : "error",
    token,
    data,
  });
};

export const signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  sendResposeToken(newUser, 201, res);
});

// export const login = asyncErrorHandler(async (req, res, next) => {
//   // CEK INPUT EMAIL
//   const { email, pwd } = req.body;
//   if (!email || !pwd) {
//     const error = new CustomError("Please insert email and password.", 400);
//     return next(error);
//   }

//   // CEK EMAIL USER TERDAFTAR
//   const user = await User.findOne({ where: { email } });
//   if (!user) {
//     const error = new CustomError(
//       "The requested user could not be found.",
//       400
//     );
//     return next(error);
//   }

//   // CEK PASSWORD
//   const isMatch = await user.compareInDb(pwd, user.password);
//   if (!isMatch) {
//     const error = new CustomError("Incorrect email or password.", 400);
//     return next(error);
//   }

//   // MENGIRIM TOKEN
//   sendResposeToken(user, 200, res);
// });
