import { Router } from 'express';

const router = Router();
// TODO: Replace placeholders
router.get('/', async (_req, res) => {
  res.json({ message: 'Get tags route' });
});

export { router as tagRouter };