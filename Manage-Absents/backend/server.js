import "dotenv/config";
import "./db/initDb.js";
import { seedMinimalIfEmpty } from "./db/seedData.js";
import app from "./app.js";

seedMinimalIfEmpty();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
