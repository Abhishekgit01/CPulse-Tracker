import express from "express";
import cors from "cors";
import "./config/loadEnv";

import { ensureDatabaseConnection } from "./middleware/database";
import systemRoutes from "./routes/system";
import { registerRoutes } from "./routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(express.json());
  app.use(systemRoutes);
  app.use(ensureDatabaseConnection);

  registerRoutes(app);

  return app;
}

const app = createApp();

export default app;
