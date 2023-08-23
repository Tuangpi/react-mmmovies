import { Link, useLocation, useParams } from "react-router-dom";
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
  updateDoc,
  where,
} from "firebase/firestore";
import axios from "axios";
import { fromURL } from "image-resize-compress";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Delete, Edit } from "@mui/icons-material";
import ImportCSV from "../../../components/import/ImportCSV";
import Loading from "react-loading";
import { CustomModal } from "../../../components/widget/CustomModal";
import { ListObjects, SearchObjects } from "../../../helper/FetchObjects";
import { getPresignedUrlSeries } from "../../../helper/Helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewEpisode = ({ title }) => {
  const { id } = useParams();
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
  const [loadingModal, setLoadingModal] = useState(false);

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
        setLoadingModal(true);
        const { objects: fetchedObjects, continuationToken: nextToken } =
          await ListObjects(continuationToken, key);
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
  }, [id]);
  console.log(data);
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

    let episodeRef = null;
    try {
      const obj = {
        seasonsId: id,
        tmdb_id: String(episode_data["data"]["id"]),
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
      episodeRef = docRef;
      setData([...data, { id: docRef.id, data: obj }]);
    } catch (error) {
      console.log(error);
    }

    try {
      await addDoc(collection(db, STATIC_WORDS.VIDEO_LINKS), {
        episodeId: episodeRef,
        type: "upload_video",
        url_360: await getPresignedUrlSeries(selectKey, "url_360"),
        url_480: await getPresignedUrlSeries(selectKey, "url_480"),
        url_720: await getPresignedUrlSeries(selectKey, "url_720"),
        url_1080: await getPresignedUrlSeries(selectKey, "url_1080"),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchDataAndEdit() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
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
        tmdb_id: String(episode_data["data"]["id"]),
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
        updated_at: serverTimestamp(),
      };
      const docRef = doc(db, STATIC_WORDS.EP, id);
      await updateDoc(docRef, obj);
      setData([...data, { id: docRef.id, data: obj }]);
    } catch (error) {
      console.log(error);
    }

    // try {
    //   await addDoc(collection(db, STATIC_WORDS.VIDEO_LINKS), {
    //     episodeId: episodeRef,
    //     type: "upload_video",
    //     url_360: await getPresignedUrlSeries(selectKey, "url_360"),
    //     url_480: await getPresignedUrlSeries(selectKey, "url_480"),
    //     url_720: await getPresignedUrlSeries(selectKey, "url_720"),
    //     url_1080: await getPresignedUrlSeries(selectKey, "url_1080"),
    //     created_at: serverTimestamp(),
    //     updated_at: serverTimestamp(),
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    toast("Create Episode Success!");
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    console.log("asdf");
    setIsLoading(true);
    try {
      await fetchDataAndEdit();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
    toast("Update Episode Success!");
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
    toast("Episode Delete Success!");
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
        <h1 className="tw-font-bold tw-text-slate-500">{title}</h1>
        <div className="tw-flex tw-justify-between tw-bg-white tw-p-1 tw-w-full">
          <div className="tw-p-2 tw-w-[56%]">
            <div className="tw-text-slate-600">Manage Season Of Series</div>
            <div className="tw-flex tw-justify-between tw-mt-2 tw-flex-wrap">
              <Link
                to={`/tvseries/${tvSeriesId}/season`}
                className="tw-py-1 tw-px-2 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
              >
                Back
              </Link>
              <ImportCSV
                docName={STATIC_WORDS.EPISODES}
                isLoading={handleIsLoading}
              />
              <div className="tw-py-1 tw-px-2 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50">
                Add Episode
              </div>
            </div>
            {edit ? (
              <form
                onSubmit={handleSubmitEdit}
                className="tw-bg-slate-300 tw-p-2 tw-mt-2 tw-pt-1 tw-rounded-md"
              >
                <div className="tw-flex tw-flex-col">
                  <label
                    htmlFor="episodeTitle"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Episode Title
                  </label>
                  <input
                    id="episodeTitle"
                    type="text"
                    placeholder="Enter Episode Title"
                    value={episodeTitle}
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                  />
                  <label
                    htmlFor="episodeNo"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Episode No.
                  </label>
                  <input
                    id="episodeNo"
                    type="number"
                    placeholder="Enter Episode Number"
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                  />
                  <label
                    htmlFor="duration"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Duration
                  </label>
                  <input
                    id="duration"
                    placeholder="Enter Duration"
                    type="text"
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <div className="tw-text-slate-800 tw-pt-2">
                    Choose Custom Thumbnail and Poster
                  </div>
                  <label htmlFor="customThumbnail" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="customThumbnail"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="tw-flex tw-flex-col">
                  <label
                    htmlFor="videoType"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Video Type:
                  </label>
                  <select
                    id="videoType"
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
                    <label
                      htmlFor="iframeUrl"
                      className="tw-text-slate-800 tw-pt-2"
                    >
                      Enter Custom URL or Vimeo or Youtube URL:
                    </label>
                    <input
                      type="text"
                      id="iframeUrl"
                      onChange={(e) => setCustomURL(e.target.value)}
                      className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                      placeholder="Enter Custom URL or Vimeo or Youtube URL"
                    />
                  </div>
                ) : selectedOption === "upload" ? (
                  <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                    <div className="tw-flex tw-flex-col">
                      <label
                        htmlFor="upload"
                        className="tw-text-slate-800 tw-pt-2"
                      >
                        Upload Video:
                      </label>
                      <input
                        type="text"
                        id="upload"
                        value={selectKey}
                        onChange={(e) => setSelectKey(e.target.value)}
                        placeholder="Choose A Video"
                        className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                      />
                    </div>
                    <button
                      type="button"
                      className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
                      onClick={() => {
                        setShowModal(true);
                        setObjectKey("tvshow_upload_wasabi/");
                      }}
                    >
                      Choose A Video
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_360"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 360p:
                        </label>
                        <input
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          id="url_360"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_360/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_480"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 480p:
                        </label>
                        <input
                          id="url_480"
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_480/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_720"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 720p:
                        </label>
                        <input
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          id="url_720"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_720/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>
                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_1080"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 1080p:
                        </label>
                        <input
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          id="url_1080"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
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
                  <div className="tw-text-slate-800 tw-pt-2">Subtitle</div>
                  <label htmlFor="subtitle" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="subtitle"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="tw-text-slate-800 tw-pt-2">
                  Want IMDB Ratings And More Or Custom?
                </div>
                <div className="tw-flex tw-gap-x-2 tw-pt-2">
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
                <div className="tw-flex tw-gap-x-2 tw-my-5">
                  <button
                    type="reset"
                    className="tw-bg-red-500 hover:tw-bg-red-700 tw-text-white tw-font-bold tw-py-1 tw-px-4 tw-rounded-sm tw-w-full"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-sm tw-w-full tw-text-slate-50"
                  >
                    Edit
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="tw-bg-slate-300 tw-p-2 tw-mt-2 tw-pt-1 tw-rounded-md"
              >
                <div className="tw-flex tw-flex-col">
                  <label
                    htmlFor="episodeTitle"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Episode Title
                  </label>
                  <input
                    id="episodeTitle"
                    type="text"
                    placeholder="Enter Episode Title"
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                  />
                  <label
                    htmlFor="episodeNo"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Episode No.
                  </label>
                  <input
                    id="episodeNo"
                    placeholder="Enter Episode Number"
                    type="number"
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                  />
                  <label
                    htmlFor="duration"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Duration
                  </label>
                  <input
                    id="duration"
                    type="text"
                    placeholder="Enter Episode Duration"
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <div className="tw-text-slate-800 tw-pt-2">
                    Choose Custom Thumbnail and Poster
                  </div>
                  <label htmlFor="customThumbnail" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="customThumbnail"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="tw-flex tw-flex-col">
                  <label
                    htmlFor="videoType"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Video Type:
                  </label>
                  <select
                    id="videoType"
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
                    <label
                      htmlFor="iframeUrl"
                      className="tw-text-slate-800 tw-pt-2"
                    >
                      Enter Custom URL or Vimeo or Youtube URL:
                    </label>
                    <input
                      type="text"
                      id="iframeUrl"
                      onChange={(e) => setCustomURL(e.target.value)}
                      className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                      placeholder="Enter Custom URL or Vimeo or Youtube URL"
                    />
                  </div>
                ) : selectedOption === "upload" ? (
                  <>
                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="upload"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video:
                        </label>
                        <input
                          type="text"
                          id="upload"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
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
                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_360"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 360p:
                        </label>
                        <input
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          id="url_360"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_360/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>

                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_480"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 480p:
                        </label>
                        <input
                          id="url_480"
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_480/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>

                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_720"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 720p:
                        </label>
                        <input
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          id="url_720"
                        />
                      </div>

                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
                        onClick={() => {
                          setShowModal(true);
                          setObjectKey("tvshow_upload_wasabi/url_720/");
                        }}
                      >
                        Choose A Video
                      </button>
                    </div>

                    <div className="tw-flex tw-gap-x-4 tw-flex-wrap tw-items-center">
                      <div className="tw-flex tw-flex-col">
                        <label
                          htmlFor="url_1080"
                          className="tw-text-slate-800 tw-pt-2"
                        >
                          Upload Video in 1080p:
                        </label>
                        <input
                          type="text"
                          value={selectKey}
                          onChange={(e) => setSelectKey(e.target.value)}
                          placeholder="Choose A Video"
                          className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                          id="url_1080"
                        />
                      </div>
                      <button
                        type="button"
                        className="tw-bg-slate-600 tw-text-slate-50 tw-px-2 tw-py-1 tw-border-none tw-outline-none"
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
                  <div className="tw-text-slate-800 tw-pt-2">Subtitle</div>
                  <label htmlFor="subtitle" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="subtitle"
                      //   onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="tw-text-slate-800 tw-pt-2">
                  Want IMDB Ratings And More Or Custom?
                </div>
                <div className="tw-flex tw-gap-x-2 tw-my-5">
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
                <CustomModal
                  showModal={showModal}
                  handleClose={handleClose}
                  handleSuccess={handleSuccess}
                  handleSelect={handleSelect}
                  handleSearch={handleSearch}
                  objects={objects}
                  loadingModal={loadingModal}
                />
                <div className="tw-flex tw-gap-x-2 tw-my-5">
                  <button
                    type="reset"
                    className="tw-bg-red-500 hover:tw-bg-red-700 tw-text-white tw-font-bold tw-py-1 tw-px-4 tw-rounded-sm tw-w-full"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-sm tw-w-full tw-text-slate-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="tw-bg-slate-300 tw-rounded-md tw-w-[44%]">
            <div className="tw-p-2">
              <table className="tw-border-collapse tw-border-spacing-0 tw-w-full">
                <thead className="tw-bg-slate-400">
                  <tr>
                    <th className="tw-text-center tw-px-2">#</th>
                    <th className="tw-text-center tw-px-2">Title</th>
                    <th className="tw-text-center tw-px-2">ByTMDB</th>
                    <th className="tw-text-center tw-px-2">Duration</th>
                    <th className="tw-text-center tw-px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 &&
                    data.map((doc, id) => (
                      <>
                        <tr>
                          <td className="tw-text-center tw-align-middle">
                            {id + 1}
                          </td>
                          <td className="tw-text-center tw-align-middle">
                            {doc.data.title}
                          </td>
                          <td className="tw-text-center tw-align-middle">
                            {doc.data.tmdb}
                          </td>
                          <td className="tw-text-center tw-align-middle">
                            {doc.data.duration} mins
                          </td>
                          <td className="tw-text-center tw-align-middle">
                            <Edit
                              onClick={() => {
                                setEdit((preEdit) => !preEdit);
                                handleEdit(doc.id);
                              }}
                              className="tw-cursor-pointer tw-px-1"
                              style={{ fontSize: "28px" }}
                            />
                            <Delete
                              onClick={() => handleDelete(doc.id)}
                              className="tw-text-red-500 tw-cursor-pointer tw-px-1"
                              style={{ fontSize: "28px" }}
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
