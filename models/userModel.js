import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  dialect: process.env.DB_CONNECTION,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: "Firstname can't be longer than 50 characters.",
        },
      },
    },
    lastname: {
      type: DataTypes.STRING(50),
      validate: {
        len: {
          args: [1, 50],
          msg: "Lastname can't be longer than 50 characters.",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isLongEnough(value) {
          if (value.length < 8) {
            throw new Error("The password must be at least 8 characters long.");
          }
        },
        hasNumber(value) {
          if (!/[0-9]/.test(value)) {
            throw new Error("The password must contain at least one number.");
          }
        },
        hasUppercase(value) {
          if (!/[A-Z]/.test(value)) {
            throw new Error(
              "The password must contain at least one uppercase letter."
            );
          }
        },
        hasLowercase(value) {
          if (!/[a-z]/.test(value)) {
            throw new Error(
              "The password must contain at least one lowercase letter."
            );
          }
        },
        hasSpecialCharacter(value) {
          if (
            !/[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\|\\]/.test(
              value
            )
          ) {
            throw new Error(
              "The password must contain at least one special character."
            );
          }
        },
      },
    },
    confirmPassword: {
      type: DataTypes.VIRTUAL,
      validate: {
        isMatch(value) {
          if (value !== this.password) {
            throw new Error("Password confirmation does not match password.");
          }
        },
      },
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ["user", "admin"],
      defaultValue: "user",
      allowNull: false,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "password_changed_at",
    },
    passwordToken: {
      type: DataTypes.STRING,
      field: "password_token",
    },
    passwordTokenExpires: {
      type: DataTypes.DATE,
      field: "password_token_expires",
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
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      async beforeCreate(user) {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      async beforeUpdate(user) {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeValidate: (user, options) => {
        if (!user.avatar) {
          if (user.lastname) {
            user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.firstname
            )}+${encodeURIComponent(user.lastname)}&size=128`;
          } else {
            user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.firstname
            )}&size=128`;
          }
        }
      },
    },
  }
);

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

export default User;
