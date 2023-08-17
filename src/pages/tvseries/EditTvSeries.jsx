import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import Loading from "react-loading";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../../configs/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Link, useParams } from "react-router-dom";
import { ForGenres } from "../../helper/ForGenres";
import { GetData } from "../../helper/GetData";
import { fromURL } from "image-resize-compress";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { COUNTRY } from "../../assets/COUNTRY";

const EditTvSeries = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchByToggle, setSearchByToggle] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieID, setMovieID] = useState("");
  const [selectedMaturity, setSelectedMaturity] = useState("all age");
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [metaKeyWord, setMetaKeyWord] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [myanDesc, setMyanDesc] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [checkMenuAll, setCheckMenuAll] = useState(false);
  const { id } = useParams();

  const handleSearchByToggle = (event) => {
    setSearchByToggle(event.target.checked);
    event.target.checked ? setSearchBy("title") : setSearchBy("byId");
  };

  useEffect(() => {
    const fetchData = async (docRef) => {
      try {
        const querySnapshot = await getDoc(
          doc(db, `${STATIC_WORDS.TVSERIES}/${docRef}`)
        );
        const data = querySnapshot.data();
        setMovieID(data.tmdb_id);
        setMovieTitle(data.title);
        setSelectedMaturity(data.maturity_rating);
        setSelectedCountry(data.country);
        setMetaKeyWord(data.keyword);
        setMetaDesc(data.description);
        setIsFeatured(data.featured);
        setMyanDesc(data.description_myanmar);
      } catch (err) {
        console.log(err);
      }
    };

    if (id) fetchData(id);
  }, [id]);

  //   async function fetchDataAndStore() {
  //     const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

  //     const data = await GetData(searchBy, TMDB_API_KEY, movieTitle);

  //     //for genre
  //     const genre_id = await ForGenres(data);

  //     //for tvseries
  //     const poster = `https://image.tmdb.org/t/p/original/${data["poster_path"]}`;
  //     const thumnail = `https://image.tmdb.org/t/p/original/${data["backdrop_path"]}`;

  //     let blob1 = null;
  //     let blob2 = null;
  //     try {
  //       [blob1, blob2] = await Promise.all([
  //         fromURL(poster, 1, 0, 0, "webp"),
  //         fromURL(thumnail, 1, 0, 0, "webp"),
  //       ]);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     const posterRef = ref(storage, `posters/${data["poster_path"]}`);
  //     const thumbnailRef = ref(storage, `thumbnail/${data["backdrop_path"]}`);

  //     let posterURL = null;
  //     let thumbnailURL = null;

  //     try {
  //       await Promise.all([
  //         uploadBytesResumable(thumbnailRef, blob1),
  //         uploadBytesResumable(posterRef, blob2),
  //       ]);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     try {
  //       [posterURL, thumbnailURL] = await Promise.all([
  //         getDownloadURL(posterRef),
  //         getDownloadURL(thumbnailRef),
  //       ]);
  //     } catch (err) {
  //       console.log(err);
  //     }

  //     try {
  //       await addDoc(collection(db, "tvseries"), {
  //         tmdb_id: data["id"],
  //         title: data["name"],
  //         slug: movieSlug,
  //         duration: 'data["runtime"]',
  //         thumbnail: thumbnailURL,
  //         poster: posterURL,
  //         tmdb: "Y",
  //         fetch_by: searchBy,
  //         genre_id: genre_id,
  //         trailer_url: null,
  //         detail: data["overview"],
  //         views: null,
  //         rating: data["vote_average"],
  //         maturity_rating: "all age",
  //         subtitle: null,
  //         publish_year: null,
  //         released: data["first_air_date"].split("-")[0],
  //         featured: null,
  //         type: "T",
  //         status: "1",
  //         created_by: null,
  //         created_at: serverTimestamp(),
  //         updated_at: serverTimestamp(),
  //         is_upcoming: 0,
  //         upcoming_date: null,
  //         is_kids: 0,
  //         description_myanmar: null,
  //         updated_by: null,
  //         channel: 0,
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("asdf");
      //   await fetchDataAndStore();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="tw-flex tw-pt-5 tw-px-5">
      <div className="tw-mx-5">
        <h1 className="tw-font-bold tw-text-slate-500">{title}</h1>
        {isLoading ? (
          <div className="tw-absolute tw-z-50 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-opacity-50 tw-flex tw-justify-center tw-items-center">
            <Loading type="spokes" color="#3f51b5" height={"3%"} width={"3%"} />{" "}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="tw-p-6 tw-bg-white">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <div className="tw-text-lg tw-font-bold">Edit TvSeries</div>
                <Link
                  to="/tvseries"
                  className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
                >
                  Back
                </Link>
              </div>
              <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
                <div className="tw-flex tw-flex-col">
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
                  <div className="tw-flex tw-flex-col">
                    <label htmlFor="movieName">Series Title:</label>
                    <input
                      type="text"
                      id="movieName"
                      value={movieTitle}
                      className="tw-p-2 tw-text-sm"
                      onChange={(e) => setMovieTitle(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="tw-flex tw-flex-col">
                    <label htmlFor="movieTMDB">Tv Series ID:</label>
                    <input
                      id="movieTMDB"
                      type="text"
                      value={movieID}
                      className="tw-p-2 tw-text-sm"
                      onChange={(e) => setMovieID(e.target.value)}
                    />
                  </div>
                )}
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="maturityRating">Maturity Rating:</label>
                  <select
                    id="maturityRating"
                    onChange={(e) => setSelectedMaturity(e.target.value)}
                    className="tw-p-2 tw-text-sm cursor-pointer"
                    value={selectedMaturity}
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
                  <label htmlFor="country">Country:</label>
                  <select
                    id="country"
                    multiple
                    // value={selectedCountry}
                    // onChange={(e) => setSelectedCountry(e.target.value)}
                    className="tw-p-2 tw-text-sm cursor-pointer"
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
                  <label htmlFor="metaKeyword">Meta Keyword:</label>
                  <input
                    type="text"
                    id="metaKeyword"
                    value={metaKeyWord}
                    onChange={(e) => setMetaKeyWord(e.target.value)}
                    className="tw-p-2 tw-text-sm"
                  />
                </div>
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="metaDescription">Meta Description:</label>
                  <textarea
                    name=""
                    id="metaDescription"
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    className="tw-p-2 tw-text-sm"
                    cols="30"
                  ></textarea>
                </div>
              </div>
              <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
                <div className="tw-flex tw-flex-col">
                  <div>Featured:</div>
                  <label htmlFor="featured" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="selectMenu">Select Menu*:</label>
                  <input
                    type="checkbox"
                    id="selectMenu"
                    onChange={() => setCheckMenuAll(!checkMenuAll)}
                  />
                </div>
              </div>

              <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
                <div className="tw-flex tw-flex-col">
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
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="descriptionSource">
                    Get Description From:
                  </label>
                  <input
                    type="text"
                    className="tw-p-2 tw-text-sm"
                    id="descriptionSource"
                  />
                </div>
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="descriptionMyanmar">
                    Description in Myanmar:
                  </label>
                  <textarea
                    value={myanDesc}
                    id="descriptionMyanmar"
                    cols="30"
                    className="tw-p-2 tw-text-sm"
                    onChange={(e) => setMyanDesc(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
                <button
                  className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
                  type="submit"
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default EditTvSeries;
