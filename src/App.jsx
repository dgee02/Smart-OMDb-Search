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
	const [noResultsMessage, setNoResultsMessage] = useState("");
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
				console.error("Error reaching Gemini AI: ", error);
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
					`/.netlify/functions/fetchMovies?searchTerm=${encodeURIComponent(searchTerm.trim())}&page=${page}`
				);
				if (!response.ok) throw new Error(response.statusText);

				let data = await response.json();

				if (data.Response === "False") {
					setMoviesList([]);
					setNoResultsMessage(
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
			console.error("Error fetching movie titles: ", error);
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
					console.error("Error fetching movie details: ", error);
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
		if (movies.length === 0) {
			setNoResultsMessage(
				"No results found. Please refine your search criteria."
			);
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
		setNoResultsMessage("");
		setUsageMessage("");
	};

	return (
		<div className="p-16 flex justify-center align-middle flex-col overflow-x-hidden text-center">
			<h1 className="font-bold text-5xl">
				Smart OMDb Search
			</h1>
			<div className="flex justify-center">
				<input
					className="w-3/4 my-10 p-4 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
					placeholder="Title*"
					type="text"
					value={searchTerm}
					onChange={(userInput) => {
						setSearchTerm(userInput.target.value);
					}}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							searchMovies(searchTerm);
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
							className="w-4/5 mb-7 flex items-center justify-center p-4 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Any description... (AI will update Title*)"
							value={aiFilters}
							onChange={(e) => setAIFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									searchMovies();
								}
							}}
						/>
					</div>
					<p className="text-lg font-medium pb-6">OR</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-8 px-7 md:px-20 lg:px-28 xl:px-40 2xl:px-72 justify-items-center">
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-4 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Genre(s)"
							value={genreFilters}
							onChange={(e) => setGenreFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									searchMovies(searchTerm);
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-4 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Year(s)"
							value={yearFilters}
							onChange={(e) => setYearFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									searchMovies(searchTerm);
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-4 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Type(s)"
							value={typeFilters}
							onChange={(e) => setTypeFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									searchMovies(searchTerm);
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-4 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Director(s)"
							value={directorFilters}
							onChange={(e) => setDirectorFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									searchMovies(searchTerm);
								}
							}}
						/>
						<input
							className="w-3/4 mb-7 flex items-center justify-center p-4 rounded-full shadow-lg border-none text-lg font-medium outline-none bg-gray-700 focus:bg-gray-600 transition-all duration-200 ease-in-out"
							placeholder="Cast member(s)"
							value={castFilters}
							onChange={(e) => setCastFilters(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									searchMovies(searchTerm);
								}
							}}
						/>
					</div>
				</div>
			)}
			<div className="flex justify-center">
				<button
					className="mx-2 w-36 font-bold bg-blue-500 rounded-full p-2 hover:bg-blue-400 transition-all duration-200 ease-in-out"
					onClick={() => searchMovies(searchTerm)}
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
						Loading <FontAwesomeIcon icon={faSpinner} className="loading-icon ml-1" />
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
					noResultsMessage && (
						<div>
							<p>
								<FontAwesomeIcon icon={faCircleExclamation} className="mr-2" />
								{noResultsMessage}
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
