import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  dialect: process.env.DB_CONNECTION,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["pending", "process", "completed"],
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startRent: {
    type: DataTypes.DATE,
    field: "start_rent",
    validate: {
      isAfter: {
        args: new Date().toISOString().slice(0, 10),
        msg: "Start date mush be future date.",
      },
    },
  },
  finishRent: {
    type: DataTypes.DATE,
    field: "finish_rent",
    validate: {
      isMaximumSevenDays(value) {
        const startRentValue = new Date(this.startRent);
        const sevenDaysLater = new Date(startRentValue);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        if (new Date(value) > sevenDaysLater) {
          throw new Error(
            "Finish rent date must be within 7 days of start rent date."
          );
        }
      },
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "updated_at",
  },
});

export default Order;
