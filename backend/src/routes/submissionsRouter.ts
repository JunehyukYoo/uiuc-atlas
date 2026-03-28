import { Router } from "express";
import { prisma } from "../lib/prisma";
import crypto from "crypto";
import { createSubmissionSchema } from "../schemas/submissionsSchema";
import { ZodError } from "zod";

const router = Router();

// Get all submissions
router.get("/", async (_req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        status: "VISIBLE",
      },
      include: {
        tag: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = submissions.map((submission) => ({
      id: submission.id,
      latitude: submission.latitude.toNumber(),
      longitude: submission.longitude.toNumber(),
      emotion: submission.emotion,
      intensity: submission.intensity,
      reflection: submission.reflection,
      createdAt: submission.createdAt.toISOString(),
      tag: submission.tag
        ? {
            id: submission.tag.id,
            slug: submission.tag.slug,
            label: submission.tag.label,
          }
        : null,
    }));

    res.json(response);
  } catch (e) {
    console.error("GET /submissions failed:", e);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

// Create a submission
router.post("/", async (req, res) => {
  try {
    const { latitude, longitude, emotion, intensity, reflection, tagSlug } =
      createSubmissionSchema.parse(req.body);

    let deviceToken = req.cookies.deviceToken;

    // Initialize device token if this is first submission
    if (!deviceToken) {
      deviceToken = crypto.randomUUID();

      res.cookie("deviceToken", deviceToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });
    }

    const deviceSession = await prisma.deviceSession.upsert({
      where: { token: deviceToken },
      update: {},
      create: { token: deviceToken },
    });

    let tagId: string | undefined = undefined;

    if (tagSlug) {
      const tag = await prisma.tag.findUnique({
        where: { slug: tagSlug },
      });

      if (!tag) {
        return res.status(400).json({ error: "Invalid tag" });
      }

      tagId = tag.id;
    }

    const submission = await prisma.submission.create({
      data: {
        latitude,
        longitude,
        emotion,
        intensity,
        reflection: reflection ?? null,
        tagId,
        deviceSessionId: deviceSession.id,
      },
      include: {
        tag: true,
      },
    });

    const response = {
      id: submission.id,
      latitude: submission.latitude.toNumber(),
      longitude: submission.longitude.toNumber(),
      emotion: submission.emotion,
      intensity: submission.intensity,
      reflection: submission.reflection,
      createdAt: submission.createdAt.toISOString(),
      tag: submission.tag
        ? {
            id: submission.tag.id,
            slug: submission.tag.slug,
            label: submission.tag.label,
          }
        : null,
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid submission payload",
        issues: error.issues,
      });
    }
    console.error("Failed to create submission:", error);
    res.status(500).json({ error: "Failed to create submission" });
  }
});

export { router as submissionsRouter };
