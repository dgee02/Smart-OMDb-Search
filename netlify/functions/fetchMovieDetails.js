const axios = require("axios");

exports.handler = async (event) => {
  const { imdbID } = event.queryStringParameters;
  const API_KEY = process.env.VITE_REACT_APP_OMDB_API_KEY;
  const API_URL = `https://www.omdbapi.com?apikey=${API_KEY}&i=${imdbID}`;

  try {
    const { data } = await axios.get(API_URL);
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
      statusCode: error.response.status,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
