import { Router } from "express";
import {
  findUser,
  findResponsibility,
  findUnavailability,
  findCoverage,
  listCoveragesForUnavailability,
  coverageDuplicateExists,
  createCoverage,
  updateCoverageRecord,
  deleteCoverageById,
} from "../lib/store.js";

const router = Router({ mergeParams: true });

function resolveUnavailabilityForCoverage(userId, unavailabilityId) {
  const unav = findUnavailability(unavailabilityId);
  if (!unav || unav.userId !== userId) return null;
  return unav;
}

function validateCoveragePayload(
  absentUserId,
  coveringUserId,
  responsibilityId,
) {
  if (coveringUserId == null) {
    return { error: "coveringUserId is required", status: 400 };
  }
  if (!findUser(coveringUserId)) {
    return { error: "Covering user not found", status: 404 };
  }
  if (coveringUserId === absentUserId) {
    return { error: "Covering user cannot be the absent user", status: 400 };
  }
  const resp = findResponsibility(responsibilityId);
  if (!resp || resp.userId !== absentUserId) {
    return {
      error: "Responsibility not found or not owned by absent user",
      status: 400,
    };
  }
  return null;
}

router.get("/", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const unav = resolveUnavailabilityForCoverage(
    req.params.userId,
    req.params.unavailabilityId,
  );
  if (!unav) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  res.json(listCoveragesForUnavailability(unav.id));
});

router.get("/:coverageId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const unav = resolveUnavailabilityForCoverage(
    req.params.userId,
    req.params.unavailabilityId,
  );
  if (!unav) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  const c = findCoverage(req.params.coverageId);
  if (!c || c.unavailabilityId !== unav.id) {
    return res.status(404).json({ error: "Coverage not found" });
  }
  res.json(c);
});

router.post("/", (req, res) => {
  const absentUserId = req.params.userId;
  if (!findUser(absentUserId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const unav = resolveUnavailabilityForCoverage(
    absentUserId,
    req.params.unavailabilityId,
  );
  if (!unav) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  const { coveringUserId, responsibilityId } = req.body ?? {};
  if (!coveringUserId || !responsibilityId) {
    return res
      .status(400)
      .json({ error: "coveringUserId and responsibilityId are required" });
  }
  const invalid = validateCoveragePayload(
    absentUserId,
    coveringUserId,
    responsibilityId,
  );
  if (invalid) {
    return res.status(invalid.status).json({ error: invalid.error });
  }
  if (
    coverageDuplicateExists(
      unav.id,
      responsibilityId,
      coveringUserId,
      undefined,
    )
  ) {
    return res.status(409).json({ error: "This coverage already exists" });
  }
  const row = createCoverage({
    unavailabilityId: unav.id,
    responsibilityId,
    coveringUserId,
  });
  res.status(201).json(row);
});

router.put("/:coverageId", (req, res) => {
  const absentUserId = req.params.userId;
  if (!findUser(absentUserId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const unav = resolveUnavailabilityForCoverage(
    absentUserId,
    req.params.unavailabilityId,
  );
  if (!unav) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  const c = findCoverage(req.params.coverageId);
  if (!c || c.unavailabilityId !== unav.id) {
    return res.status(404).json({ error: "Coverage not found" });
  }
  const { coveringUserId, responsibilityId } = req.body ?? {};
  const nextCovering =
    coveringUserId !== undefined ? coveringUserId : c.coveringUserId;
  const nextResp =
    responsibilityId !== undefined ? responsibilityId : c.responsibilityId;
  const invalid = validateCoveragePayload(absentUserId, nextCovering, nextResp);
  if (invalid) {
    return res.status(invalid.status).json({ error: invalid.error });
  }
  if (
    coverageDuplicateExists(
      unav.id,
      nextResp,
      nextCovering,
      req.params.coverageId,
    )
  ) {
    return res.status(409).json({ error: "This coverage already exists" });
  }
  updateCoverageRecord(req.params.coverageId, {
    responsibilityId: nextResp,
    coveringUserId: nextCovering,
  });
  res.json(findCoverage(req.params.coverageId));
});

router.delete("/:coverageId", (req, res) => {
  if (!findUser(req.params.userId)) {
    return res.status(404).json({ error: "User not found" });
  }
  const unav = resolveUnavailabilityForCoverage(
    req.params.userId,
    req.params.unavailabilityId,
  );
  if (!unav) {
    return res.status(404).json({ error: "Unavailability not found" });
  }
  const c = findCoverage(req.params.coverageId);
  if (!c || c.unavailabilityId !== unav.id) {
    return res.status(404).json({ error: "Coverage not found" });
  }
  deleteCoverageById(req.params.coverageId);
  res.status(204).send();
});

export default router;
