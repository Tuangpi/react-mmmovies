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
import { ForGenres } from "../../helper/ForGenres";
import { GetData } from "../../helper/GetData";
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
        where("tmdb_id", "==", movieID)
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
        tmdb_id: String(data["id"]) ?? "",
        thumbnail: thumbnailURL,
        poster: posterURL,
        tmdb: "Y",
        fetch_by: searchBy,
        genreId: genre_id,
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
        description_myanmar: myanDesc,
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
    <div className="tw-pt-5 tw-px-2">
      {isLoading && (
        <div className="tw-absolute tw-z-50 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-opacity-50 tw-flex tw-justify-center tw-items-center">
          <Loading type="spokes" color="#3f51b5" height={"3%"} width={"3%"} />{" "}
        </div>
      )}
      <div className="tw-mx-2">
        <h1 className="tw-font-bold tw-text-slate-500 tw-mb-2">{title}</h1>
        <form onSubmit={handleSubmit}>
          <div className="tw-p-4 tw-bg-white">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
              <div className="tw-text-lg tw-font-bold">Create TvSeries</div>
              <Link
                to="/tvseries"
                className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
              >
                Back
              </Link>
            </div>
            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">
                  Search TVSeries By TMDB ID
                </div>
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
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="movieName" className="tw-text-slate-800">
                    Series Title:
                  </label>
                  <input
                    type="text"
                    id="movieName"
                    onChange={(e) => setMovieTitle(e.target.value)}
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                  />
                </div>
              ) : (
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="movieTMDB" className="tw-text-slate-800">
                    Tv Series ID:
                  </label>
                  <input
                    id="movieTMDB"
                    type="text"
                    onChange={(e) => setMovieID(e.target.value)}
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                  />
                </div>
              )}
              <div className="tw-flex tw-flex-col">
                <label htmlFor="maturityRating" className="tw-text-slate-800">
                  Maturity Rating:
                </label>
                <select
                  id="maturityRating"
                  onChange={(e) => setSelectedMaturity(e.target.value)}
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1 cursor-pointer"
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
              <div className="tw-flex tw-flex-col">
                <label htmlFor="country" className="tw-text-slate-800">
                  Country:
                </label>
                <select
                  id="country"
                  value={selectedCountry}
                  multiple
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1 cursor-pointer"
                >
                  <option value=""></option>
                  {COUNTRY.map((country, key) => (
                    <option key={key} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tw-flex tw-flex-col">
                <label htmlFor="metaKeyword" className="tw-text-slate-800">
                  Meta Keyword:
                </label>
                <input
                  type="text"
                  id="metaKeyword"
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                  onChange={(e) => setMetaKeyWord(e.target.value)}
                />
              </div>
              <div className="tw-flex tw-flex-col">
                <label htmlFor="metaDescription" className="tw-text-slate-800">
                  Meta Description:
                </label>
                <textarea
                  name=""
                  id="metaDescription"
                  onChange={(e) => setMetaDesc(e.target.value)}
                  cols="30"
                  rows="3"
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                ></textarea>
              </div>
            </div>
            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">Featured:</div>
                <label htmlFor="featured" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="featured"
                    onChange={() => setIsFeatured(!isFeatured)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="tw-flex tw-flex-col">
                <label htmlFor="selectMenu" className="tw-text-slate-800">
                  Select Menu*:
                </label>
                <input
                  type="checkbox"
                  id="selectMenu"
                  onChange={() => setCheckMenuAll(!checkMenuAll)}
                />
              </div>
            </div>

            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <div className="tw-flex tw-flex-col">
                <label className="tw-text-slate-800">
                  More Details: TMDB Or Custom?
                </label>
                <div className="tw-flex tw-mt-3">
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
                    <label
                      htmlFor="tmdb"
                      className={`tw-px-3 tw-py-2  tw-text-slate-50 tw-border-none tw-outline-none tw-cursor-pointer tw-rounded-md hover:tw-bg-blue-500 ${
                        selectTMDB === "tmdb"
                          ? "tw-bg-blue-600"
                          : "tw-bg-slate-400"
                      }`}
                    >
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
                    <label
                      htmlFor="custom"
                      className={`tw-px-3 tw-py-2  tw-text-slate-50 tw-border-none tw-outline-none tw-cursor-pointer tw-rounded-md hover:tw-bg-blue-500 ${
                        selectTMDB === "custom"
                          ? "tw-bg-blue-600"
                          : "tw-bg-slate-400"
                      }`}
                    >
                      Custom
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="tw-flex tw-flex-col tw-bg-slate-300 tw-mb-4 tw-p-7">
              <div className="tw-flex tw-flex-col">
                <label
                  htmlFor="descriptionSource"
                  className="tw-text-slate-800"
                >
                  Get Description From:
                </label>
                <select>
                  <option selected>Select</option>
                  <option>Channel Myanmar</option>
                </select>
              </div>
              <div className="tw-flex tw-flex-col">
                <label
                  htmlFor="descriptionMyanmar"
                  className="tw-text-slate-800"
                >
                  Description in Myanmar:
                </label>
                <textarea
                  name=""
                  id="descriptionMyanmar"
                  cols="30"
                  rows="3"
                  onChange={(e) => setMyanDesc(e.target.value)}
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                ></textarea>
              </div>
            </div>

            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <button
                type="submit"
                className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
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
