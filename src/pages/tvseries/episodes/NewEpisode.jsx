import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import "../../../style/episode.scss";
import "../../../style/new.scss";
import { useEffect, useState } from "react";
import { STATIC_WORDS } from "../../../assets/STATIC_WORDS";
import { db, storage } from "../../../configs/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import axios from "axios";
import { fromURL } from "image-resize-compress";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Delete, Edit, TroubleshootSharp } from "@mui/icons-material";
import ImportCSV from "../../../components/import/ImportCSV";
import Loading from "react-loading";
import { CustomModal } from "../../../components/widget/CustomModal";
import {
  ListObjects,
  SearchObjects,
} from "../../new/NewMovieHelper/FetchObjects";

const NewEpisode = ({ title }) => {
  const { id } = useParams();
  const [seasonSlug, setSeasonSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [episodeNumber, setEpisodeNumber] = useState();
  const [episodeTitle, setEpisodeTitle] = useState();
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [edit, setEdit] = useState(false);
  const [duration, setDuration] = useState();
  const [data, setData] = useState([]);
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState("url");
  const { tmdb_id, tvSeriesId, season_number } = location.state;
  const [customURL, setCustomURL] = useState(null);
  const [selectKey, setSelectKey] = useState("");
  const [objectKey, setObjectKey] = useState("tvshow_upload_wasabi");
  const [showModal, setShowModal] = useState(false);
  const [objects, setObjects] = useState([]);
  const [continuationToken, setContinuationToken] = useState(null);

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

  var handleClose = () => {
    setShowModal(false);
    setObjects([]);
    setContinuationToken(null);
  };

  var handleSuccess = () => console.log("success");

  const handleSelect = (key) => {
    setSelectKey(key);
    setShowModal(false);
    setContinuationToken(null);
  };

  const handleIsLoading = (value) => {
    setIsLoading(value);
  };

  useEffect(() => {
    const fetchData = async (key) => {
      try {
        console.log(key);
        const { objects: fetchedObjects, continuationToken: nextToken } =
          await ListObjects(continuationToken, key);
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
        fetchData(objectKey);
      }
    };

    const modalContentElement = document.getElementById("custom-modal");

    if (showModal) {
      if (continuationToken === null) fetchData(objectKey);
      modalContentElement.addEventListener("scroll", handleScrollEvent);
    }

    return () => {
      if (modalContentElement) {
        modalContentElement.removeEventListener("scroll", handleScrollEvent);
      }
    };
  }, [showModal, continuationToken, objectKey]);

  console.log(objects);
  useEffect(() => {
    const fetchData = async () => {
      let list = [];
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, STATIC_WORDS.EPISODES),
            where("seasonsId", "==", id)
          )
        );
        if (querySnapshot) {
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, data: doc.data() });
          });
          setData(list);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (id) => {
    const fetchData = async (docRef) => {
      try {
        setIsLoading(true);
        const querySnapshot = await getDoc(
          doc(db, `${STATIC_WORDS.EPISODES}/${docRef}`)
        );
        const data = querySnapshot.data();
        setEpisodeNumber(data.episode_no);
        setEpisodeTitle(data.title);
        setDuration(data.duration);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    if (id) fetchData(id);
  };

  async function fetchDataAndStore() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
    console.log("asdf");
    const episode_data = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${season_number}/episode/${episodeNumber}?api_key=${TMDB_API_KEY}`
    );

    let thumbnailUrl = null;
    if (episode_data["data"]["still_path"]) {
      const thumbnail = await fromURL(
        `https://image.tmdb.org/t/p/original/${episode_data["data"]["still_path"]}`,
        1,
        0,
        0,
        "webp"
      );
      const thumbnailRef = ref(
        storage,
        `tvseries/episode/poster/${episode_data["data"]["still_path"]}`
      );

      await uploadBytesResumable(thumbnailRef, thumbnail);
      thumbnailUrl = await getDownloadURL(thumbnailRef);
    }

    try {
      const obj = {
        seasonsId: id,
        tmdb_id: episode_data["data"]["id"],
        thumbnail: thumbnailUrl ?? "",
        episode_no: episodeNumber,
        title: episodeTitle,
        tmdb: "Y",
        duration: duration,
        detail: episode_data["data"]["overview"],
        a_language: "",
        subtitle: "",
        release: "",
        type: "E",
        // created_by: "",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, STATIC_WORDS.EPISODES), obj);
      setData([...data, { id: docRef.id, data: obj }]);
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

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    console.log("asdf");
    // setIsLoading(true);
    // try {
    //   await fetchDataAndStore();
    // } catch (error) {
    //   console.error("Error:", error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await deleteDoc(doc(db, STATIC_WORDS.EPISODES, id));
      setData(data.filter((item) => item.id !== id));
      setIsLoading(false);
    } catch (err) {
      console.log(err);
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
        <div className="new-episode-container">
          <div className="right-side">
            <div className="right-header">
              <div className="right-header-title">Manage Season Of Series</div>
              <Link to={`/tvseries/${tvSeriesId}/season`}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                  Back
                </button>
              </Link>
              <ImportCSV
                docName={STATIC_WORDS.EPISODES}
                isLoading={handleIsLoading}
              />
              <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                Add Episode
              </div>
            </div>
            {edit ? (
              <form onSubmit={handleSubmitEdit}>
                <div className="season-no">
                  <label htmlFor="episodeTitle">Episode Title</label>
                  <input
                    id="episodeTitle"
                    type="text"
                    value={episodeTitle}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                  />
                </div>
                <div className="season-no">
                  <label htmlFor="episodeNo">Episode No.</label>
                  <input
                    id="episodeNo"
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                  />
                </div>
                <div className="season-slug">
                  <label htmlFor="duration">Duration</label>
                  <input
                    id="duration"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="custom-thumbnail">
                  <div>Choose Custom Thumbnail and Poster</div>
                  <label htmlFor="customThumbnail" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="customThumbnail"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-block-inside">
                  <label htmlFor="videoType">Video Type:</label>
                  <select
                    id="videoType"
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="p-2 text-sm cursor-pointer"
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
                      onChange={(e) => setCustomURL(e.target.value)}
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
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/");
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
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                        id="url_360"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_360/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="form-block-inside">
                      <label htmlFor="url_480">Upload Video in 480p:</label>
                      <input
                        id="url_480"
                        type="text"
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_480/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="form-block-inside">
                      <label htmlFor="url_720">Upload Video in 720p:</label>
                      <input
                        type="text"
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                        id="url_720"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_720/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="form-block-inside">
                      <label htmlFor="url_1080">Upload Video in 1080p:</label>
                      <input
                        type="text"
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                        id="url_1080"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_1080/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                  </>
                )}

                <div className="protected">
                  <div>Subtitle</div>
                  <label htmlFor="subtitle" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="subtitle"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div>Want IMDB Ratings And More Or Custom?</div>
                <div style={{ display: "flex" }}>
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
                <div className="bottom-create">
                  <button
                    type="reset"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded mr-6"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                  >
                    Edit
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="season-no">
                  <label htmlFor="episodeTitle">Episode Title</label>
                  <input
                    id="episodeTitle"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                  />
                </div>
                <div className="season-no">
                  <label htmlFor="episodeNo">Episode No.</label>
                  <input
                    id="episodeNo"
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                  />
                </div>
                <div className="season-slug">
                  <label htmlFor="duration">Duration</label>
                  <input
                    id="duration"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="custom-thumbnail">
                  <div>Choose Custom Thumbnail and Poster</div>
                  <label htmlFor="customThumbnail" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="customThumbnail"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-block-inside">
                  <label htmlFor="videoType">Video Type:</label>
                  <select
                    id="videoType"
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="p-2 text-sm cursor-pointer"
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
                      onChange={(e) => setCustomURL(e.target.value)}
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
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/");
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
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                        id="url_360"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_360/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="form-block-inside">
                      <label htmlFor="url_480">Upload Video in 480p:</label>
                      <input
                        id="url_480"
                        type="text"
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_480/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="form-block-inside">
                      <label htmlFor="url_720">Upload Video in 720p:</label>
                      <input
                        type="text"
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                        id="url_720"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_720/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="form-block-inside">
                      <label htmlFor="url_1080">Upload Video in 1080p:</label>
                      <input
                        type="text"
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="p-2 text-sm"
                        id="url_1080"
                      />
                    </div>
                    <div className="form-block-inside">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_1080/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                  </>
                )}

                <div className="protected">
                  <div>Subtitle</div>
                  <label htmlFor="subtitle" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="subtitle"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div>Want IMDB Ratings And More Or Custom?</div>
                <div style={{ display: "flex" }}>
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
                <CustomModal
                  showModal={showModal}
                  handleClose={handleClose}
                  handleSuccess={handleSuccess}
                  handleSelect={handleSelect}
                  handleSearch={handleSearch}
                  objects={objects}
                />
                <div className="bottom-create">
                  <button
                    type="reset"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded mr-6"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="left-side">
            <div className="episode-list">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>ByTMDB</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 &&
                    data.map((doc) => (
                      <>
                        <tr>
                          <td className="cell">1</td>
                          <td className="cell">{doc.data.title}</td>
                          <td className="cell">{doc.data.tmdb}</td>
                          <td className="cell">{doc.data.duration} mins</td>
                          <td className="cell">
                            <Edit
                              onClick={() => {
                                setEdit((preEdit) => !preEdit);
                                handleEdit(doc.id);
                              }}
                              style={{ cursor: "pointer" }}
                            />
                            <Delete
                              className="delete"
                              onClick={() => handleDelete(doc.id)}
                            />
                          </td>
                        </tr>
                      </>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEpisode;
