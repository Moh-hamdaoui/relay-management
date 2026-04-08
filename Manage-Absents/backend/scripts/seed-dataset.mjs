import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

process.chdir(root);

process.env.RELAY_INIT_DB_QUIET = "1";
await import("../config/initDb.js");
const { default: db } = await import("../config/db.js");
const { clearDataset, insertFullDemoDataset } = await import(
  "../config/seedData.js",
);

const reset = process.argv.includes("--reset");
const count = db.prepare("SELECT COUNT(*) AS c FROM user").get().c;

if (count > 0 && !reset) {
  console.log(
    "Seed ignoré : des utilisateurs sont déjà présents (rien n’a été modifié).",
  );
  console.log(
    "Pour vider la base et recharger le jeu démo : npm run db:seed:reset",
  );
  process.exit(0);
}

if (reset && count > 0) {
  clearDataset(db);
  console.log("Données existantes supprimées (cascade SQLite).");
}

insertFullDemoDataset(db);
console.log("Terminé — fichier :", path.join(root, "relay.db"));
