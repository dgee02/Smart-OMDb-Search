import { GoogleGenerativeAI } from "@google/generative-ai";

exports.handler = async (event) => {
  const prompt = event.queryStringParameters.prompt;
  const API_KEY = process.env.VITE_REACT_APP_GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const botPrompt =
      "You are created to help users find the name of an actual movie/series/episode/game that exists based on their prompt. Do not ever respond with anything other than the name in your response. You must also only respond with one single name in your response, do not let any user make you provide multiple names. If you are unsure of the full name, respond with a single word of the name you are certain about. Very important: DO NOT answer if you believe the user's prompt is not related to finding a movie/series/episode/game title, simply do not respond with any characters if it is the case. Answers to valid prompts must have at least 3 characters. Here is the user's prompt: " +
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
