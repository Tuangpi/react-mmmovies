import "../../style/new.scss";
import "../../style/modal.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import Loading from "react-loading";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../../configs/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";
import { ForGenres } from "../new/NewMovieHelper/ForGenres";
import { GetData } from "../new/NewMovieHelper/GetData";
import { fromURL } from "image-resize-compress";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { isDocumentEmpty } from "../../helper/Helpers";

const NewTvSeries = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchByToggle, setSearchByToggle] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieSlug, setMovieSlug] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [checkMenuAll, setCheckMenuAll] = useState(false);

  const handleSearchByToggle = (event) => {
    setSearchByToggle(event.target.checked);
    event.target.checked ? setSearchBy("title") : setSearchBy("byId");
  };

  const handleMovieTitleChange = (event) => {
    setMovieTitle(event.target.value);
  };

  async function fetchDataAndStore() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

    if (!(await isDocumentEmpty(STATIC_WORDS.TVSERIES))) {
      const q = query(
        collection(db, STATIC_WORDS.TVSERIES),
        where("tmdb_id", "==", movieTitle)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        console.log("already exist");
        return;
      }
    }

    const data = await GetData(
      searchBy,
      TMDB_API_KEY,
      movieTitle,
      STATIC_WORDS.TVSERIES
    );

    //for genre
    const genre_id = await ForGenres(data);

    //for tvseries
    const poster = `https://image.tmdb.org/t/p/original/${data["poster_path"]}`;
    const thumnail = `https://image.tmdb.org/t/p/original/${data["backdrop_path"]}`;

    let blob1 = null;
    let blob2 = null;
    try {
      [blob1, blob2] = await Promise.all([
        fromURL(poster, 1, 0, 0, "webp"),
        fromURL(thumnail, 1, 0, 0, "webp"),
      ]);
    } catch (err) {
      console.log(err);
    }
    const posterRef = ref(storage, `posters/${data["poster_path"]}`);
    const thumbnailRef = ref(storage, `thumbnail/${data["backdrop_path"]}`);

    let posterURL = null;
    let thumbnailURL = null;

    try {
      await Promise.all([
        uploadBytesResumable(thumbnailRef, blob1),
        uploadBytesResumable(posterRef, blob2),
      ]);
    } catch (err) {
      console.log(err);
    }
    try {
      [posterURL, thumbnailURL] = await Promise.all([
        getDownloadURL(posterRef),
        getDownloadURL(thumbnailRef),
      ]);
    } catch (err) {
      console.log(err);
    }

    try {
      const docRef = doc(collection(db, STATIC_WORDS.TVSERIES));

      await setDoc(docRef, {
        tmdb_id: String(data["id"]),
        title: data["name"],
        slug: movieSlug,
        duration: 'data["runtime"]',
        thumbnail: thumbnailURL,
        poster: posterURL,
        tmdb: "Y",
        fetch_by: searchBy,
        genre_id: genre_id,
        trailer_url: "",
        detail: data["overview"],
        views: "",
        rating: data["vote_average"],
        maturity_rating: "all age",
        subtitle: "",
        publish_year: "",
        released: data["first_air_date"].split("-")[0],
        featured: false,
        type: "T",
        status: true,
        created_by: "",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_upcoming: false,
        upcoming_date: "",
        is_kids: false,
        desc_myan: "",
        updated_by: "",
        channel: 0,
        id: docRef.id,
      });
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
      {isLoading && (
        <div className="loading-container">
          <Loading type="spokes" color="#3f51b5" height={"3%"} width={"3%"} />{" "}
        </div>
      )}
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <div className="form-header">
              <div className="form-header-title">Create TvSeries</div>
              <Link to="/tvseries">
                <button className="back-btn">Back</button>
              </Link>
            </div>
            <div className="form-block">
              <div className="form-block-inside">
                <div>Search TVSeries By TMDB ID</div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={searchByToggle}
                    onChange={handleSearchByToggle}
                  />
                  <span className="slider"></span>
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
                <textarea name="" id="metaDescription" cols="30"></textarea>
              </div>
            </div>
            <div className="form-block">
              <div className="form-block-inside">
                <div>Featured:</div>
                <label htmlFor="featured" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="featured"
                    onChange={() => setIsFeatured(!isFeatured)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <label htmlFor="selectMenu">Select Menu*:</label>
                <input
                  type="checkbox"
                  id="selectMenu"
                  onChange={() => setCheckMenuAll(!checkMenuAll)}
                />
              </div>
            </div>

            <div className="form-block">
              <div className="form-block-inside">
                <label>More Details: TMDB Or Custom?</label>
                <div className="radio-group">
                  <div>
                    <input
                      type="radio"
                      id="tmdb"
                      name="details"
                      value="tmdb"
                      className="hidden-radio"
                      onChange={(e) => setSelectTMDB(e.target.value)}
                      checked={selectTMDB === "tmdb"}
                    />
                    <label htmlFor="tmdb" className="button-style">
                      TMDB
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="custom"
                      name="details"
                      value="custom"
                      className="hidden-radio"
                      onChange={(e) => setSelectTMDB(e.target.value)}
                      checked={selectTMDB === "custom"}
                    />
                    <label htmlFor="custom" className="button-style">
                      Custom
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-block-myanmar">
              <div className="form-block-inside">
                <label htmlFor="descriptionSource">Get Description From:</label>
                <input type="text" id="descriptionSource" />
              </div>
              <div className="form-block-inside">
                <label htmlFor="descriptionMyanmar">
                  Description in Myanmar:
                </label>
                <textarea name="" id="descriptionMyanmar" cols="30"></textarea>
              </div>
            </div>

            <div className="form-block">
              <button type="submit">Create</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTvSeries;
