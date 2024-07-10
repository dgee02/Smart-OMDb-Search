import React, { useState, useEffect } from "react";
import MovieCardModal from "./MovieCardModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faShield } from "@fortawesome/free-solid-svg-icons";

const MovieCard = ({ movie, searchTerm }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [details, setDetails] = useState({});

	// Trim leading and trailing spaces
	let highlightTerm = searchTerm.trim();

	// Split the highlightTerm into individual words
	let highlightTerms = highlightTerm.split(" ");

	// Create a regular expression that matches any of the words in highlightTerm
	const highlightTermRegex = new RegExp(highlightTerms.join("|"), "gi");

	const highlightedTitle = movie.Title.replace(
		highlightTermRegex,
		(match) => `<mark>${match}</mark>`
	);

	// Modal functions
	const handleCardClick = async () => {
		setIsModalOpen(true);
		document.body.classList.add("no-scroll");
		document.body.classList.add("no-pointer-events");
		await fetchDetails();
	};
	const handleCloseModal = () => {
		setIsModalOpen(false);
		document.body.classList.remove("no-scroll");
		document.body.classList.remove("no-pointer-events");
	};

	// Fetch movie details
	const fetchMovieDetails = async () => {
		try {
			const response = await fetch(
				`/.netlify/functions/fetchMovieDetails?imdbID=${movie.imdbID}`
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			setDetails(data);
		} catch (error) {
			console.error("Error fetching movie details: ", error);
		}
	};

	useEffect(() => {
		fetchMovieDetails();
	}, []);

	return (
		<div
			className="movie m-6 relative rounded-3xl overflow-hidden border-0 transition-all duration-400 ease-in-out shadow-lg hover:cursor-pointer"
			onClick={handleCardClick}
		>
			<div className="movie absolute p-4 w-full opacity-0 top-0 transition-all duration-400 ease-in-out"></div>
			<div className="w-full h-full">
				<img
					src={
						movie.Poster !== "N/A"
							? movie.Poster
							: "https://dummyimage.com/400x600/c9c9c9/7a7a7a&text=No+Image+Available"
					}
					alt={movie.Title}
				/>
			</div>
			<div className="z-10 bg-gray-700 p-4 absolute bottom-0 left-0 right-0">
				<h3
					className="font-bold"
					dangerouslySetInnerHTML={{ __html: highlightedTitle }}
				></h3>
				<span className="capitalize text-xs font-medium tracking-widest">
					{movie.Type} |{" "}
					<FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
					{movie.Year} | <FontAwesomeIcon icon={faShield} className="mr-1" />
					{details.Rated}
				</span>
			</div>
			{isModalOpen && (
				<MovieCardModal
					movie={movie}
					details={details}
					onClose={handleCloseModal}
					isOpen={isModalOpen}
				/>
			)}
		</div>
	);
};

export default MovieCard;
