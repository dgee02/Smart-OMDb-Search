import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const MovieTrailer = ({ movieTitle, movieYear }) => {
  const [trailerVideoId, setTrailerVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset states when movie changes
    setIsLoading(true);
    setTrailerVideoId(null);

    // Fetch movie trailer
    const fetchTrailer = async () => {
      try {
        const response = await axios.get(
          `/.netlify/functions/fetchMovieTrailer?movieTitle=${movieTitle}&movieYear=${movieYear}`
        );

        if (response.data.items && response.data.items.length > 0) {
          const videoId = response.data.items[0].id.videoId;
          setTrailerVideoId(videoId);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching movie trailer: ", error);
        setIsLoading(false);
      }
    };

    // Debounce fetch to prevent too many API calls
    const debounceFetch = setTimeout(() => {
      fetchTrailer();
    }, 300);

    // Cleanup on effect re-run or component unmount
    return () => clearTimeout(debounceFetch);
  }, [movieTitle, movieYear]);

  return (
    <div className="flex justify-center">
      {isLoading ? (
        <p className="text-center">
          Loading YouTube Player{" "}
          <FontAwesomeIcon
            icon={faSpinner}
            className="mr-2 loading-icon"
            spin
          />{" "}
        </p>
      ) : trailerVideoId ? (
        <iframe
          className="md:w-96 md:h-52"
          src={`https://www.youtube.com/embed/${trailerVideoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <p className="text-center">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="mr-2"
            style={{ color: "red" }}
          />{" "}
          YouTube Player N/A
        </p>
      )}
    </div>
  );
};

export default MovieTrailer;
