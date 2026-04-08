import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-with-JWT_SECRET";

if (!process.env.JWT_SECRET) {
  console.warn(
    "[auth] JWT_SECRET non défini — utilisation d’un secret de développement (à configurer en production)",
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.sub;
    const email = payload.email;
    if (typeof userId !== "string" || typeof email !== "string") {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.auth = { userId, email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export { JWT_SECRET };
