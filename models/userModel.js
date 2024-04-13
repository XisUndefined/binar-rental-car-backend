import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export const userAttributes = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
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
        args: [0, 50],
        msg: "Lastname can't be longer than 50 characters.",
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      arg: true,
      msg: "This email address is already exist.",
    },
    validate: {
      isEmail: {
        msg: "Invalid email address. Please insert a valid email address.",
      },
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
};

export const userOptions = {
  tableName: "Users",
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
};
