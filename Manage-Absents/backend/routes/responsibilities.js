import { Router } from "express";
import {
  findUser,
  findResponsibility,
  listResponsibilitiesForUser,
  createResponsibility,
  updateResponsibilityDescription,
  deleteResponsibilityById,
} from "../lib/store.js";

const router = Router({ mergeParams: true });

router.get("/", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(listResponsibilitiesForUser(req.params.userId));
});

router.get("/:responsibilityId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const r = findResponsibility(req.params.responsibilityId);
  if (!r || r.userId !== req.params.userId) {
    return res.status(404).json({ error: "Responsibility not found" });
  }
  res.json(r);
});

router.post("/", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const { description } = req.body ?? {};
  if (description === undefined || description === "") {
    return res.status(400).json({ error: "description is required" });
  }
  const row = createResponsibility(req.params.userId, description);
  res.status(201).json(row);
});

router.put("/:responsibilityId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const r = findResponsibility(req.params.responsibilityId);
  if (!r || r.userId !== req.params.userId) {
    return res.status(404).json({ error: "Responsibility not found" });
  }
  const { description } = req.body ?? {};
  if (description !== undefined) {
    updateResponsibilityDescription(req.params.responsibilityId, description);
  }
  res.json(findResponsibility(req.params.responsibilityId));
});

router.delete("/:responsibilityId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const r = findResponsibility(req.params.responsibilityId);
  if (!r || r.userId !== req.params.userId) {
    return res.status(404).json({ error: "Responsibility not found" });
  }
  deleteResponsibilityById(req.params.responsibilityId);
  res.status(204).send();
});

export default router;
