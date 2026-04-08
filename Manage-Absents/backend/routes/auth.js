import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, findUser, publicUser } from "../lib/store.js";
import { JWT_SECRET, requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES },
  );
  res.json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = findUser(req.auth.userId);
  if (!user) {
    return res.status(401).json({ error: "User no longer exists" });
  }
  res.json(publicUser(user));
});

export default router;
