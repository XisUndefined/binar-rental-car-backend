import "dotenv/config";
import app from "./app";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  dialect: process.env.DB_CONNECTION,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
    return sequelize.sync();
  })
  .then(() => {
    console.log("Models synchronized with database.");
  })
  .catch((error) => console.error("Database Connection Error:", error));

const port = process.env.PORT || 3000;

app.listen(port, () => [
  console.log(`Server listening to http://localhost:${port}`),
]);
