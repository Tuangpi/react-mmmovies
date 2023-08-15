import axios from "axios";
import { STATIC_WORDS } from "../assets/STATIC_WORDS";

export const GetData = async (searchBy, TMDB_API_KEY, query, from) => {
  let response = null;
  let source = "tv";
  if (from === STATIC_WORDS.MOVIES) source = "movie";
  console.log(source, searchBy);
  if (searchBy === 'byId') {
    response = await axios.get(
      `https://api.themoviedb.org/3/${source}/${query}?api_key=${TMDB_API_KEY}`
    );
    console.log(response.data);
    return response.data;

  } else {
    const response1 = await axios.get(
      `https://api.themoviedb.org/3/search/${source}?api_key=${TMDB_API_KEY}&query=${query}`
    );
    if (response1.data.results[0].id) {
      response = await axios.get(
        `https://api.themoviedb.org/3/${source}/${response1.data.results[0].id}?api_key=${TMDB_API_KEY}`
      );
    }
    return response.data;
  }
};
