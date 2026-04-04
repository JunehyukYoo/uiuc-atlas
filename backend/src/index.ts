import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { indexRouter } from "./routes/indexRouter.js";

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

// Setup coors
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Setup routers
app.use("/api", indexRouter);

// Handle uncaught errors
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error details:", err);
  res.status(500).json({
    message: "Unhandled Internal Error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
