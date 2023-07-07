import "../../style/new.scss";
import "../../style/modal.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import Loading from "react-loading";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { Link } from "react-router-dom";
import { ForGenres } from "./NewMovieHelper/ForGenres";
import { GetData } from "./NewMovieHelper/GetData";

const NewTvSeries = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchByToggle, setSearchByToggle] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieSlug, setMovieSlug] = useState("");

  const handleSearchByToggle = (event) => {
    setSearchByToggle(event.target.checked);
    event.target.checked ? setSearchBy("title") : setSearchBy("byId");
  };

  const handleMovieTitleChange = (event) => {
    setMovieTitle(event.target.value);
  };

  async function fetchDataAndStore() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

    const data = await GetData(searchBy, TMDB_API_KEY, movieTitle);

    //for genre
    const genre_id = await ForGenres(data);

    //for movie
    const poster = await axios.get(
      `https://image.tmdb.org/t/p/original/${data["poster_path"]}`,
      { responseType: "arraybuffer" }
    );

    const thumbnail = await axios.get(
      `https://image.tmdb.org/t/p/original/${data["backdrop_path"]}`,
      { responseType: "arraybuffer" }
    );

    let posterURL = null;
    let thumbnailURL = null;

    try {
      const posterRef = ref(storage, `posters/${data["poster_path"]}`);
      const thumbnailRef = ref(storage, `thumbnail/${data["backdrop_path"]}`);

      await uploadBytesResumable(posterRef, poster.data);
      await uploadBytesResumable(thumbnailRef, thumbnail.data);

      // Get the download URL of the uploaded image
      posterURL = await getDownloadURL(posterRef);
      thumbnailURL = await getDownloadURL(thumbnailRef);
    } catch (error) {
      console.log(error);
    }
    let movieRef = null;
    try {
      const docRef = await addDoc(collection(db, "tvseries"), {
        tmdb_id: data["id"],
        title: data["title"],
        slug: movieSlug,
        duration: 'data["runtime"]',
        thumbnail: thumbnailURL,
        poster: posterURL,
        tmdb: "Y",
        fetch_by: searchBy,
        genre_id: genre_id,
        trailer_url: null,
        detail: data["overview"],
        views: null,
        rating: data["vote_average"],
        maturity_rating: "all age",
        subtitle: null,
        publish_year: null,
        released: data["release_date"].split("-")[0],
        featured: null,
        type: "T",
        status: "1",
        created_by: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_upcoming: 0,
        upcoming_date: null,
        is_kids: 0,
        desc_myan: null,
        updated_by: null,
        channel: 0,
      });
      movieRef = docRef;
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true

    try {
      await fetchDataAndStore();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        {isLoading ? (
          <div className="loading-container">
            <Loading type="spokes" color="#3f51b5" height={"3%"} width={"3%"} />{" "}
            {/* Replace with your preferred loading component */}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-container">
              <div className="form-header">
                <div className="form-header-title">Create TvSeries</div>
                <Link to="/movies">
                  <button className="back-btn">Back</button>
                </Link>
              </div>
              <div className="form-block">
                <div className="form-block-inside">
                  <label>
                    <input
                      type="checkbox"
                      checked={searchByToggle}
                      onChange={handleSearchByToggle}
                    />
                    Search TvSeries By TMDB ID
                  </label>
                </div>
                {searchByToggle ? (
                  <div className="form-block-inside">
                    <label htmlFor="movieName">Series Title:</label>
                    <input
                      type="text"
                      id="movieName"
                      value={movieTitle}
                      onChange={handleMovieTitleChange}
                    />
                  </div>
                ) : (
                  <div className="form-block-inside">
                    <label htmlFor="movieTMDB">Tv Series ID:</label>
                    <input
                      id="movieTMDB"
                      type="text"
                      value={movieTitle}
                      onChange={handleMovieTitleChange}
                    />
                  </div>
                )}
                <div className="form-block-inside">
                  <label htmlFor="maturityRating">Maturity Rating:</label>
                  <input type="text" id="maturityRating" />
                </div>
                <div className="form-block-inside">
                  <label htmlFor="country">Country:</label>
                  <input type="text" id="country" />
                </div>
                <div className="form-block-inside">
                  <label htmlFor="metaKeyword">Meta Keyword:</label>
                  <input type="text" id="metaKeyword" />
                </div>
                <div className="form-block-inside">
                  <label htmlFor="metaDescription">Meta Description:</label>
                  <input type="text" id="metaDescription" />
                </div>
              </div>
              <div className="form-block">
                <div className="form-block-inside">
                  <label htmlFor="featured">Featured:</label>
                  <input type="checkbox" id="featured" />
                </div>
                <div className="form-block-inside">
                  <label htmlFor="selectMenu">Select Menu*:</label>
                  <input type="text" id="selectMenu" />
                </div>
              </div>

              <div className="form-block">
                <div className="form-block-inside">
                  <label>More Details:</label>
                  <div className="radio-group">
                    <input type="radio" id="tmdb" name="details" value="tmdb" />
                    <label htmlFor="tmdb">TMDB</label>
                    <input
                      type="radio"
                      id="custom"
                      name="details"
                      value="custom"
                    />
                    <label htmlFor="custom">Custom</label>
                  </div>
                </div>
              </div>
              <div className="form-block">
                <div className="form-block-inside">
                  <label htmlFor="descriptionSource">
                    Get Description From:
                  </label>
                  <input type="text" id="descriptionSource" />
                </div>
                <div className="form-block-inside">
                  <label htmlFor="descriptionMyanmar">
                    Description in Myanmar:
                  </label>
                  <input type="text" id="descriptionMyanmar" />
                </div>
              </div>

              <div className="form-block">
                <button type="submit">Create</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewTvSeries;
