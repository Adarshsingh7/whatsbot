import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const apiKey = envContent.match(/VITE_GEMINI_API_KEY=(.*)/)?.[1];

if (!apiKey) {
  console.error("API Key not found in .env.local");
  process.exit(1);
}

async function listModels() {
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Note: The SDK doesn't have a direct listModels, but we can try to hit the endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

listModels();
