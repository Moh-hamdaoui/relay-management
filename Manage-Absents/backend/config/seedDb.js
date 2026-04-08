import bcrypt from "bcryptjs";
import db from "./db.js";

const SALT_ROUNDS = 10;

const seed = () => {
  const existing = db.prepare("SELECT COUNT(*) as count FROM user").get();
  if (existing.count > 0) return;

  const passwordHash = bcrypt.hashSync("seed123", SALT_ROUNDS);

  const insertUser = db.prepare(
    "INSERT INTO user (email, password, surname, firstname) VALUES (?, ?, ?, ?)",
  );

  const alice = insertUser.run(
    "alice@mail.com",
    passwordHash,
    "Dupont",
    "Alice",
  );
  const aliceId = alice.lastInsertRowid;
  const bob = insertUser.run(
    "bob@mail.com",
    passwordHash,
    "Martin",
    "Bob",
  );
  const bobId = bob.lastInsertRowid;

  const insertResp = db.prepare(
    "INSERT INTO responsibility (description, owner_id) VALUES (?, ?)",
  );

  const r1 = insertResp.run("Gestion des mails", aliceId);
  const r2 = insertResp.run("Réunion hebdo", aliceId);
  insertResp.run("Déploiement", bobId);

  const insertUnav = db.prepare(
    "INSERT INTO unavailability (user_id, start_date, end_date) VALUES (?, ?, ?)",
  );

  const u1 = insertUnav.run(aliceId, "2025-02-01", "2025-02-07");

  const insertCoverage = db.prepare(
    "INSERT INTO coverage (unavailability_id, responsibility_id, covered_by) VALUES (?, ?, ?)",
  );

  insertCoverage.run(u1.lastInsertRowid, r1.lastInsertRowid, bobId);
  insertCoverage.run(u1.lastInsertRowid, r2.lastInsertRowid, bobId);

  console.log("✅ Données de test insérées (comptes seed : alice@mail.com / bob@mail.com, mot de passe seed123)");
};

seed();

export default seed;
