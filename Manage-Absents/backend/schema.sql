PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    surname TEXT NOT NULL,
    firstname TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS responsibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS unavailability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS coverage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unavailability_id INTEGER NOT NULL,
    responsibility_id INTEGER NOT NULL,
    covered_by INTEGER DEFAULT NULL,
    FOREIGN KEY (unavailability_id) REFERENCES unavailability(id) ON DELETE CASCADE,
    FOREIGN KEY (responsibility_id) REFERENCES responsibility(id) ON DELETE CASCADE,
    FOREIGN KEY (covered_by) REFERENCES user(id) ON DELETE
    SET NULL
);