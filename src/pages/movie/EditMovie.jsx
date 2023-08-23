import { useEffect, useState } from "react";
import Loading from "react-loading";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../../configs/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { GetData } from "../../helper/GetData";
import { ForActors } from "../../helper/ForActors";
import { ForDirectors } from "../../helper/ForDirectors";
import { ForGenres } from "../../helper/ForGenres";
import { CustomModal } from "../../components/widget/CustomModal";
import { ListObjects, SearchObjects } from "../../helper/FetchObjects";
import { fromURL } from "image-resize-compress";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { isDocumentEmpty } from "../../helper/Helpers";
import { COUNTRY } from "../../assets/COUNTRY";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditMovie = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  // const [customURL, setCustomURL] = useState(null);
  const [searchByToggle, setSearchByToggle] = useState(false);
  const [searchBy, setSearchBy] = useState("byId");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieID, setMovieID] = useState("");
  const [movieSlug, setMovieSlug] = useState("");
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [upcomingDate, setUpcomingDate] = useState("");
  const [selectedOption, setSelectedOption] = useState("upload");
  const [isSeries, setIsSeries] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [hasSubTitle, setHasSubTitle] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [checkMenuAll, setCheckMenuAll] = useState(false);
  const [hasCustomThumbnail, setHasCustomThumbnail] = useState(false);
  const [selectKey, setSelectKey] = useState(null);
  const [selectedMaturity, setSelectedMaturity] = useState("all age");
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [metaKeyWord, setMetaKeyWord] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [myanDesc, setMyanDesc] = useState("");
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [oldMovieId, setOldMovieId] = useState("");

  const [objectKey, setObjectKey] = useState("movies_upload_wasabi");
  const [objects, setObjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [continuationToken, setContinuationToken] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

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
        setLoadingModal(true);
        const fetchObj = await SearchObjects(search, objectKey);
        setObjects(fetchObj);
        setLoadingModal(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  var handleSuccess = () => {
    console.log("success");
  };

  const handleSelect = (key) => {
    setSelectKey(key);
    setShowModal(false);
    setObjects([]);
    setContinuationToken(null);
  };

  const handleSearchByToggle = (event) => {
    setSearchByToggle(event.target.checked);
    event.target.checked ? setSearchBy("title") : setSearchBy("byId");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingModal(true);
        const { objects: fetchedObjects, continuationToken: nextToken } =
          await ListObjects(continuationToken);
        setObjects((prevObjects) => [...prevObjects, ...fetchedObjects]);
        setContinuationToken(nextToken);
        setLoadingModal(false);
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
        setMovieID(data.tmdb_id);
        setOldMovieId(data.tmdb_id);
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

  async function fetchDataAndStore() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

    if (oldMovieId !== movieID) {
      if (!(await isDocumentEmpty(STATIC_WORDS.MOVIES))) {
        const q = query(
          collection(db, STATIC_WORDS.MOVIES),
          where("tmdb_id", "==", movieID)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          console.log("already exist");
          return;
        }
      }
    }

    const data = movieID
      ? await GetData(searchBy, TMDB_API_KEY, movieID, STATIC_WORDS.MOVIES)
      : await GetData(searchBy, TMDB_API_KEY, movieTitle, STATIC_WORDS.MOVIES);

    let credits = null;
    if (data["id"]) {
      credits = await axios.get(
        `https://api.themoviedb.org/3/movie/${data["id"]}/credits?api_key=${TMDB_API_KEY}`
      );
    } else {
      console.log("movie does not found on TMDB Server");
      return;
    }

    const [actor_id, director_id, genre_id] = await Promise.all([
      ForActors(TMDB_API_KEY, credits),
      ForDirectors(TMDB_API_KEY, credits),
      ForGenres(data),
    ]);

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
      const docRef = doc(db, STATIC_WORDS.MOVIES, id);
      await updateDoc(docRef, {
        tmdb_id: String(data["id"]) ?? "",
        title: data["title"],
        slug: movieSlug,
        keyword: metaKeyWord,
        description: metaDesc,
        duration: String(data["runtime"]),
        thumbnail: thumbnailURL,
        poster: posterURL,
        tmdb: "Y",
        fetch_by: searchBy,
        director_id: director_id,
        actor_id: actor_id,
        genre_id: genre_id,
        trailer_url: "",
        detail: data["overview"],
        views: "",
        rating: data["vote_average"],
        maturity_rating: selectedMaturity,
        subtitle: hasSubTitle,
        publish_year: data["release_date"].split("-")[0],
        released: "",
        upload_video: "",
        featured: isFeatured,
        series: isSeries,
        type: isSeries ? "S" : "M",
        status: true,
        is_protected: isProtected,
        // created_by: null,
        updated_at: serverTimestamp(),
        is_upcoming: isUpcoming,
        upcoming_date: isUpcoming
          ? new Date(upcomingDate)
          : new Timestamp(0, 0),
        is_kids: false,
        description_myanmar: myanDesc,
        country: selectedCountry,
        // updated_by: null,
        channel: 0,
      });
    } catch (error) {
      console.log(error);
    }
    try {
      const q = query(
        collection(db, STATIC_WORDS.VIDEO_LINKS),
        where("movieId", "==", "/movies/" + id)
      );
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot, id);
      const docRef = doc(
        db,
        STATIC_WORDS.VIDEO_LINKS,
        querySnapshot.docs[0].id
      );
      await updateDoc(docRef, {
        //   type: "upload_video",
        // url_360: await getPresignedUrlMovie("", "url_360"),
        // url_480: await getPresignedUrlMovie("", "url_480"),
        // url_720: await getPresignedUrlMovie("", "url_720"),
        // url_1080: await getPresignedUrlMovie("", "url_1080"),
        updated_at: serverTimestamp(),
        // upload_video: await getPresignedUrlMovie(selectKey, "upload_video"),
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
      console.log("asdf");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
    toast("Movie Updated Successfully!");
  };

  return (
    <div className="tw-pt-5 tw-px-2">
      {isLoading && (
        <div className="tw-absolute tw-bg-black tw-z-50 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-opacity-50 tw-flex tw-justify-center tw-items-center">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}

      <ToastContainer />
      <div className="tw-mx-2">
        <h1 className="tw-font-bold tw-text-slate-500 tw-mb-2">{title}</h1>

        <form onSubmit={handleSubmit}>
          <div className="tw-p-4 tw-bg-white">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
              <div className="tw-text-lg tw-font-bold">Create Movie</div>
              <Link
                to="/movies"
                className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
              >
                Back
              </Link>
            </div>

            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">Search Movie By TMDB ID</div>
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
                    Movie Name:
                  </label>
                  <input
                    type="text"
                    id="movieName"
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    placeholder="Enter Movie Title"
                  />
                </div>
              ) : (
                <div className="tw-flex tw-flex-col">
                  <label htmlFor="movieTMDB" className="tw-text-slate-800">
                    Movie TMDB ID:
                  </label>
                  <input
                    id="movieTMDB"
                    type="text"
                    value={movieID}
                    onChange={(e) => setMovieID(e.target.value)}
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    placeholder="Enter TMDB ID"
                  />
                </div>
              )}

              <div className="tw-flex tw-flex-col">
                <label htmlFor="movieSlug" className="tw-text-slate-800">
                  Movie Slug:
                </label>
                <input
                  type="text"
                  id="movieSlug"
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                  value={movieSlug}
                  onChange={(e) => setMovieSlug(e.target.value)}
                  placeholder="Enter Movie Slug"
                />
              </div>
            </div>
            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">Upcoming Movie?:</div>
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
                <div className="tw-flex tw-flex-col">
                  <label className="tw-text-slate-800">Upcoming Date:</label>
                  <input
                    type="date"
                    value={upcomingDate}
                    onChange={(e) => setUpcomingDate(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="tw-flex tw-flex-col">
                    <label htmlFor="videoType" className="tw-text-slate-800">
                      Video Type:
                    </label>
                    <select
                      id="videoType"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
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
                    <div className="tw-flex tw-flex-col">
                      <label htmlFor="iframeUrl" className="tw-text-slate-800">
                        Enter Custom URL or Vimeo or Youtube URL:
                      </label>
                      <input
                        type="text"
                        id="iframeUrl"
                        className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                        placeholder="Enter Custom URL or Vimeo or Youtube URL"
                      />
                    </div>
                  ) : selectedOption === "upload" ? (
                    <>
                      <div className="tw-flex tw-flex-col">
                        <label htmlFor="upload" className="tw-text-slate-800">
                          Upload Video:
                        </label>
                        <input
                          type="text"
                          id="upload"
                          value={selectKey}
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="tw-flex tw-flex-col">
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
                      <div className="tw-flex tw-flex-col">
                        <label htmlFor="url_360" className="tw-text-slate-800">
                          Upload Video in 360p:
                        </label>
                        <input
                          type="text"
                          id="url_360"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="tw-flex tw-flex-col">
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
                      <div className="tw-flex tw-flex-col">
                        <label htmlFor="url_480" className="tw-text-slate-800">
                          Upload Video in 480p:
                        </label>
                        <input
                          type="text"
                          id="url_480"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="tw-flex tw-flex-col">
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
                      <div className="tw-flex tw-flex-col">
                        <label htmlFor="url_720" className="tw-text-slate-800">
                          Upload Video in 720p:
                        </label>
                        <input
                          type="text"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          id="url_720"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="tw-flex tw-flex-col">
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
                      <div className="tw-flex tw-flex-col">
                        <label htmlFor="url_1080" className="tw-text-slate-800">
                          Upload Video in 1080p:
                        </label>
                        <input
                          type="text"
                          id="url_1080"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="tw-flex tw-flex-col">
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
            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              {/* <div className="tw-flex tw-flex-col">
                <label htmlFor="audioLanguages">Audio Languages:</label>
                <input type="text" id="audioLanguages" placeholder="" />
              </div> */}
              <div className="tw-flex tw-flex-col">
                <label htmlFor="maturityRating" className="tw-text-slate-800">
                  Maturity Rating:
                </label>
                <select
                  id="maturityRating"
                  value={selectedMaturity}
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
                  onChange={(e) =>
                    setSelectedCountry(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
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
                  placeholder="Enter Meta Keyword"
                  value={metaKeyWord}
                  onChange={(e) => setMetaKeyWord(e.target.value)}
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                />
              </div>
              <div className="tw-flex tw-flex-col">
                <label htmlFor="metaDescription" className="tw-text-slate-800">
                  Meta Description:
                </label>
                <textarea
                  name=""
                  id="metaDescription"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                  cols="30"
                  rows="3"
                  placeholder="Enter Meta Description"
                ></textarea>
              </div>
            </div>
            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">Series:</div>
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
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">Featured:</div>
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
                <div className="tw-text-slate-800">Subtitle:</div>
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
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">Protected Video?:</div>
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
              <div className="tw-flex tw-flex-col">
                <div className="tw-text-slate-800">
                  Choose Custom Thumbnail and Poster:
                </div>
                <label htmlFor="customThumbnail" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="customThumbnail"
                    onChange={() => setHasCustomThumbnail(!hasCustomThumbnail)}
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
            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-col">
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
                  className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                  cols="30"
                  rows="3"
                  placeholder="Enter Myanmar Description"
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
              loadingModal={loadingModal}
            />
            <div className="tw-bg-slate-300 tw-rounded-md tw-mb-4 tw-p-7 tw-flex tw-gap-x-4 tw-flex-wrap">
              <button
                type="submit"
                className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
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
