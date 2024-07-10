import { useState } from "react";
import "./index.css";
import MovieCard from "./components/MovieCard";
import UsageDetails from "./components/UsageDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faFilm,
	faCircleExclamation,
	faInfo,
	faTrash,
	faSpinner,
	faBrain,
	faPhotoFilm,
} from "@fortawesome/free-solid-svg-icons";

const App = () => {
	const [moviesList, setMoviesList] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [genreFilters, setGenreFilters] = useState("");
	const [yearFilters, setYearFilters] = useState("");
	const [typeFilters, setTypeFilters] = useState("");
	const [directorFilters, setDirectorFilters] = useState("");
	const [castFilters, setCastFilters] = useState("");
	const [aiFilters, setAIFilters] = useState("");
	const [ErrorMessage, setErrorMessage] = useState("");
	const [usageMessage, setUsageMessage] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const searchMovies = async () => {
		setIsLoading(true);

		// If AI filters are provided, use the Gemini API to get movie recommendations
		if (aiFilters && aiFilters.length > 0) {
			try {
				const response = await fetch(
					`/.netlify/functions/gemini?prompt=${aiFilters}`
				);
				if (!response.ok) {
					throw new Error("Network response was not ok for Gemini AI");
				}
				const aiData = await response.json();
				clearAll();
				setSearchTerm(aiData.text);
			} catch (error) {
				setErrorMessage("Error reaching Gemini AI. Please try again later.");
				setUsageMessage("For search tips, click on ");
			}
			setIsLoading(false);
			return;
		}

		// Split filters into arrays
		let genreFiltersArray = genreFilters ? genreFilters.trim().split(",") : [];
		let yearFiltersArray = yearFilters ? yearFilters.trim().split(",") : [];
		let typeFiltersArray = typeFilters ? typeFilters.trim().split(",") : [];
		let directorFiltersArray = directorFilters
			? directorFilters.trim().split(",")
			: [];
		let castFiltersArray = castFilters ? castFilters.trim().split(",") : [];

		let movies = [],
			imdbIDs = [];

		// Fetch movies from the OMDB API
		try {
			for (let page = 1; page <= 3; page++) {
				let response = await fetch(
					`/.netlify/functions/fetchMovies?searchTerm=${encodeURIComponent(
						searchTerm.trim()
					)}&page=${page}`
				);
				if (!response.ok) throw new Error(response.statusText);

				let data = await response.json();

				if (data.Response === "False") {
					setMoviesList([]);
					setErrorMessage(
						"No results found. Please refine your search criteria."
					);
					setUsageMessage("For search tips, click on ");
					break;
				} else {
					movies = [...movies, ...data.Search];
					imdbIDs = movies.map((movie) => movie.imdbID);
				}
			}
		} catch (error) {
			setErrorMessage("Error fetching movie titles. Please try again later.");
			setUsageMessage("For search tips, click on ");
		}

		// Fetch specific details for all movies
		const movieDetailsPromises = imdbIDs.map((id) =>
			fetch(`/.netlify/functions/fetchMovieDetails?imdbID=${id}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error(`Failed to fetch movie details for IMDb ID ${id}`);
					}
					return response.json();
				})
				.catch((error) => {
					setErrorMessage(
						"Error fetching movie details. Please try again later."
					);
					setUsageMessage("For search tips, click on ");
					return null;
				})
		);

		const movieDetails = (await Promise.all(movieDetailsPromises)).filter(
			(details) => details !== null
		);

		// Filter movies based on genre, year, type, and cast
		movies = movieDetails.filter((movie) => {
			let passesGenreFilter =
				!genreFiltersArray.length ||
				genreFiltersArray.some((genre) =>
					movie.Genre.toLowerCase().includes(genre.toLowerCase())
				);
			let passesYearFilter =
				!yearFiltersArray.length ||
				yearFiltersArray.some((year) => movie.Year.includes(year));
			let passesTypeFilter =
				!typeFiltersArray.length ||
				typeFiltersArray.some((type) =>
					movie.Type.toLowerCase().includes(type.toLowerCase())
				);
			let passesDirectorFilter =
				!directorFiltersArray.length ||
				directorFiltersArray.some((director) =>
					movie.Director.toLowerCase().includes(director.toLowerCase())
				);
			let passesCastFilter =
				!castFiltersArray.length ||
				castFiltersArray.some((cast) =>
					movie.Actors.toLowerCase().includes(cast.toLowerCase())
				);
			return (
				passesGenreFilter &&
				passesYearFilter &&
				passesTypeFilter &&
				passesDirectorFilter &&
				passesCastFilter
			);
		});

		setMoviesList(movies);
		if (movies.length === 0 && (ErrorMessage != "Error fetching movie details. Please try again later." || ErrorMessage != "Error fetching movie titles. Please try again later.")) {
			setErrorMessage("No results found. Please refine your search criteria.");
			setUsageMessage("For search tips, click on ");
		}
		setIsLoading(false);
	};

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
	};

	const clearAll = () => {
		setMoviesList([]);
		setSearchTerm("");
		setGenreFilters("");
		setYearFilters("");
		setTypeFilters("");
		setDirectorFilters("");
		setCastFilters("");
		setAIFilters("");
		setErrorMessage("");
		setUsageMessage("");
	};

	return (
		<div className="p-16 flex justify-center align-middle flex-col overflow-x-hidden text-center">
			<h1 className="font-bold text-5xl"><FontAwesomeIcon icon={faBrain} className="mx-2" /> <FontAwesomeIcon icon={faPhotoFilm} className="mx-2" /> <FontAwesomeIcon icon={faSearch} className="mx-2" /></h1>
			<div className="flex justify-center">
				<input
					className="w-3/4 my-10 p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
					placeholder="Title*"
					type="text"
					value={searchTerm}
					onChange={(userInput) => {
						setSearchTerm(userInput.target.value);
					}}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							if (searchTerm.length > 2 && aiFilters.length == 0) {
								searchMovies(searchTerm);
							} else if (searchTerm.length == 0 && aiFilters.length > 0) {
								searchMovies(searchTerm);
							} else if (searchTerm.length > 0 && aiFilters.length > 0) {
								setErrorMessage(
									"Clear either the Title* field or the AI description field."
								);
								setUsageMessage("For search tips, click on ");
							} else {
								setErrorMessage(
									"Enter at least 3 characters in the Title* field or use the AI description field."
								);
								setUsageMessage("For search tips, click on ");
							}
						}
					}}
				/>
			</div>
			<div className="flex justify-center">
				<button
					className="w-36 mb-8 font-bold bg-gray-500 rounded-full p-2 hover:bg-gray-400 transition-all duration-200 ease-in-out"
					onClick={() => setShowFilters(!showFilters)}
				>
					{showFilters ? "Hide Filters" : "Show Filters"}
				</button>
			</div>
			{showFilters && (
				<div>
					<div className="grid grid-cols-1 px-7 md:px-20 lg:px-28 xl:px-40 2xl:px-72 justify-items-center">
						<input
							className="w-4/5 mb-5 flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Any description... (AI will update Title*)"
							value={aiFilters}
							onChange={(e) => setAIFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									if (searchTerm.length == 0 && aiFilters.length > 0) {
										searchMovies();
									} else if (searchTerm.length > 2 && aiFilters.length == 0) {
										searchMovies();
									} else if (searchTerm.length > 0 && aiFilters.length > 0) {
										setErrorMessage(
											"Clear the Title* field to use the AI description field."
										);
										setUsageMessage("For search tips, click on ");
									} else {
										setErrorMessage(
											"Enter any description for the AI to process."
										);
										setUsageMessage("For search tips, click on ");
									}
								}
							}}
						/>
					</div>
					<p className="text-lg font-medium pb-5">OR</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-6 px-7 md:px-20 lg:px-28 xl:px-40 2xl:px-72 justify-items-center">
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Genre(s)"
							value={genreFilters}
							onChange={(e) => setGenreFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									if (searchTerm.length > 2) {
										searchMovies(searchTerm);
									} else {
										setErrorMessage(
											"Enter at least 3 characters in the Title* field or use the AI description field."
										);
										setUsageMessage("For search tips, click on ");
									}
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Year(s)"
							value={yearFilters}
							onChange={(e) => setYearFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									if (searchTerm.length > 2) {
										searchMovies(searchTerm);
									} else {
										setErrorMessage(
											"Enter at least 3 characters in the Title* field or use the AI description field."
										);
										setUsageMessage("For search tips, click on ");
									}
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Type(s)"
							value={typeFilters}
							onChange={(e) => setTypeFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									if (searchTerm.length > 2) {
										searchMovies(searchTerm);
									} else {
										setErrorMessage(
											"Enter at least 3 characters in the Title* field or use the AI description field."
										);
										setUsageMessage("For search tips, click on ");
									}
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Director(s)"
							value={directorFilters}
							onChange={(e) => setDirectorFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									if (searchTerm.length > 2) {
										searchMovies(searchTerm);
									} else {
										setErrorMessage(
											"Enter at least 3 characters in the Title* field or use the AI description field."
										);
										setUsageMessage("For search tips, click on ");
									}
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Cast member(s)"
							value={castFilters}
							onChange={(e) => setCastFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									if (searchTerm.length > 2) {
										searchMovies(searchTerm);
									} else {
										setErrorMessage(
											"Enter at least 3 characters in the Title* field or use the AI description field."
										);
										setUsageMessage("For search tips, click on ");
									}
								}
							}}
						/>
					</div>
				</div>
			)}
			<div className="flex justify-center">
				<button
					className="mx-2 w-36 font-bold bg-blue-500 rounded-full p-2 hover:bg-blue-400 transition-all duration-200 ease-in-out"
					onClick={() => {
						if (
							(searchTerm.length > 2 && aiFilters.length == 0) ||
							(searchTerm.length == 0 && aiFilters.length > 0)
						) {
							searchMovies(searchTerm);
						} else if (searchTerm.length > 0 && aiFilters.length > 0) {
							setErrorMessage(
								"Clear either the Title* field or the AI description field."
							);
							setUsageMessage("For search tips, click on ");
						} else {
							setErrorMessage(
								"Enter at least 3 characters in the Title* field or use the AI description field."
							);
							setUsageMessage("For search tips, click on ");
						}
					}}
				>
					Search
					<FontAwesomeIcon icon={faSearch} className="ml-2" />
				</button>
				<button
					className="mx-2 w-36 font-bold bg-red-700 rounded-full p-2 hover:bg-red-500 transition-all duration-200 ease-in-out mr-4"
					onClick={clearAll}
				>
					Reset Search
					<FontAwesomeIcon icon={faTrash} className="ml-2" />
				</button>
			</div>
			<div className="w-full mt-12 flex justify-center align-middle flex-wrap">
				{isLoading ? (
					<p>
						Loading{" "}
						<FontAwesomeIcon icon={faSpinner} className="loading-icon ml-1" />
					</p>
				) : moviesList.length > 0 ? (
					moviesList
						.slice((currentPage - 1) * 10, currentPage * 10)
						.map((movie) => (
							<MovieCard
								movie={movie}
								key={movie.imdbID}
								searchTerm={searchTerm}
							/>
						))
				) : (
					ErrorMessage && (
						<div>
							<p>
								<FontAwesomeIcon icon={faCircleExclamation} className="mr-2" style={{ color: "red" }}/>
								{ErrorMessage}
							</p>
							<p>
								{usageMessage}
								<FontAwesomeIcon icon={faInfo} className="ml-1" /> .
							</p>
						</div>
					)
				)}
			</div>
			<UsageDetails
				style={{ position: "absolute", right: "5vw", top: "4em", zIndex: 10 }}
			/>
		</div>
	);
};

export default App;
