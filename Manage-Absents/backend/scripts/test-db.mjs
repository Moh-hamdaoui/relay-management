import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../relay.db");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

await import("../db/initDb.js");
const { seedMinimalIfEmpty } = await import("../db/seedData.js");
seedMinimalIfEmpty();
const { default: db } = await import("../db/db.js");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const userCount = db.prepare("SELECT COUNT(*) AS c FROM user").get().c;
assert(userCount === 2, `attendu 2 users, obtenu ${userCount}`);

const respCount = db.prepare("SELECT COUNT(*) AS c FROM responsibility").get().c;
assert(respCount === 6, `attendu 6 responsibilities, obtenu ${respCount}`);

const unavCount = db.prepare("SELECT COUNT(*) AS c FROM unavailability").get().c;
assert(unavCount === 3, `attendu 3 unavailabilities, obtenu ${unavCount}`);

const covCount = db.prepare("SELECT COUNT(*) AS c FROM coverage").get().c;
assert(covCount === 8, `attendu 8 coverages, obtenu ${covCount}`);

const orphanResp = db
  .prepare(
    `SELECT COUNT(*) AS c FROM responsibility r
     LEFT JOIN user u ON u.id = r.owner_id WHERE u.id IS NULL`,
  )
  .get().c;
assert(orphanResp === 0, "responsibility orpheline (FK owner)");

const orphanUnav = db
  .prepare(
    `SELECT COUNT(*) AS c FROM unavailability x
     LEFT JOIN user u ON u.id = x.user_id WHERE u.id IS NULL`,
  )
  .get().c;
assert(orphanUnav === 0, "unavailability orpheline (FK user)");

const orphanCov = db
  .prepare(
    `SELECT COUNT(*) AS c FROM coverage c
     LEFT JOIN unavailability u ON u.id = c.unavailability_id
     LEFT JOIN responsibility r ON r.id = c.responsibility_id
     WHERE u.id IS NULL OR r.id IS NULL`,
  )
  .get().c;
assert(orphanCov === 0, "coverage orpheline (FK)");

const alice = db
  .prepare("SELECT id, email FROM user WHERE email = ?")
  .get("alice@mail.com");
assert(alice, "Alice seed");

const aliceResp = db
  .prepare("SELECT COUNT(*) AS c FROM responsibility WHERE owner_id = ?")
  .get(alice.id).c;
assert(aliceResp === 3, "Alice doit avoir 3 responsibilities");

console.log("OK — base SQLite : tables, seed et intégrité référentielle vérifiés.");
