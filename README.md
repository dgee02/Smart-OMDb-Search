# Smart OMDb Search

## Description

A smart search engine for obtaining information from the OMDb API. Users can explore movies, series, episodes, etc. and view various details about them.

![](https://raw.githubusercontent.com/dgee02/portfolio-content/main/projects/Smart-OMDb-Search.gif)

## Main Features

- AI Integration: Provide any description and Google Gemini will attempt to determine the title name.

- Advanced Filters: Refine searches by genre, year, type, director, and cast with support for multiple values.

- Modals: Click on a search result for additional information without leaving the current page.

- YouTube Integration: View relevant trailers for each search result.

- Search Term Highlighting: Highlight matching parts of titles in search results for quick identification of relevant content.

- Usage Guidelines: Instructions and examples are provided to enhance understanding of search features.

- Additional Quality of Life Features: Easily reset search criteria with a single click, hassle-free searching with case-insensitive input recognition, helpful error messages, and more.

## Usage

1. Open the web application in your browser through this [link](https://smart-omdb-search.netlify.app/).

2. Enter any portion for the title of a movie, series, episode, etc. into the main search bar. Due to the limits of the OMDb API, at least 3 characters are required for any search to work. 

3. Use additional filters to refine your search, if desired. There are separate 2 options: 
    - Google Gemini will try to find the title based on any description provided and its result will automatically update the main search bar. No other fields (including the main search bar) need to be initially filled if using this option. Keep in mind that inappropriate descriptions may not be processed. **Google may use your prompts to improve their products**.
    - Use any number of the additional filters at a time. Keep in mind when inputting more than 1 value into a filter, each value must be separated with a single comma and no spaces in between (e.g., value1,value2,value3). 

4. Click the search button or press Enter on your keyboard to view search results. (If using the AI option, the search button must be clicked twice: 1st search will update main search bar, 2nd search will provide results.)

5. Click on any result to explore additional information about it including runtime, trailer, plot summary, ratings, and more.

Note: Click on the information button in the top right corner for further search tips should you have any trouble using the application.

## Technologies Used

- [Gemini API](https://ai.google.dev/)

- [OMDb API](https://www.omdbapi.com/)

- [YouTube API](https://developers.google.com/youtube/v3)

- [Vite](https://vitejs.dev/)

- [Tailwind CSS](https://tailwindcss.com/)

- [Netlify](https://www.netlify.com/)

- [Axios](https://axios-http.com/)

- [Font Awesome Icons](https://fontawesome.com/v6/icons?o=r&m=free&s=solid)
