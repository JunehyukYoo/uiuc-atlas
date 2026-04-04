import { Router, Request, Response } from "express";
import { Emotion } from "../../generated/prisma/enums.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json(Object.values(Emotion));
});

export { router as emotionsRouter };
