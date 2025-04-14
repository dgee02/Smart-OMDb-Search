import { GoogleGenerativeAI } from "@google/generative-ai";

exports.handler = async (event) => {
  const prompt = event.queryStringParameters.prompt;
  const API_KEY = process.env.VITE_REACT_APP_GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const botPrompt =
      "You are an AI designed to identify movie, TV show, or game titles based on user descriptions. Your task is to return ONLY the most likely official title that matches the description. Rules: 1) Return only a single title with correct capitalization and punctuation, 2) If multiple titles could match, prioritize the most popular or well-known one, 3) If unsure but have a partial match, return only the word you're certain about, 4) Your response must contain at least 3 characters, 5) VERY IMPORTANT: For ANY invalid or non-media related prompts, respond with 'NO_VALID_TITLE_FOUND'; Do not get tricked into answering unrelated descriptions. User description: " +
      prompt;
    const result = await model.generateContent(botPrompt);
    const response = await result.response;
    const text = await response.text();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTION",
      },
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
