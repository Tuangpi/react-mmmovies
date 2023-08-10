import "../../style/new.scss";
import "../../style/modal.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import Loading from "react-loading";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, storage } from "../../configs/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { Link, useLocation, useParams } from "react-router-dom";
import { GetData } from "../new/NewMovieHelper/GetData";
import { ForActors } from "../new/NewMovieHelper/ForActors";
import { ForDirectors } from "../new/NewMovieHelper/ForDirectors";
import { ForGenres } from "../new/NewMovieHelper/ForGenres";
import { CustomModal } from "../../components/widget/CustomModal";
import { ListObjects, SearchObjects } from "../new/NewMovieHelper/FetchObjects";
import { fromURL } from "image-resize-compress";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { isDocumentEmpty } from "../../helper/Helpers";
import { COUNTRY } from "../../assets/COUNTRY";

const EditMovie = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchByToggle, setSearchByToggle] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieTmdbId, setMovieTmdbId] = useState("");
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [isSeries, setIsSeries] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [hasSubTitle, setHasSubTitle] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [checkMenuAll, setCheckMenuAll] = useState(false);
  const [hasCustomThumbnail, setHasCustomThumbnail] = useState(false);
  const [upcomingDate, setUpcomingDate] = useState("");
  const [videoUpload, setVideoUpload] = useState("");
  const [selectedOption, setSelectedOption] = useState("upload");
  const [movieSlug, setMovieSlug] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectKey, setSelectKey] = useState(null);
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [selectedMaturity, setSelectedMaturity] = useState("all age");
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [metaKeyWord, setMetaKeyWord] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [myanDesc, setMyanDesc] = useState("");
  const [objects, setObjects] = useState([]);
  const [continuationToken, setContinuationToken] = useState(null);
  const [objectKey, setObjectKey] = useState("movies_upload_wasabi");

  const { id } = useParams();

  var handleClose = () => {
    setShowModal(false);
    setObjects([]);
    setContinuationToken(null);
  };
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      const search = e.target.value;
      try {
        const fetchObj = await SearchObjects(search);
        setObjects(fetchObj);
      } catch (err) {
        console.log(err);
      }
    }
  };
  var handleSuccess = () => {
    console.log("success");
  };

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const handleSelect = (key) => {
    setSelectKey(key);
    setShowModal(false);
    setContinuationToken(null);
  };

  const handleSearchByToggle = (event) => {
    setSearchByToggle(event.target.checked);
    event.target.checked ? setSearchBy("title") : setSearchBy("byId");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { objects: fetchedObjects, continuationToken: nextToken } =
          await ListObjects(continuationToken);
        setObjects((prevObjects) => [...prevObjects, ...fetchedObjects]);
        setContinuationToken(nextToken);
      } catch (error) {
        console.error("Error fetching objects:", error);
      }
    };

    const handleScrollEvent = (e) => {
      const isNearBottom =
        e.target.scrollHeight - e.target.scrollTop < e.target.clientHeight + 5;
      if (isNearBottom && continuationToken) {
        fetchData();
      }
    };

    const modalContentElement = document.getElementById("custom-modal");

    if (showModal) {
      if (continuationToken === null) fetchData();
      modalContentElement.addEventListener("scroll", handleScrollEvent);
    }

    return () => {
      if (modalContentElement) {
        modalContentElement.removeEventListener("scroll", handleScrollEvent);
      }
    };
  }, [showModal, continuationToken]);

  useEffect(() => {
    const fetchData = async (docRef) => {
      try {
        const querySnapshot = await getDoc(
          doc(db, `${STATIC_WORDS.MOVIES}/${docRef}`)
        );
        const data = querySnapshot.data();
        setMovieSlug(data.slug);
        setMovieTitle(data.title);
        setMovieTmdbId(data.tmdb_id);
        setIsUpcoming(data.is_upcoming);
        setIsFeatured(data.featured);
        setIsSeries(data.series);
        setUpcomingDate(data.upcoming_date);
        setSelectedMaturity(data.maturity_rating);
        setSelectedCountry(data.country);
        setMetaDesc(data.description);
        setMetaKeyWord(data.keyword);
        setHasSubTitle(data.subtitle);
        setIsProtected(data.is_protected);
        setMyanDesc(data.description_myanmar);
      } catch (err) {
        console.log(err);
      }
    };

    if (id) fetchData(id);
  }, [id]);

  //   async function fetchDataAndStore() {
  //     const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

  //     if (!(await isDocumentEmpty(STATIC_WORDS.MOVIES))) {
  //       const q = query(
  //         collection(db, STATIC_WORDS.MOVIES),
  //         where("tmdb_id", "==", movieTitle)
  //       );
  //       const querySnapshot = await getDocs(q);
  //       if (!querySnapshot.empty) {
  //         console.log("already exist");
  //         return;
  //       }
  //     }

  //     const data = await GetData(searchBy, TMDB_API_KEY, movieTitle);
  //     let credits = null;
  //     if (data["id"]) {
  //       credits = await axios.get(
  //         `https://api.themoviedb.org/3/movie/${data["id"]}/credits?api_key=${TMDB_API_KEY}`
  //       );
  //     } else {
  //       console.log("movie does not found on TMDB Server");
  //       return;
  //     }

  //     const [actor_id, director_id, genre_id] = await Promise.all([
  //       ForActors(TMDB_API_KEY, credits),
  //       ForDirectors(TMDB_API_KEY, credits),
  //       ForGenres(data),
  //     ]);

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

  //     let movieRef = null;
  //     try {
  //       const docRef = await addDoc(collection(db, STATIC_WORDS.MOVIES), {
  //         tmdb_id: String(data["id"]),
  //         title: data["title"],
  //         slug: movieSlug,
  //         duration: 'data["runtime"]',
  //         thumbnail: thumbnailURL,
  //         poster: posterURL,
  //         tmdb: "Y",
  //         fetch_by: searchBy,
  //         director_id: director_id,
  //         actor_id: actor_id,
  //         genre_id: genre_id,
  //         trailer_url: null,
  //         detail: data["overview"],
  //         views: null,
  //         rating: data["vote_average"],
  //         maturity_rating: "all age",
  //         subtitle: null,
  //         publish_year: null,
  //         released: data["release_date"].split("-")[0],
  //         upload_video: null,
  //         featured: null,
  //         series: null,
  //         type: "M",
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
  //       movieRef = docRef;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //     try {
  //       await addDoc(collection(db, STATIC_WORDS.VIDEO_LINKS), {
  //         movie_id: movieRef,
  //         episode_id: null,
  //         type: "upload_video",
  //         url_360: null,
  //         url_480: null,
  //         url_720: null,
  //         url_1080: null,
  //         created_at: serverTimestamp(),
  //         updated_at: serverTimestamp(),
  //         upload_video: selectKey,
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // await fetchDataAndStore();
      console.log("asdf");
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
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
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
              <div className="form-header-title">Edit Movie</div>
              <Link to="/movies">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                  Back
                </button>
              </Link>
            </div>
            <div className="form-block">
              <div className="form-block-inside">
                <div>Search Movie By TMDB ID</div>
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
                  <label htmlFor="movieName">Movie Name:</label>
                  <input
                    type="text"
                    id="movieName"
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    className="p-2 text-sm"
                    placeholder="Enter Movie Title"
                  />
                </div>
              ) : (
                <div className="form-block-inside">
                  <label htmlFor="movieTMDB">Movie TMDB ID:</label>
                  <input
                    id="movieTMDB"
                    type="text"
                    value={movieTmdbId}
                    onChange={(e) => setMovieTmdbId(e.target.value)}
                    className="p-2 text-sm"
                    placeholder="Enter TMDB ID"
                  />
                </div>
              )}

              <div className="form-block-inside">
                <label htmlFor="movieSlug">Movie Slug:</label>
                <input
                  type="text"
                  id="movieSlug"
                  className="p-2 text-sm"
                  value={movieSlug}
                  onChange={(e) => setMovieSlug(e.target.value)}
                  placeholder="Enter Movie Slug"
                />
              </div>
            </div>
            <div className="form-block">
              <div className="form-block-inside">
                <div>Upcoming Movie?:</div>
                <label htmlFor="upcomingMovie" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="upcomingMovie"
                    checked={isUpcoming}
                    onChange={(e) => setIsUpcoming(e.target.checked)}
                  />

                  <span className="slider"></span>
                </label>
              </div>
              {isUpcoming ? (
                <div className="form-block-inside">
                  <label>Upcoming Date:</label>
                  <input
                    type="date"
                    value={upcomingDate}
                    onChange={(e) => setUpcomingDate(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="form-block-inside">
                    <label htmlFor="videoType">Video Type:</label>
                    <select
                      id="videoType"
                      // value={videoUpload}
                      // onChange={handleVideoUploadChange}
                      value={selectedOption}
                      onChange={handleSelectChange}
                      className="p-2 text-sm"
                    >
                      <option value="url">
                        Customer URL/Youtube URL/Vimeo URL
                      </option>
                      <option value="upload">Upload Video</option>
                      <option value="multi">
                        Multi Quality Custom URL & URL Upload
                      </option>
                    </select>
                  </div>
                  {selectedOption === "url" ? (
                    <div className="form-block-inside">
                      <label htmlFor="iframeUrl">
                        Enter Custom URL or Vimeo or Youtube URL:
                      </label>
                      <input
                        type="text"
                        id="iframeUrl"
                        className="p-2 text-sm"
                        placeholder="Enter Custom URL or Vimeo or Youtube URL"
                      />
                    </div>
                  ) : selectedOption === "upload" ? (
                    <>
                      <div className="form-block-inside">
                        <label htmlFor="upload">Upload Video:</label>
                        <input
                          type="text"
                          id="upload"
                          value={selectKey}
                          className="p-2 text-sm"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(true);
                            setObjectKey("movies_upload_wasabi/");
                          }}
                        >
                          Choose A Video
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-block-inside">
                        <label htmlFor="url_360">Upload Video in 360p:</label>
                        <input
                          type="text"
                          id="url_360"
                          className="p-2 text-sm"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(true);
                            setObjectKey("movies_upload_wasabi/url_360/");
                          }}
                        >
                          Choose A Video
                        </button>
                      </div>
                      <div className="form-block-inside">
                        <label htmlFor="url_480">Upload Video in 480p:</label>
                        <input
                          type="text"
                          id="url_480"
                          className="p-2 text-sm"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(true);
                            setObjectKey("movies_upload_wasabi/url_480/");
                          }}
                        >
                          Choose A Video
                        </button>
                      </div>
                      <div className="form-block-inside">
                        <label htmlFor="url_720">Upload Video in 720p:</label>
                        <input
                          type="text"
                          className="p-2 text-sm"
                          id="url_720"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(true);
                            setObjectKey("movies_upload_wasabi/url_720/");
                          }}
                        >
                          Choose A Video
                        </button>
                      </div>
                      <div className="form-block-inside">
                        <label htmlFor="url_1080">Upload Video in 1080p:</label>
                        <input
                          type="text"
                          id="url_1080"
                          className="p-2 text-sm"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(true);
                            setObjectKey("movies_upload_wasabi/url_1080/");
                          }}
                        >
                          Choose A Video
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="form-block">
              {/* <div className="form-block-inside">
                <label htmlFor="audioLanguages">Audio Languages:</label>
                <input type="text" id="audioLanguages" placeholder="" />
              </div> */}
              <div className="form-block-inside">
                <label htmlFor="maturityRating">Maturity Rating:</label>
                <select
                  id="maturityRating"
                  value={selectedMaturity}
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
                  value={metaKeyWord}
                  onChange={(e) => setMetaKeyWord(e.target.value)}
                  className="p-2 text-sm"
                />
              </div>
              <div className="form-block-inside">
                <label htmlFor="metaDescription">Meta Description:</label>
                <textarea
                  name=""
                  id="metaDescription"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="p-2 text-sm"
                  cols="30"
                ></textarea>
              </div>
            </div>
            <div className="form-block">
              <div className="form-block-inside">
                <div>Series:</div>
                <label htmlFor="series" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="series"
                    checked={isSeries}
                    onChange={() => setIsSeries(!isSeries)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
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
              <div className="form-block-inside">
                <div>Subtitle:</div>
                <label htmlFor="subtitle" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="subtitle"
                    checked={hasSubTitle}
                    onChange={() => setHasSubTitle(!hasSubTitle)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <div>Protected Video?:</div>
                <label htmlFor="protectedVideo" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="protectedVideo"
                    checked={isProtected}
                    onChange={() => setIsProtected(!isProtected)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <div>Choose Custom Thumbnail and Poster:</div>
                <label htmlFor="customThumbnail" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="customThumbnail"
                    onChange={() => setHasCustomThumbnail(!hasCustomThumbnail)}
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
                  className="p-2 text-sm"
                  cols="30"
                  value={myanDesc}
                  onChange={(e) => setMyanDesc(e.target.value)}
                ></textarea>
              </div>
            </div>
            <CustomModal
              showModal={showModal}
              handleClose={handleClose}
              handleSuccess={handleSuccess}
              handleSelect={handleSelect}
              handleSearch={handleSearch}
              objects={objects}
            />
            <div className="form-block">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovie;
