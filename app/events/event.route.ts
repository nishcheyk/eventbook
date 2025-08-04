import { Router } from "express";
import { listEvents, eventDetails, createEvent } from "./event.controller";

const router = Router();

router.get("/", listEvents);
router.get("/:id", eventDetails);

// Remove authMiddleware and adminMiddleware from this route
router.post("/", createEvent);

export default router;
