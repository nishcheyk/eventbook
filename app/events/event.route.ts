import express from "express";
import {
  createEventController,
  listEvents,
  eventDetails,
} from "./event.controller";
import { authenticator } from "../common/middlewares/auth.middleware";

const router = express.Router();

router.get("/", authenticator(), listEvents);
router.get("/:id", eventDetails);
router.post("/", authenticator(true), createEventController); // protected create event

export default router;
