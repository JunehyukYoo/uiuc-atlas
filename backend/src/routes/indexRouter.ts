import { Router, Request, Response } from "express";
import { healthRouter } from "./healthRouter";
import { submissionsRouter } from "./submissionsRouter";
import { tagsRouter } from "./tagsRouter";
import { heatmapRouter } from "./heatmapRouter";
import { emotionsRouter } from "./emotionsRouter";

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
