import "../../style/new.scss";
import "../../style/modal.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import Loading from "react-loading";
import {
  Timestamp,
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
import { COUNTRY } from "../../assets/COUNTRY";

const NewTvSeries = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchByToggle, setSearchByToggle] = useState(false);
  const [searchBy, setSearchBy] = useState("byId");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieID, setMovieID] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [checkMenuAll, setCheckMenuAll] = useState(false);
  const [selectedMaturity, setSelectedMaturity] = useState("all age");
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [metaKeyWord, setMetaKeyWord] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [myanDesc, setMyanDesc] = useState("");

  const handleSearchByToggle = (event) => {
    setSearchByToggle(event.target.checked);
    event.target.checked ? setSearchBy("title") : setSearchBy("byId");
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

    const data = movieID
      ? await GetData(searchBy, TMDB_API_KEY, movieID, STATIC_WORDS.TVSERIES)
      : await GetData(
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
        keyword: metaKeyWord,
        description: metaDesc,
        title: data["name"],
        tmdb_id: String(data["id"]),
        thumbnail: thumbnailURL,
        poster: posterURL,
        tmdb: "Y",
        fetch_by: searchBy,
        genre_id: genre_id,
        trailer_url: "",
        detail: data["overview"],
        views: "",
        rating: data["vote_average"],
        maturity_rating: selectedMaturity,
        publish_year: "",
        released: data["first_air_date"].split("-")[0] ?? "",
        featured: isFeatured,
        type: "T",
        status: true,
        // created_by: "",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_upcoming: false,
        upcoming_date: new Timestamp(0, 0),
        is_kids: false,
        country: selectedCountry,
        desc_myan: myanDesc,
        // updated_by: "",
        channel: 0,
        id: docRef,
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
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                  Back
                </button>
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
                    onChange={(e) => setMovieTitle(e.target.value)}
                    className="p-2 text-sm"
                  />
                </div>
              ) : (
                <div className="form-block-inside">
                  <label htmlFor="movieTMDB">Tv Series ID:</label>
                  <input
                    id="movieTMDB"
                    type="text"
                    onChange={(e) => setMovieID(e.target.value)}
                    className="p-2 text-sm"
                  />
                </div>
              )}
              <div className="form-block-inside">
                <label htmlFor="maturityRating">Maturity Rating:</label>
                <select
                  id="maturityRating"
                  onChange={(e) => setSelectedMaturity(e.target.value)}
                  className="p-2 text-sm cursor-pointer"
                >
                  <option value="all age">All Age</option>
                  <option value="18+">18+</option>
                  <option value="16+">16+</option>
                  <option value="13+">13+</option>
                  <option value="10+">10+</option>
                  <option value="8+">8+</option>
                  <option value="5+">5+</option>
                  <option value="2+">2+</option>
                </select>
              </div>
              <div className="form-block-inside">
                <label htmlFor="country">Country:</label>
                <select
                  id="country"
                  value={selectedCountry}
                  multiple
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="p-2 text-sm cursor-pointer"
                >
                  <option value=""></option>
                  {COUNTRY.map((country, key) => (
                    <option key={key} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-block-inside">
                <label htmlFor="metaKeyword">Meta Keyword:</label>
                <input
                  type="text"
                  id="metaKeyword"
                  className="p-2 text-sm"
                  onChange={(e) => setMetaKeyWord(e.target.value)}
                />
              </div>
              <div className="form-block-inside">
                <label htmlFor="metaDescription">Meta Description:</label>
                <textarea
                  name=""
                  id="metaDescription"
                  onChange={(e) => setMetaDesc(e.target.value)}
                  cols="30"
                  className="p-2 textsm"
                ></textarea>
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
                <input
                  type="text"
                  id="descriptionSource"
                  className="p-2 text-sm"
                />
              </div>
              <div className="form-block-inside">
                <label htmlFor="descriptionMyanmar">
                  Description in Myanmar:
                </label>
                <textarea
                  name=""
                  id="descriptionMyanmar"
                  cols="30"
                  onChange={(e) => setMyanDesc(e.target.value)}
                  className="p-2 text-sm"
                ></textarea>
              </div>
            </div>

            <div className="form-block">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTvSeries;
