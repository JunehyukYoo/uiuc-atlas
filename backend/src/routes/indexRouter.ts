import { Router, Request, Response } from "express";
import { healthRouter } from "./healthRouter.js";
import { submissionsRouter } from "./submissionsRouter.js";
import { tagsRouter } from "./tagsRouter.js";
import { heatmapRouter } from "./heatmapRouter.js";
import { emotionsRouter } from "./emotionsRouter.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/submissions", submissionsRouter);
router.use("/emotions", emotionsRouter);
router.use("/tags", tagsRouter);
router.use("/heatmap", heatmapRouter);

// PING!
router.get("/ping", (_req: Request, res: Response) => {
  res.json("pong");
});

export { router as indexRouter };
