import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";

const FAQ = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={props.style}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-[1vw] w-14 font-bold bg-gray-500 rounded-full p-2 hover:bg-gray-400 transition-all duration-200 ease-in-out"
            >
                <FontAwesomeIcon icon={faInfo} className="font-bold text-2xl" />
            </button>
            {isOpen && (
                <div className="max-w-[29rem] bg-gray-600 rounded-3xl p-4 text-left">
                    <p className="pb-3">
                        <b>Main search bar (Title* field):</b>
                        <br />
                        Enter any portion for the title of a movie, series, episode, etc.{" "}
                        Due to the limits of the OMDb API, <b>at least 3 characters</b> are
                        required for any search to work.
                    </p>
                    <p className="pb-3">
                        <b>Additional filters (Show Filters button):</b>
                        <br />
                        Enter any description and <b>Google Gemini</b> will try to find the
                        title. (Description field clears on successful call.) The Search
                        button must be clicked twice: 1st search will update main search
                        bar, 2nd search will provide results. Inappropriate descriptions may
                        not be processed.
                        <br />
                        <b>OR</b>
                        <br />
                        Use zero to all additional filters at a time.
                        <br />
                        - Genre(s): Specify genre(s) (e.g., Action, Drama) <br />
                        - Year(s): Specify release year(s) (e.g., 1984, 2011) <br />
                        - Type(s): Specify type of content (e.g., Movie, Series) <br />
                        - Director(s): Specify director(s) (e.g., Steven Spielberg) <br />-
                        Cast member(s): Specify top cast member(s) (e.g., Margot Robbie)
                    </p>
                    <p className="pb-3">
                        <b>Inputting multiple values in additional filters:</b>
                        <br />
                        When inputting more than one value into a filter, separate each
                        value with a single comma and no spaces in between. <br />- Example:
                        value1,value2,value3,...
                    </p>
                    <p className="pb-3">
                        <b>Case insensitivity:</b>
                        <br />
                        It doesn't matter how letters are typed in the search criteria.
                    </p>
                    <p>
                        <b>Example of usage:</b>
                        <br />
                        - Any description...: first batman movie featuring christian bale
                        <br />
                        <b>OR</b> <br />
                        - Title*: bat <br />
                        - Genre(s): crime <br />
                        - Year(s): 2005 <br />
                        - Type(s): movie <br />
                        - Director(s): nolan <br />- Cast member(s): christian bale,michael
                        caine
                    </p>
                </div>
            )}
        </div>
    );
};

export default FAQ;
