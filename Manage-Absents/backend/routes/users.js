import { Router } from "express";
import bcrypt from "bcryptjs";
import {
  listUsersForPublicResponse,
  publicUser,
  findUser,
  isEmailTaken,
  createUser,
  updateUserRecord,
  deleteUserById,
} from "../lib/store.js";

const SALT_ROUNDS = 10;

export const registerRouter = Router();

registerRouter.post("/", async (req, res) => {
  const { email, password, surname, firstname } = req.body ?? {};
  if (!email || !password || surname === undefined || firstname === undefined) {
    return res
      .status(400)
      .json({ error: "email, password, surname and firstname are required" });
  }
  if (isEmailTaken(email)) {
    return res.status(409).json({ error: "Email already in use" });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = createUser({ email, passwordHash, surname, firstname });
  res.status(201).json(publicUser(user));
});

const router = Router();

router.get("/", (_req, res) => {
  res.json(listUsersForPublicResponse().map(publicUser));
});

router.get("/:id", (req, res) => {
  const u = findUser(req.params.id);
  if (!u) return res.status(404).json({ error: "User not found" });
  res.json(publicUser(u));
});

router.put("/:id", async (req, res) => {
  const u = findUser(req.params.id);
  if (!u) return res.status(404).json({ error: "User not found" });
  const { email, password, surname, firstname } = req.body ?? {};
  if (email !== undefined) {
    if (isEmailTaken(email, u.id)) {
      return res.status(409).json({ error: "Email already in use" });
    }
  }
  const passwordHash =
    password !== undefined
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : undefined;
  const updated = updateUserRecord(u.id, {
    email,
    passwordHash,
    surname,
    firstname,
  });
  res.json(publicUser(updated));
});

router.delete("/:id", (req, res) => {
  if (!findUser(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }
  deleteUserById(req.params.id);
  res.status(204).send();
});

export default router;
