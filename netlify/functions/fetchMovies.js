const axios = require("axios");

exports.handler = async (event) => {
    const searchTerm = event.queryStringParameters.searchTerm || "";
    const page = event.queryStringParameters.page || "1";
    const API_KEY = process.env.VITE_REACT_APP_OMDB_API_KEY;
    const API_URL = `https://www.omdbapi.com?apikey=${API_KEY}&s=*${encodeURIComponent(
        searchTerm
    )}*&page=${page}`;

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
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};
