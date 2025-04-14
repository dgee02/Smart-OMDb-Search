import { useState, useRef, useEffect } from "react";
import "./index.css";
import MovieCard from "./components/MovieCard";
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
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [titleUpdatedByAI, setTitleUpdatedByAI] = useState(false);
	const titleInputRef = useRef(null);
	const aiInputRef = useRef(null);

	useEffect(() => {
		if (titleUpdatedByAI && titleInputRef.current) {
			titleInputRef.current.classList.add("highlight");
			const timeout = setTimeout(() => {
				titleInputRef.current.classList.remove("highlight");
				setTitleUpdatedByAI(false);
			}, 5000);
			return () => clearTimeout(timeout);
		}
	}, [titleUpdatedByAI]);

	const searchMovies = async () => {
		setIsLoading(true);

		// If AI filters are provided, use the Gemini API to get movie recommendations
		if (aiFilters && aiFilters.length > 0) {
			try {
				const response = await fetch(
					`/.netlify/functions/gemini?prompt=${aiFilters}`
				);
				if (!response.ok) {
					throw new Error("Network response was not ok for AI");
				}
				const aiData = await response.json();
				clearAll();
				if (!aiData.text || aiData.text.length < 3 || aiData.text.includes("NO_VALID_TITLE_FOUND")) {
					setSearchTerm("");
				}
				else {
					setSearchTerm(aiData.text);
				}
				setTitleUpdatedByAI(true);
			} catch (error) {
				setErrorMessage("Unable to connect to AI. Please try again or search by title instead.");
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
						"No results found for your search. Try broader keywords or a different title."
					);
					break;
				} else {
					movies = [...movies, ...data.Search];
					imdbIDs = movies.map((movie) => movie.imdbID);
				}
			}
		} catch (error) {
			setErrorMessage("Connection issue: Unable to reach movie database. Please check your internet and try again.");
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
						"Connection issue: Unable to reach movie database. Please check your internet and try again."
					);
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
		if (movies.length === 0 && (ErrorMessage != "Connection issue: Unable to reach movie database. Please check your internet and try again." || ErrorMessage != "Error fetching movie titles. Please try again later.")) {
			setErrorMessage("No results found. Please refine your search criteria.");
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
	};

	return (
		<div className="py-10 px-4 md:px-10 lg:px-20 xl:px-40 flex justify-center align-middle flex-col overflow-x-hidden text-center">
			<h1 className="font-bold text-5xl pb-10">OMDb Search</h1>
			<div className="flex justify-center flex-col items-center">
				<label htmlFor="search-title" className="text-left w-full mb-1 ml-2">Title <span className="text-red-500">*</span></label>
				<div className="relative w-full mb-8">
					<input
						id="search-title"
						ref={titleInputRef}
						className="w-full p-3.5 pl-4 pr-24 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
						placeholder="Avengers: Endgame"
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
										"Please use only one search method: either enter a Title OR use AI description, not both."
									);
								} else {
									setErrorMessage(
										"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
									);
								}
							}
						}}
					/>
					<div className="absolute right-2 top-1/2 -translate-y-1/2 flex">
						<button
							aria-label="Search"
							className="h-10 w-10 flex items-center justify-center bg-blue-500 rounded-full hover:bg-blue-400 transition-all duration-200 ease-in-out mr-2"
							onClick={() => {
								if (
									(searchTerm.length > 2 && aiFilters.length == 0) ||
									(searchTerm.length == 0 && aiFilters.length > 0)
								) {
									searchMovies();
								} else if (searchTerm.length > 0 && aiFilters.length > 0) {
									setErrorMessage(
										"Please use only one search method: either enter a Title OR use AI description, not both."
									);
								} else {
									setErrorMessage(
										"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
									);
								}
							}}
						>
							<FontAwesomeIcon icon={faSearch} />
						</button>
						<button
							aria-label="Clear search"
							className="h-10 w-10 flex items-center justify-center bg-red-700 rounded-full hover:bg-red-500 transition-all duration-200 ease-in-out"
							onClick={clearAll}
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					</div>
				</div>
			</div>
			<div className="flex justify-center">
				<button
					className="w-36 mb-4 font-bold bg-gray-500 rounded-full p-2 hover:bg-gray-400 transition-all duration-200 ease-in-out"
					onClick={() => setShowFilters(!showFilters)}
				>
					{showFilters ? "Hide Tools" : "Show Tools"}
				</button>
			</div>
			{showFilters && (
				<div className="bg-gray-500 rounded-3xl p-2 mb-4">
					<div className="grid grid-cols-1 justify-items-center">
						<p className="text-lg font-bold">Use AI</p>
						<div className="w-full">
							<label htmlFor="ai-description" className="block text-left mb-1 ml-2">Description</label>
							<div className="relative w-full">
								<input
									id="ai-description"
									ref={aiInputRef}
									className="w-full mb-4 flex items-center justify-center p-3.5 pl-4 pr-12 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
									placeholder="Superhero team tries to undo a catastrophic event"
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
													"Please use only one search method: either enter a Title OR use AI description, not both."
												);
											} else {
												setErrorMessage(
													"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
												);
											}
										}
									}}
								/>
								<div className="absolute right-2 top-1/2 -translate-y-1/2 flex">
									<button
										aria-label="Use AI to find title"
										className="h-10 w-10 flex items-center justify-center bg-purple-600 rounded-full hover:bg-purple-500 transition-all duration-200 ease-in-out"
										onClick={() => {
											if (searchTerm.length == 0 && aiFilters.length > 0) {
												searchMovies();
											} else if (searchTerm.length > 0 && aiFilters.length > 0) {
												setErrorMessage(
													"Please use only one search method: either enter a Title OR use AI description, not both."
												);
											} else {
												setErrorMessage(
													"Please enter a description for the AI to process."
												);
											}
										}}
									>
										<FontAwesomeIcon icon={faBrain} />
									</button>
								</div>
							</div>
						</div>
						<p className="text-xs text-gray-300 mb-3">AI may not respond to unrelated or inappropriate prompts</p>
					</div>
					<div className="flex items-center justify-center w-full mb-5">
						<div className="flex-grow h-px bg-gray-400 mx-4 max-w-[50%]"></div>
						<p className="text-lg font-bold px-4">OR</p>
						<div className="flex-grow h-px bg-gray-400 mx-4 max-w-[50%]"></div>
					</div>
					<p className="text-lg font-bold">Use Filters</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-4 justify-items-center">
						<div className="w-full">
							<label htmlFor="genre-filter" className="block text-left mb-1 ml-2">Genre(s)</label>
							<input
								id="genre-filter"
								className="w-full flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
								placeholder="Action,Adventure,Sci-Fi"
								value={genreFilters}
								onChange={(e) => setGenreFilters(e.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										if (searchTerm.length > 2) {
											searchMovies(searchTerm);
										} else {
											setErrorMessage(
												"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
											);
										}
									}
								}}
							/>
						</div>
						<div className="w-full">
							<label htmlFor="year-filter" className="block text-left mb-1 ml-2">Year(s)</label>
							<input
								id="year-filter"
								className="w-full flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
								placeholder="2019"
								value={yearFilters}
								onChange={(e) => setYearFilters(e.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										if (searchTerm.length > 2) {
											searchMovies(searchTerm);
										} else {
											setErrorMessage(
												"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
											);
										}
									}
								}}
							/>
						</div>
						<div className="w-full">
							<label htmlFor="type-filter" className="block text-left mb-1 ml-2">Type(s)</label>
							<input
								id="type-filter"
								className="w-full flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
								placeholder="Movie"
								value={typeFilters}
								onChange={(e) => setTypeFilters(e.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										if (searchTerm.length > 2) {
											searchMovies(searchTerm);
										} else {
											setErrorMessage(
												"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
											);
										}
									}
								}}
							/>
						</div>
						<div className="w-full">
							<label htmlFor="director-filter" className="block text-left mb-1 ml-2">Director(s)</label>
							<input
								id="director-filter"
								className="w-full flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
								placeholder="Russo"
								value={directorFilters}
								onChange={(e) => setDirectorFilters(e.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										if (searchTerm.length > 2) {
											searchMovies(searchTerm);
										} else {
											setErrorMessage(
												"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
											);
										}
									}
								}}
							/>
						</div>
						<div className="w-full">
							<label htmlFor="cast-filter" className="block text-left mb-1 ml-2">Cast member(s)</label>
							<input
								id="cast-filter"
								className="w-full flex items-center justify-center p-3.5 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
								placeholder="Robert Downey Jr.,Chris Evans"
								value={castFilters}
								onChange={(e) => setCastFilters(e.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										if (searchTerm.length > 2) {
											searchMovies(searchTerm);
										} else {
											setErrorMessage(
												"Please enter at least 3 characters in the Title field or describe a movie for AI search in the Tools section."
											);
										}
									}
								}}
							/>
						</div>
					</div>
					<p className="text-xs text-gray-300 mb-2">Tip: For multiple values in any filter, use commas without spaces (example: Action,Comedy)</p>
				</div>
			)}
			<div className="w-full flex justify-center align-middle flex-wrap">
				{isLoading ? (
					<p className="mt-4">
						Loading Results{" "}
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
							<p className="mt-4">
								<FontAwesomeIcon
									icon={faCircleExclamation}
									className="mr-2"
									style={{ color: "red" }}
								/>
								{ErrorMessage}
							</p>
						</div>
					)
				)}
			</div>
		</div>
	);
};

export default App;
