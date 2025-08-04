import express from "express";
import {
  createEventController,
  listEvents,
  eventDetails,
} from "./event.controller";
import authMiddleware from "../common/middleware/auth.middleware";

const router = express.Router();

router.get("/", listEvents); 
router.get("/:id", eventDetails); 
router.post("/", authMiddleware, createEventController); // protected create event



export default router;
