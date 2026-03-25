
import { Router, Request, Response } from 'express';
import { healthRouter } from './healthRouter';
import { submissionRouter } from './submissionRouter';
import { tagRouter } from './tagRouter';

const router = Router();

router.use('/health', healthRouter);
router.use('/submission', submissionRouter);
router.use('/tag', tagRouter);

// PING!
router.get('/ping', (_req: Request, res: Response) => {
    res.json('pong')
});

export { router as indexRouter };