import axios from "axios";
import fs from "fs";
import dotenv from "dotenv"


dotenv.config()

async function generateImage(req, res) {
  try {
    // const { videoTitle, videoTopic } = req.body;

    // console.log(req);
    
    const videoTitle = "how to add js file in vs code";
    const videoTopic = "isme mene bataya hai ke vs code me js file kaise add karte hai";


    // api url 
    
const GEMINI_KEY = process.env.GEMINI_KEY;

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

    // ---------------------------------
    // 🎨 1. Auto Thumbnail Prompt Builder
    // ---------------------------------
    const finalPrompt = `
Create a high-quality, ultra-detailed YouTube thumbnail.

Title: "${videoTitle}"
Topic: "${videoTopic}"

Thumbnail Requirements:
- Bold, high-impact design
- Bright colors, strong contrast
- Professional lighting
- Emotion + expression for attention
- Relevant objects related to "${videoTopic}"
- Cinematic style
- Sharp, clear subject in foreground
- Clean background blur
- No watermark, no text, no logos

Output: A stunning, clickable YouTube thumbnail image.
`;

    // ---------------------------------
    // 🖼 2. Generate Image using Gemini pro
    // ---------------------------------
    
      const geminiResponse = await axios.post(apiUrl, {
    contents: [
      {
        parts: [{ text: finalPrompt }],
      },
    ],
  });


res.status(201).json({geminiResponse})



  } catch (error) {
    console.error("❌ Error generating image:", error.response?.data || error.message);
    return res.status(500).json({ error: "Image Generation Failed" });
  }
}

export default generateImage;
