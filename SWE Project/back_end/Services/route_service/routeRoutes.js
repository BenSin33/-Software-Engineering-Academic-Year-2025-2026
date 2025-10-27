import express from "express";
import { getRoutes } from "./routeController.js";

const router = express.Router();
router.get("/", getRoutes);
export default router;
