import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { Car, User, Category } from "../models/index.js";
import CustomError from "../utils/customErrorHandler.js";
import crypto from "node:crypto";
import fs, { promises as fsPromises } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

export const deleteCar = asyncErrorHandler(async (req, res, next) => {
  const selectedCar = await Car.findByPk(req.params.id);

  if (!selectedCar) {
    const err = new CustomError("Car with that ID cannot be found!", 404);
    return next(err);
  }
  const { access, unlink } = fsPromises;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const fileNameToDelete = selectedCar.image.split("/").slice(-1);

  const filePathToDelete = path.join(
    __dirname,
    "../uploads/data/car",
    fileNameToDelete[0]
  );

  await access(filePathToDelete, fs.constants.F_OK);

  await unlink(filePathToDelete);

  await Car.destroy({
    where: { id: req.params.id },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
