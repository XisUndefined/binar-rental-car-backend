import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { Car, User, Category } from "../models/index.js";
import CustomError from "../utils/customErrorHandler.js";
import crypto from "node:crypto";

export const verifyAdmin = asyncErrorHandler(async (req, res, next) => {
  // MENGAMBIL DATA USER MELALUI PROPERTI ID PADA REQUEST
  const user = await User.findByPk(req.user.id);

  // MELAKUKAN VERIFIKASI ADMIN
  if (user.role !== "admin") {
    const err = new CustomError(
      "The current user do not have the authorization of accesing this route",
      403
    );
    return next(err);
  }
  next();
});

export const getAllCars = asyncErrorHandler(async (req, res, next) => {
  const cars = await Car.findAll();

  res.status(200).json({
    status: "success",
    data: {
      cars,
    },
  });
});

export const createCar = asyncErrorHandler(async (req, res, next) => {
  const file = req.file;
  const extension = file.originalname.split(".").slice(-1);
  const path = `${file.fieldname}/${req.body.plate}.${extension}`;

  // CEK KATEGORI
  let categoryEntry = await Category.findOne({
    where: { category: req.body.category },
  });

  // BUAT KATEGORI BARU JIKA BELUM ADA
  if (!categoryEntry) {
    categoryEntry = await Category.create({ category: req.body.category });
  }

  const carData = {
    ...req.body,
    category_id: categoryEntry.id,
    image: path,
  };

  const newCar = await Car.create(carData);

  res.status(201).json({
    status: "success",
    data: newCar,
  });
});

export const getCar = asyncErrorHandler(async (req, res, next) => {
  const car = await Car.findByPk(req.params.id);

  if (!car) {
    const err = new CustomError("Car with that ID cannot be found!", 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    data: car,
  });
});

export const updateCar = asyncErrorHandler(async (req, res, next) => {
  const file = req.file;
  const extension = file.originalname.split(".").slice(-1);
  const path = `${file.fieldname}/${req.body.plate}.${extension}`;

  // CEK KATEGORI
  let categoryEntry = await Category.findOne({
    where: { category: req.body.category },
  });

  // BUAT KATEGORI BARU JIKA BELUM ADA
  if (!categoryEntry) {
    categoryEntry = await Category.create({ category: req.body.category });
  }

  const carData = {
    ...req.body,
    category_id: categoryEntry.id,
    image: path,
  };

  const updateCar = await Car.update(
    { ...carData },
    {
      returning: true,
      where: {
        id: req.params.id,
      },
    }
  );

  if (!updateCar[0]) {
    const err = new CustomError("Car with that ID cannot be found!", 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    data: updateCar[1][0],
  });
});
