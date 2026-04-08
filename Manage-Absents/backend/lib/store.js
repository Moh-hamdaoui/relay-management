import db from "../config/db.js";

export function parseId(id) {
  const n = typeof id === "number" ? id : parseInt(String(id), 10);
  return Number.isFinite(n) ? n : NaN;
}

export function publicUser(u) {
  return {
    id: String(u.id),
    email: u.email,
    surname: u.surname,
    firstname: u.firstname,
  };
}

export function findUser(id) {
  const n = parseId(id);
  if (Number.isNaN(n)) return undefined;
  const row = db
    .prepare(
      "SELECT id, email, password AS passwordHash, surname, firstname FROM user WHERE id = ?",
    )
    .get(n);
  if (!row) return undefined;
  return {
    id: String(row.id),
    email: row.email,
    passwordHash: row.passwordHash,
    surname: row.surname,
    firstname: row.firstname,
  };
}

export function findUserByEmail(email) {
  const row = db
    .prepare(
      "SELECT id, email, password AS passwordHash, surname, firstname FROM user WHERE email = ?",
    )
    .get(email);
  if (!row) return undefined;
  return {
    id: String(row.id),
    email: row.email,
    passwordHash: row.passwordHash,
    surname: row.surname,
    firstname: row.firstname,
  };
}

export function listUsersForPublicResponse() {
  return db
    .prepare("SELECT id, email, surname, firstname FROM user ORDER BY id")
    .all();
}

export function isEmailTaken(email, excludeUserId) {
  const row = db.prepare("SELECT id FROM user WHERE email = ?").get(email);
  if (!row) return false;
  if (excludeUserId !== undefined && String(row.id) === String(excludeUserId)) {
    return false;
  }
  return true;
}

export function createUser({ email, passwordHash, surname, firstname }) {
  const result = db
    .prepare(
      "INSERT INTO user (email, password, surname, firstname) VALUES (?, ?, ?, ?)",
    )
    .run(email, passwordHash, surname, firstname);
  return findUser(result.lastInsertRowid);
}

export function updateUserRecord(userId, { email, passwordHash, surname, firstname }) {
  const n = parseId(userId);
  if (Number.isNaN(n)) return undefined;
  const parts = [];
  const vals = [];
  if (email !== undefined) {
    parts.push("email = ?");
    vals.push(email);
  }
  if (passwordHash !== undefined) {
    parts.push("password = ?");
    vals.push(passwordHash);
  }
  if (surname !== undefined) {
    parts.push("surname = ?");
    vals.push(surname);
  }
  if (firstname !== undefined) {
    parts.push("firstname = ?");
    vals.push(firstname);
  }
  if (parts.length === 0) return findUser(n);
  vals.push(n);
  db.prepare(`UPDATE user SET ${parts.join(", ")} WHERE id = ?`).run(...vals);
  return findUser(n);
}

export function deleteUserById(userId) {
  const n = parseId(userId);
  if (Number.isNaN(n)) return false;
  const r = db.prepare("DELETE FROM user WHERE id = ?").run(n);
  return r.changes > 0;
}

function mapResponsibilityRow(row) {
  if (!row) return undefined;
  return {
    id: String(row.id),
    userId: String(row.owner_id),
    description: row.description,
  };
}

export function findResponsibility(id) {
  const n = parseId(id);
  if (Number.isNaN(n)) return undefined;
  const row = db
    .prepare(
      "SELECT id, description, owner_id FROM responsibility WHERE id = ?",
    )
    .get(n);
  return mapResponsibilityRow(row);
}

export function listResponsibilitiesForUser(userId) {
  const n = parseId(userId);
  if (Number.isNaN(n)) return [];
  return db
    .prepare(
      "SELECT id, description, owner_id FROM responsibility WHERE owner_id = ? ORDER BY id",
    )
    .all(n)
    .map(mapResponsibilityRow);
}

export function createResponsibility(userId, description) {
  const n = parseId(userId);
  const result = db
    .prepare(
      "INSERT INTO responsibility (description, owner_id) VALUES (?, ?)",
    )
    .run(description, n);
  return findResponsibility(result.lastInsertRowid);
}

export function updateResponsibilityDescription(responsibilityId, description) {
  const n = parseId(responsibilityId);
  db.prepare("UPDATE responsibility SET description = ? WHERE id = ?").run(
    description,
    n,
  );
  return findResponsibility(responsibilityId);
}

export function deleteResponsibilityById(responsibilityId) {
  const n = parseId(responsibilityId);
  const r = db.prepare("DELETE FROM responsibility WHERE id = ?").run(n);
  return r.changes > 0;
}

function mapUnavailabilityRow(row) {
  if (!row) return undefined;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export function findUnavailability(id) {
  const n = parseId(id);
  if (Number.isNaN(n)) return undefined;
  const row = db
    .prepare(
      "SELECT id, user_id, start_date, end_date FROM unavailability WHERE id = ?",
    )
    .get(n);
  return mapUnavailabilityRow(row);
}

export function listUnavailabilitiesForUser(userId) {
  const n = parseId(userId);
  if (Number.isNaN(n)) return [];
  return db
    .prepare(
      "SELECT id, user_id, start_date, end_date FROM unavailability WHERE user_id = ? ORDER BY id",
    )
    .all(n)
    .map(mapUnavailabilityRow);
}

export function createUnavailability(userId, startDate, endDate) {
  const n = parseId(userId);
  const result = db
    .prepare(
      "INSERT INTO unavailability (user_id, start_date, end_date) VALUES (?, ?, ?)",
    )
    .run(n, startDate, endDate);
  return findUnavailability(result.lastInsertRowid);
}

export function updateUnavailabilityDates(unavailabilityId, startDate, endDate) {
  const n = parseId(unavailabilityId);
  if (startDate !== undefined && endDate !== undefined) {
    db.prepare(
      "UPDATE unavailability SET start_date = ?, end_date = ? WHERE id = ?",
    ).run(startDate, endDate, n);
  } else if (startDate !== undefined) {
    db.prepare("UPDATE unavailability SET start_date = ? WHERE id = ?").run(
      startDate,
      n,
    );
  } else if (endDate !== undefined) {
    db.prepare("UPDATE unavailability SET end_date = ? WHERE id = ?").run(
      endDate,
      n,
    );
  }
  return findUnavailability(unavailabilityId);
}

export function deleteUnavailabilityById(unavailabilityId) {
  const n = parseId(unavailabilityId);
  const r = db.prepare("DELETE FROM unavailability WHERE id = ?").run(n);
  return r.changes > 0;
}

function mapCoverageRow(row) {
  if (!row) return undefined;
  return {
    id: String(row.id),
    unavailabilityId: String(row.unavailability_id),
    responsibilityId: String(row.responsibility_id),
    coveringUserId:
      row.covered_by == null ? null : String(row.covered_by),
  };
}

export function findCoverage(id) {
  const n = parseId(id);
  if (Number.isNaN(n)) return undefined;
  const row = db
    .prepare(
      "SELECT id, unavailability_id, responsibility_id, covered_by FROM coverage WHERE id = ?",
    )
    .get(n);
  return mapCoverageRow(row);
}

export function listCoveragesForUnavailability(unavailabilityId) {
  const n = parseId(unavailabilityId);
  if (Number.isNaN(n)) return [];
  return db
    .prepare(
      "SELECT id, unavailability_id, responsibility_id, covered_by FROM coverage WHERE unavailability_id = ? ORDER BY id",
    )
    .all(n)
    .map(mapCoverageRow);
}

export function coverageDuplicateExists(
  unavailabilityId,
  responsibilityId,
  coveringUserId,
  excludeCoverageId,
) {
  const un = parseId(unavailabilityId);
  const rid = parseId(responsibilityId);
  const covUser = parseId(coveringUserId);
  const ex = parseId(excludeCoverageId);
  const row = Number.isNaN(ex)
    ? db
        .prepare(
          "SELECT id FROM coverage WHERE unavailability_id = ? AND responsibility_id = ? AND covered_by = ?",
        )
        .get(un, rid, covUser)
    : db
        .prepare(
          "SELECT id FROM coverage WHERE unavailability_id = ? AND responsibility_id = ? AND covered_by = ? AND id != ?",
        )
        .get(un, rid, covUser, ex);
  return Boolean(row);
}

export function createCoverage({
  unavailabilityId,
  responsibilityId,
  coveringUserId,
}) {
  const result = db
    .prepare(
      "INSERT INTO coverage (unavailability_id, responsibility_id, covered_by) VALUES (?, ?, ?)",
    )
    .run(
      parseId(unavailabilityId),
      parseId(responsibilityId),
      parseId(coveringUserId),
    );
  return findCoverage(result.lastInsertRowid);
}

export function updateCoverageRecord(coverageId, {
  responsibilityId,
  coveringUserId,
}) {
  const n = parseId(coverageId);
  const parts = [];
  const vals = [];
  if (responsibilityId !== undefined) {
    parts.push("responsibility_id = ?");
    vals.push(parseId(responsibilityId));
  }
  if (coveringUserId !== undefined) {
    parts.push("covered_by = ?");
    vals.push(parseId(coveringUserId));
  }
  if (parts.length === 0) return findCoverage(coverageId);
  vals.push(n);
  db.prepare(`UPDATE coverage SET ${parts.join(", ")} WHERE id = ?`).run(
    ...vals,
  );
  return findCoverage(coverageId);
}

export function deleteCoverageById(coverageId) {
  const n = parseId(coverageId);
  const r = db.prepare("DELETE FROM coverage WHERE id = ?").run(n);
  return r.changes > 0;
}

export function datesOrdered(startDate, endDate) {
  const a = new Date(startDate).getTime();
  const b = new Date(endDate).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  return a <= b;
}
