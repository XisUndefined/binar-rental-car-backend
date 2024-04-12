import Car from "./carModel.js";
import Category from "./categoryModel.js";
import User from "./userModel.js";
import Order from "./orderModel.js";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  dialect: process.env.DB_CONNECTION,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

// One-To-Many Relationship (Category > Car)
Car.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Car, { foreignKey: "category_id" });

// One-To-Many Relationship (Car > Order)
Order.belongsTo(Car, { foreignKey: "car_id" });
Car.hasMany(Order, { foreignKey: "car_id" });

// One-To-Many Relationship (User > Order)
Order.belongsTo(Car, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });

const syncModels = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync();
    console.log("All models were synchronized succesfully.");
  } catch (error) {
    console.error("Unable to connect to the database or sync: ", error);
  }
};

export { Car, Category, Order, User, syncModels };
