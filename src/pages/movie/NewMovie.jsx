import "../../style/new.scss";
import "../../style/modal.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import Loading from "react-loading";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, storage } from "../../configs/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { Link } from "react-router-dom";
import { GetData } from "../new/NewMovieHelper/GetData";
import { ForActors } from "../new/NewMovieHelper/ForActors";
import { ForDirectors } from "../new/NewMovieHelper/ForDirectors";
import { ForGenres } from "../new/NewMovieHelper/ForGenres";
import { CustomModal } from "../../components/widget/CustomModal";
import { SearchObjects } from "../new/NewMovieHelper/FetchObjects";

const NewMovie = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchByToggle, setSearchByToggle] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [upcomingDate, setUpcomingDate] = useState("");
  const [videoUpload, setVideoUpload] = useState("");
  const [selectedOption, setSelectedOption] = useState("url");
  const [movieSlug, setMovieSlug] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectKey, setSelectKey] = useState(null);

  var handleClose = () => setShowModal(false);
  const handleSearch = (data, e) => {
    if (e.key === "Enter") {
      const fetchObj = SearchObjects(data);
      console.log(data);
      console.log(fetchObj);
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
  };

  const handleSearchByToggle = (event) => {
    setSearchByToggle(event.target.checked);
    event.target.checked ? setSearchBy("title") : setSearchBy("byId");
  };

  const handleMovieTitleChange = (event) => {
    setMovieTitle(event.target.value);
  };

  const handleUpcomingToggle = (event) => {
    setIsUpcoming(event.target.checked);
  };

  const handleUpcomingDateChange = (event) => {
    setUpcomingDate(event.target.value);
  };

  const handleVideoUploadChange = (event) => {
    setVideoUpload(event.target.value);
  };

  const handleMovieSlug = (event) => {
    setMovieSlug(event.target.value);
  };

  async function fetchDataAndStore() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
    const movieSnapShot = await getDocs(collection(db, "movies"));

    if (!movieSnapShot.empty) {
      const q = query(
        collection(db, "movies"),
        where("tmdb_id", "==", Number(movieTitle))
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        console.log("already exist");
        return;
      }
    }

    const data = await GetData(searchBy, TMDB_API_KEY, movieTitle);
    let credits = null;
    if (data["id"]) {
      credits = await axios.get(
        `https://api.themoviedb.org/3/movie/${data["id"]}/credits?api_key=${TMDB_API_KEY}`
      );
    } else {
      console.log("movie does not found on TMDB Server");
      return;
    }

    const [actor_id, director_id, genre_id, poster, thumbnail] =
      await Promise.all([
        ForActors(TMDB_API_KEY, credits),
        ForDirectors(TMDB_API_KEY, credits),
        ForGenres(data),
        axios.get(
          `https://image.tmdb.org/t/p/original/${data["poster_path"]}`,
          {
            responseType: "arraybuffer",
          }
        ),
        await axios.get(
          `https://image.tmdb.org/t/p/original/${data["backdrop_path"]}`,
          { responseType: "arraybuffer" }
        ),
      ]);

    console.log("done");
    let posterURL = null;
    let thumbnailURL = null;

    try {
      const posterRef = ref(storage, `posters/${data["poster_path"]}`);
      const thumbnailRef = ref(storage, `thumbnail/${data["backdrop_path"]}`);

      await Promise.all([
        uploadBytesResumable(posterRef, poster.data),
        uploadBytesResumable(thumbnailRef, thumbnail.data),
      ]);

      [posterURL, thumbnailURL] = await Promise.all([
        getDownloadURL(posterRef),
        getDownloadURL(thumbnailRef),
      ]);
    } catch (error) {
      console.log(error, "poster and thumnail");
    }
    let movieRef = null;
    try {
      const docRef = await addDoc(collection(db, "movies"), {
        tmdb_id: data["id"],
        title: data["title"],
        slug: movieSlug,
        duration: 'data["runtime"]',
        thumbnail: thumbnailURL,
        poster: posterURL,
        tmdb: "Y",
        fetch_by: searchBy,
        director_id: director_id,
        actor_id: actor_id,
        genre_id: genre_id,
        trailer_url: null,
        detail: data["overview"],
        views: null,
        rating: data["vote_average"],
        maturity_rating: "all age",
        subtitle: null,
        publish_year: null,
        released: data["release_date"].split("-")[0],
        upload_video: null,
        featured: null,
        series: null,
        type: "M",
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
    try {
      const docRef = await addDoc(collection(db, "videolinks"), {
        movie_id: movieRef,
        episode_id: null,
        type: "upload_video",
        url_360: null,
        url_480: null,
        url_720: null,
        url_1080: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        upload_video: selectKey,
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
              <div className="form-header-title">Create Movie</div>
              <Link to="/movies">
                <button className="back-btn">Back</button>
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
                    onChange={handleMovieTitleChange}
                    placeholder="Enter Movie Title"
                  />
                </div>
              ) : (
                <div className="form-block-inside">
                  <label htmlFor="movieTMDB">Movie TMDB ID:</label>
                  <input
                    id="movieTMDB"
                    type="text"
                    value={movieTitle}
                    onChange={handleMovieTitleChange}
                    placeholder="Enter TMDB ID"
                  />
                </div>
              )}

              <div className="form-block-inside">
                <label htmlFor="movieSlug">Movie Slug:</label>
                <input
                  type="text"
                  id="movieSlug"
                  onChange={handleMovieSlug}
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
                    onChange={handleUpcomingToggle}
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
                    onChange={handleUpcomingDateChange}
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
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
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
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
                        >
                          Choose A Video
                        </button>
                      </div>
                      <div className="form-block-inside">
                        <label htmlFor="url_480">Upload Video in 480p:</label>
                        <input
                          type="text"
                          id="url_480"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
                        >
                          Choose A Video
                        </button>
                      </div>
                      <div className="form-block-inside">
                        <label htmlFor="url_720">Upload Video in 720p:</label>
                        <input
                          type="text"
                          id="url_720"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
                        >
                          Choose A Video
                        </button>
                      </div>
                      <div className="form-block-inside">
                        <label htmlFor="url_1080">Upload Video in 1080p:</label>
                        <input
                          type="text"
                          id="url_1080"
                          placeholder="Choose A Video"
                        />
                      </div>
                      <div className="form-block-inside">
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
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
              <div className="form-block-inside">
                <label htmlFor="audioLanguages">Audio Languages:</label>
                <input type="text" id="audioLanguages" placeholder="" />
              </div>
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
                <div>Series:</div>
                <label htmlFor="series" className="toggle-switch">
                  <input type="checkbox" id="series" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <div>Featured:</div>
                <label htmlFor="featured" className="toggle-switch">
                  <input type="checkbox" id="featured" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <div>Subtitle:</div>
                <label htmlFor="subtitle" className="toggle-switch">
                  <input type="checkbox" id="subtitle" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <div>Protected Video?:</div>
                <label htmlFor="protectedVideo" className="toggle-switch">
                  <input type="checkbox" id="protectedVideo" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <div>Choose Custom Thumbnail and Poster:</div>
                <label htmlFor="customThumbnail" className="toggle-switch">
                  <input type="checkbox" id="customThumbnail" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-block-inside">
                <label htmlFor="selectMenu">Select Menu*:</label>
                <input type="checkbox" id="selectMenu" />
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
                      checked
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
            <CustomModal
              showModal={showModal}
              handleClose={handleClose}
              handleSuccess={handleSuccess}
              handleSelect={handleSelect}
              // handleSearch={handleSearch}
            />
            <div className="form-block">
              <button type="submit">Create</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMovie;