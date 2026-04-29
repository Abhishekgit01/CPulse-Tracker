import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envCandidates = [
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envCandidates) {
  if (!fs.existsSync(envPath)) {
    continue;
  }

  dotenv.config({ path: envPath });
  break;
}
