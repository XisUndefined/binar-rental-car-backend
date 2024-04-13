import { DataTypes } from "sequelize";

export const categoryAttributes = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category: {
    type: DataTypes.ENUM,
    values: ["small", "medium", "large"],
    allowNull: false,
  },
};

export const categoryOptions = {
  timestamps: false,
};
