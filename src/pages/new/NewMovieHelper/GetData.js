import axios from "axios";
import { STATIC_WORDS } from "../../../assets/STATIC_WORDS";

export const GetData = async (searchBy, TMDB_API_KEY, movieTitle, from) => {
  let response = null;
  let source = "tv";
  if (from === STATIC_WORDS.MOVIES) source = "movie";
  if (searchBy) {
    response = await axios.get(
      `https://api.themoviedb.org/3/search/${source}?api_key=${TMDB_API_KEY}&query=${movieTitle}`
    );
    return response.data.results[0];
  } else {
    response = await axios.get(
      `https://api.themoviedb.org/3/${source}/${movieTitle}?api_key=${TMDB_API_KEY}`
    );
    return response.data;
  }
};
