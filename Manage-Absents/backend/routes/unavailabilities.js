import { Router } from "express";
import {
  findUser,
  findUnavailability,
  listUnavailabilitiesForUser,
  createUnavailability,
  updateUnavailabilityDates,
  deleteUnavailabilityById,
  datesOrdered,
} from "../lib/store.js";

const router = Router({ mergeParams: true });

router.get("/", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(listUnavailabilitiesForUser(req.params.userId));
});

router.get("/:unavailabilityId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const u = findUnavailability(req.params.unavailabilityId);
  if (!u || u.userId !== req.params.userId) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  res.json(u);
});

router.post("/", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const { startDate, endDate } = req.body ?? {};
  if (startDate === undefined || endDate === undefined) {
    return res
      .status(400)
      .json({ error: "startDate and endDate are required" });
  }
  if (!datesOrdered(startDate, endDate)) {
    return res
      .status(400)
      .json({ error: "startDate must be before or equal to endDate" });
  }
  const row = createUnavailability(req.params.userId, startDate, endDate);
  res.status(201).json(row);
});

router.put("/:unavailabilityId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const u = findUnavailability(req.params.unavailabilityId);
  if (!u || u.userId !== req.params.userId) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  const { startDate, endDate } = req.body ?? {};
  const nextStart = startDate !== undefined ? startDate : u.startDate;
  const nextEnd = endDate !== undefined ? endDate : u.endDate;
  if (!datesOrdered(nextStart, nextEnd)) {
    return res
      .status(400)
      .json({ error: "startDate must be before or equal to endDate" });
  }
  updateUnavailabilityDates(req.params.unavailabilityId, startDate, endDate);
  res.json(findUnavailability(req.params.unavailabilityId));
});

router.delete("/:unavailabilityId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const u = findUnavailability(req.params.unavailabilityId);
  if (!u || u.userId !== req.params.userId) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  deleteUnavailabilityById(req.params.unavailabilityId);
  res.status(204).send();
});

export default router;
