import { userAttributes, userOptions } from "./userModel.js";
import { carAttributes } from "./carModel.js";
import { categoryAttributes, categoryOptions } from "./categoryModel.js";
import { orderAttributes } from "./orderModel.js";
import sequelize from "../utils/database.js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";

export const User = sequelize.define("User", userAttributes, userOptions);

export const Car = sequelize.define("Car", carAttributes);

export const Category = sequelize.define(
  "Category",
  categoryAttributes,
  categoryOptions
);

export const Order = sequelize.define("Order", orderAttributes);

User.prototype.compareInDb = async function (str, strDB) {
  return await bcrypt.compare(str, strDB);
};

User.prototype.compareTimestamp = async function (varTimestamp, dbTimestamp) {
  const changedTimestamp = parseInt(dbTimestamp.getTime() / 1000);
  return varTimestamp < changedTimestamp;
};

User.prototype.createPwdToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// One-To-Many Relationship (Category > Car)
Car.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Car, { foreignKey: "category_id" });

// One-To-Many Relationship (Car > Order)
Order.belongsTo(Car, { foreignKey: "car_id" });
Car.hasMany(Order, { foreignKey: "car_id" });

// One-To-Many Relationship (User > Order)
Order.belongsTo(Car, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });

export const syncModels = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync();
    console.log("All models were synchronized succesfully.");
  } catch (error) {
    console.error("Unable to connect to the database or sync: ", error);
  }
};
