import "dotenv/config";
import app from "./app.js";
import { syncModels } from "./models/index.js";

const port = process.env.PORT || 3000;

try {
  await syncModels();
  app.listen(port, () => [
    console.log(`Server listening to http://localhost:${port}`),
  ]);
} catch (error) {
  console.error("Failed to authenticate with database or sync: ", error);
}
