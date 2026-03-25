import { Router } from 'express';

const router = Router();
// TODO: Replace placeholders
router.get('/', async (_req, res) => {
  res.json({ message: 'Get submissions route' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create submission route', body: req.body });
});

export { router as submissionRouter };