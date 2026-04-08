#!/usr/bin/env node
/**
 * Remplit relay.db avec un jeu de données démo (utilisateurs, responsibilities, absences, coverages).
 *
 * Usage :
 *   npm run db:seed              → insère le JDD seulement si aucun user (sinon erreur)
 *   npm run db:seed:reset        → vide les données puis insère le JDD complet
 *
 * Prérequis : schéma appliqué (le script importe initDb).
 */
import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

process.chdir(root);

await import("../../../../api-relay/config/initDb.js");
const { default: db } = await import("../../../../api-relay/config/db.js");
const { clearDataset, insertFullDemoDataset } = await import(
  "../../../../api-relay/config/seedData.js",
);

const reset = process.argv.includes("--reset");
const count = db.prepare("SELECT COUNT(*) AS c FROM user").get().c;

if (count > 0 && !reset) {
  console.error(
    "La base contient déjà des utilisateurs. Lance avec --reset pour tout supprimer puis recharger le jeu de données :\n  npm run db:seed:reset",
  );
  process.exit(1);
}

if (reset && count > 0) {
  clearDataset(db);
  console.log("Données existantes supprimées (cascade SQLite).");
}

insertFullDemoDataset(db);
console.log("Terminé — fichier :", path.join(root, "relay.db"));
