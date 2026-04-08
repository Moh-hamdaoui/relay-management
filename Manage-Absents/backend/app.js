import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import usersRouter, { registerRouter } from "./routes/users.js";
import responsibilitiesRouter from "./routes/responsibilities.js";
import unavailabilitiesRouter from "./routes/unavailabilities.js";
import coveragesRouter from "./routes/coverages.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();

app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/users", registerRouter);

app.use(requireAuth);

app.use(
  "/users/:userId/unavailabilities/:unavailabilityId/coverages",
  coveragesRouter,
);
app.use("/users/:userId/unavailabilities", unavailabilitiesRouter);
app.use("/users/:userId/responsibilities", responsibilitiesRouter);
app.use("/users", usersRouter);

export default app;
