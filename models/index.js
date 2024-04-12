import Car from "./carModel";
import Category from "./categoryModel";
import User from "./userModel";
import Order from "./orderModel";

// One-To-Many Relationship (Category > Car)
Car.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Car, { foreignKey: "category_id" });

// One-To-Many Relationship (Car > Order)
Order.belongsTo(Car, { foreignKey: "car_id" });
Car.hasMany(Order, { foreignKey: "car_id" });

// One-To-Many Relationship (User > Order)
Order.belongsTo(Car, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });

export { Car, Category, Order, User };
