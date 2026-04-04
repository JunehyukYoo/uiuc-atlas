import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Return all tags
router.get('/', async (_req, res) => {
  const tags = await prisma.tag.findMany({});
  res.json(tags);
});

export { router as tagsRouter };