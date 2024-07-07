const axios = require("axios");

exports.handler = async (event) => {
  const API_KEY = process.env.VITE_REACT_APP_YOUTUBE_API_KEY;
  const movieTitle = event.queryStringParameters.movieTitle || "";
  const movieYear = event.queryStringParameters.movieYear || "1";

  const youtubeAPIUrl = "https://www.googleapis.com/youtube/v3/search";

  try {
    const { data } = await axios.get(youtubeAPIUrl, {
      params: {
        key: API_KEY,
        q: `${movieTitle} ${movieYear} Official Trailer`,
        part: "snippet",
        type: "video",
        maxResults: 1,
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTION",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
