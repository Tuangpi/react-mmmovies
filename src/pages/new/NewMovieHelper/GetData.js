import axios from "axios";

export const GetData = async (searchBy, TMDB_API_KEY, movieTitle) => {
  let response = null;
  if (searchBy) {
    response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${movieTitle}`
    );
    return response.data.results[0];
  } else {
    response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieTitle}?api_key=${TMDB_API_KEY}`
    );
    return response.data;
  }
};
