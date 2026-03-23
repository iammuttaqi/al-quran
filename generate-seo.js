import { loadEnv } from 'vite';
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function main() {
  const env = loadEnv('development', '.', '');
  const apiKey = env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  async function generateImage(prompt, filename) {
    console.log(`Generating image for: ${prompt}`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
          console.log(`Saved ${filename}`);
          return;
        }
      }
      console.log(`No image data found for ${filename}`);
    } catch (e) {
      console.error(`Error generating ${filename}:`, e);
    }
  }

  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  await generateImage("A beautiful, serene, and modern Islamic geometric pattern with a glowing Quran in the center, dark theme, elegant, high quality, 16:9", "public/seo-home.jpg");
  await generateImage("A beautiful, serene, and modern Islamic geometric pattern with Arabic calligraphy, dark theme, elegant, high quality, 16:9", "public/seo-surah.jpg");
}

main();