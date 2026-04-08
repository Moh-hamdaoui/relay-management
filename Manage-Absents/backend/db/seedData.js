import bcrypt from "bcryptjs";
import db from "./db.js";

const SALT_ROUNDS = 10;

/**
 * Au démarrage du serveur : insère un petit jeu (Alice, Bob, …) uniquement si aucun utilisateur.
 */
export function seedMinimalIfEmpty(database = db) {
  const existing = database.prepare("SELECT COUNT(*) as count FROM user").get();
  if (existing.count > 0) return;

  const passwordHash = bcrypt.hashSync("seed123", SALT_ROUNDS);

  const insertUser = database.prepare(
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

  const insertResp = database.prepare(
    "INSERT INTO responsibility (description, owner_id) VALUES (?, ?)",
  );

  const rMails = insertResp.run("Gestion des mails", aliceId);
  const rReunion = insertResp.run("Réunion hebdo", aliceId);
  const rVeille = insertResp.run("Veille production", aliceId);
  const rDeploy = insertResp.run("Déploiement", bobId);
  const rSupport = insertResp.run("Support hotline", bobId);
  const rAstreinte = insertResp.run("Astreinte week-end", bobId);

  const insertUnav = database.prepare(
    "INSERT INTO unavailability (user_id, start_date, end_date) VALUES (?, ?, ?)",
  );

  const uAlice1 = insertUnav.run(aliceId, "2025-02-01", "2025-02-07");
  const uBob = insertUnav.run(bobId, "2025-03-10", "2025-03-14");
  const uAlice2 = insertUnav.run(aliceId, "2025-06-02", "2025-06-06");

  const insertCoverage = database.prepare(
    "INSERT INTO coverage (unavailability_id, responsibility_id, covered_by) VALUES (?, ?, ?)",
  );

  const ua1 = uAlice1.lastInsertRowid;
  const ub = uBob.lastInsertRowid;
  const ua2 = uAlice2.lastInsertRowid;

  const mailsId = rMails.lastInsertRowid;
  const reunionId = rReunion.lastInsertRowid;
  const veilleId = rVeille.lastInsertRowid;
  const deployId = rDeploy.lastInsertRowid;
  const supportId = rSupport.lastInsertRowid;
  const astreinteId = rAstreinte.lastInsertRowid;

  insertCoverage.run(ua1, mailsId, bobId);
  insertCoverage.run(ua1, reunionId, bobId);
  insertCoverage.run(ua1, veilleId, bobId);
  insertCoverage.run(ub, deployId, aliceId);
  insertCoverage.run(ub, supportId, aliceId);
  insertCoverage.run(ub, astreinteId, aliceId);
  insertCoverage.run(ua2, mailsId, bobId);
  insertCoverage.run(ua2, reunionId, bobId);

  console.log(
    "✅ Données de test insérées (comptes seed : alice@mail.com / bob@mail.com, mot de passe seed123)",
  );
}

/**
 * Supprime toutes les lignes (ordre compatible avec les clés étrangères).
 */
export function clearDataset(database = db) {
  database.exec("DELETE FROM coverage");
  database.exec("DELETE FROM unavailability");
  database.exec("DELETE FROM responsibility");
  database.exec("DELETE FROM user");
}

/**
 * Insère le jeu démo : 4 utilisateurs, 7 responsibilities, 4 indisponibilités, 6 coverages.
 */
export function insertFullDemoDataset(database = db) {
  const passwordHash = bcrypt.hashSync("seed123", SALT_ROUNDS);

  const insertUser = database.prepare(
    "INSERT INTO user (email, password, surname, firstname) VALUES (?, ?, ?, ?)",
  );

  const alice = insertUser.run(
    "alice@mail.com",
    passwordHash,
    "Dupont",
    "Alice",
  );
  const aliceId = alice.lastInsertRowid;
  const bob = insertUser.run("bob@mail.com", passwordHash, "Martin", "Bob");
  const bobId = bob.lastInsertRowid;
  const claire = insertUser.run(
    "claire@mail.com",
    passwordHash,
    "Bernard",
    "Claire",
  );
  const claireId = claire.lastInsertRowid;
  const diego = insertUser.run(
    "diego@mail.com",
    passwordHash,
    "Ruiz",
    "Diego",
  );
  const diegoId = diego.lastInsertRowid;

  const insertResp = database.prepare(
    "INSERT INTO responsibility (description, owner_id) VALUES (?, ?)",
  );

  const rMails = insertResp.run("Gestion des mails", aliceId);
  const rReunion = insertResp.run("Réunion hebdo", aliceId);
  const rVeille = insertResp.run("Veille production", aliceId);
  const rDeploy = insertResp.run("Déploiement", bobId);
  const rSupport = insertResp.run("Support client", bobId);
  const rDoc = insertResp.run("Documentation", claireId);
  const rTests = insertResp.run("Tests automatiques", diegoId);

  const mailsId = rMails.lastInsertRowid;
  const reunionId = rReunion.lastInsertRowid;
  const veilleId = rVeille.lastInsertRowid;
  const deployId = rDeploy.lastInsertRowid;
  const supportId = rSupport.lastInsertRowid;
  const docId = rDoc.lastInsertRowid;
  const testsId = rTests.lastInsertRowid;

  const insertUnav = database.prepare(
    "INSERT INTO unavailability (user_id, start_date, end_date) VALUES (?, ?, ?)",
  );

  const uAlice = insertUnav.run(aliceId, "2025-02-01", "2025-02-07");
  const uBob = insertUnav.run(bobId, "2025-03-10", "2025-03-14");
  const uClaire = insertUnav.run(claireId, "2025-04-01", "2025-04-05");
  const uDiego = insertUnav.run(diegoId, "2025-05-20", "2025-05-24");

  const uaId = uAlice.lastInsertRowid;
  const ubId = uBob.lastInsertRowid;
  const ucId = uClaire.lastInsertRowid;
  const udId = uDiego.lastInsertRowid;

  const insertCov = database.prepare(
    "INSERT INTO coverage (unavailability_id, responsibility_id, covered_by) VALUES (?, ?, ?)",
  );

  insertCov.run(uaId, mailsId, bobId);
  insertCov.run(uaId, reunionId, bobId);
  insertCov.run(ubId, deployId, claireId);
  insertCov.run(ubId, supportId, aliceId);
  insertCov.run(ucId, docId, diegoId);
  insertCov.run(udId, testsId, aliceId);

  console.log(`
Jeu de données démo inséré :
  • 4 utilisateurs (tous : mot de passe seed123)
    - alice@mail.com, bob@mail.com, claire@mail.com, diego@mail.com
  • 7 responsibilities
  • 4 périodes d'indisponibilité
  • 6 coverages
`.trim());
}
