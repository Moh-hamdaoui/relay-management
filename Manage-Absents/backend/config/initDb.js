import db from "./db.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const schema = fs.readFileSync(
  path.join(__dirname, "../schema.sql"),
  "utf8",
);

schema.split(";").forEach((statement) => {
  const s = statement.trim();
  if (s) db.exec(s);
});

console.log("✅ Base de données initialisée");
