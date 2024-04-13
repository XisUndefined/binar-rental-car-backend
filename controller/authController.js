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

export const login = asyncErrorHandler(async (req, res, next) => {
  // CEK INPUT EMAIL
  const { email, pwd } = req.body;
  if (!email || !pwd) {
    const error = new CustomError("Please insert email and password.", 400);
    return next(error);
  }

  // CEK EMAIL USER TERDAFTAR
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new CustomError(
      "The requested user could not be found.",
      400
    );
    return next(error);
  }

  // CEK PASSWORD
  const isMatch = await user.compareInDb(pwd, user.password);
  if (!isMatch) {
    const error = new CustomError(
      "Incorrect password: The password you entered is incorrect. Please try again.",
      400
    );
    return next(error);
  }

  // MENGIRIM TOKEN
  sendResposeToken(user, 200, res);
});

export const protect = asyncErrorHandler(async (req, res, next) => {
  // CEK TOKEN PADA REQUEST HEADER
  const testToken = req.headers.authorization;
  if (!testToken || !testToken.startsWith("bearer")) {
    const error = new CustomError("You are not logged in!", 401);
    return next(error);
  }

  const token = testToken.split(" ")[1];

  // VERIFIKASI TOKEN (MENGAMBIL ID USER DARI PAYLOAD)
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // MENGECEK USER MELALUI ID USER PADA PAYLOAD
  const user = await User.findByPk(decodedToken.id);

  if (!user) {
    return next(
      new CustomError("The user with the given token does not exist", 401)
    );
  }

  // MENGECEK APAKAH PASSWORD DIGANTI
  const isChanged = await user.compareTimestamp(
    decodedToken.iat,
    user.passwordChangedAt
  );
  if (isChanged) {
    return next(
      new CustomError(
        "The password has been changed recently. Please login again!",
        401
      )
    );
  }

  // ASSIGN USER KEDALAM VARIABLE REQUEST
  req.user = user;
  next();
});
