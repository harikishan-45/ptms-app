const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const mode = (process.env.NODE_ENV || "development").toLowerCase();
const candidates = [`.env.${mode}`, ".env"];

for (const candidate of candidates) {
  const envPath = path.resolve(__dirname, "..", "..", candidate);

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
