import MovieTrailer from "./MovieTrailer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDay,
    faShield,
    faSackDollar,
    faAward,
    faPeopleGroup,
    faStarHalfStroke,
    faStopwatch,
    faBookmark,
    faLanguage,
    faBuilding,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const IMDB_URL = "https://www.imdb.com/title/";

export default function MovieCardModal({ movie, details, onClose, isOpen }) {
    const toggleModal = () => {
        onClose();
    };

    const checkAvailability = (value, property) => {
        return value === "N/A" || value === "" ? `${property} N/A` : value;
    };

    return (
        <>
            {isOpen && (
                <div
                    className="modal fixed z-30 top-0 left-0 right-0 bottom-0 lg:px-52 xl:px-80 bg-gray-700 flex items-center justify-center overflow-y-auto cursor-default"
                    onClick={toggleModal}
                    style={{ display: "grid", placeItems: "center" }}
                >
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8">
                            <h2 className="font-bold text-4xl">
                                {checkAvailability(movie.Title, "Title")}
                            </h2>
                            <p className="uppercase font-medium tracking-widest">
                                {checkAvailability(movie.Type, "Type")} |{" "}
                                <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                                {checkAvailability(movie.Year, "Year")} |{" "}
                                <FontAwesomeIcon icon={faShield} className="mr-2" />
                                {checkAvailability(details.Rated, "Age Rating")}
                            </p>
                            <p>
                                <FontAwesomeIcon icon={faStopwatch} className="mr-2" />
                                {checkAvailability(details.Runtime, "Runtime")}
                            </p>
                            <p>
                                <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                                {checkAvailability(details.Genre, "Genre(s)")}
                            </p>
                            <br />
                            <MovieTrailer movieTitle={movie.Title} movieYear={movie.Year} />
                            <br />
                            <p>{checkAvailability(details.Plot, "Description")}</p>
                            <br />
                            <p className="font-bold text-lg text-left py-4">
                                Additional Information
                            </p>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
                                <div>
                                    <p>
                                        <FontAwesomeIcon icon={faPeopleGroup} className="mr-2" />
                                        Director(s):{" "}
                                        <b>{checkAvailability(details.Director, "")}</b>
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faPeopleGroup} className="mr-2" />
                                        Writer(s): <b>{checkAvailability(details.Writer, "")}</b>
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faPeopleGroup} className="mr-2" />
                                        Top Cast: <b>{checkAvailability(details.Actors, "")}</b>
                                    </p>
                                </div>
                                <div>
                                    {details && details.Ratings && details.Ratings.length > 0 ? (
                                        details.Ratings.map((rating, index) => (
                                            <p key={index}>
                                                <FontAwesomeIcon
                                                    icon={faStarHalfStroke}
                                                    className="mr-2"
                                                />
                                                {rating.Source} Ratings:{" "}
                                                <b>{checkAvailability(rating.Value, "Ratings")}</b>
                                            </p>
                                        ))
                                    ) : (
                                        <p>
                                            <FontAwesomeIcon
                                                icon={faStarHalfStroke}
                                                className="mr-2"
                                            />
                                            Internet Movie Database Ratings: <b>N/A</b>
                                            <br />
                                            <FontAwesomeIcon
                                                icon={faStarHalfStroke}
                                                className="mr-2"
                                            />
                                            Rotten Tomatoes Ratings: <b>N/A</b>
                                            <br />
                                            <FontAwesomeIcon
                                                icon={faStarHalfStroke}
                                                className="mr-2"
                                            />
                                            Metacritic Ratings: <b>N/A</b>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p>
                                        <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                                        Studio: <b>{checkAvailability(details.Production, "")}</b>
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faAward} className="mr-2" />
                                        Awards: <b>{checkAvailability(details.Awards, "")}</b>
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faSackDollar} className="mr-2" />
                                        Box Office:{" "}
                                        <b>{checkAvailability(details.BoxOffice, "")}</b>
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faLanguage} className="mr-2" />
                                        Language(s) Available In:{" "}
                                        <b>{checkAvailability(details.Language, "")}</b>
                                    </p>
                                </div>
                            </div>
                            <br />

                            <div className="flex justify-center">
                                <button
                                    className="w-64 font-bold bg-blue-500 rounded-full p-2 hover:bg-blue-400 transition-all duration-200 ease-in-out"
                                    onClick={() => searchMovies(searchTerm)}
                                >
                                    <a
                                        href={IMDB_URL + movie.imdbID}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Learn More on IMDb
                                    </a>{" "}
                                </button>
                            </div>
                            <br />
                            <div className="flex justify-center">
                                <button
                                    className="w-32 font-bold bg-red-700 p-2 rounded-full hover:bg-red-500 transition-all duration-200 ease-in-out"
                                    onClick={toggleModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
