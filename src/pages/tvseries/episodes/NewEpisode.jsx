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
import { Delete, Edit } from "@mui/icons-material";
import ImportCSV from "../../../components/import/ImportCSV";

const NewEpisode = ({ title }) => {
  const { id } = useParams();
  const [seasonSlug, setSeasonSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [episodeNumber, setEpisodeNumber] = useState();
  const [episodeTitle, setEpisodeTitle] = useState();
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [edit, setEdit] = useState(true);
  const [duration, setDuration] = useState();
  const [data, setData] = useState([]);
  const location = useLocation();
  const { tmdb_id, tv_series_id, season_number } = location.state;

  const handleIsLoading = (value) => {
    setIsLoading(value);
  };
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
    console.log("asdf");
    const fetchData = async (docRef) => {
      try {
        const querySnapshot = await getDoc(
          doc(db, `${STATIC_WORDS.EPISODES}/${docRef}`)
        );
        const data = querySnapshot.data();
        setEpisodeNumber(data.episode_no);
        setEpisodeTitle(data.title);
        setDuration(data.duration);
      } catch (err) {
        console.log(err);
      }
    };

    if (edit) {
      console.log("edit");
      if (id) fetchData(id);
    }
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
        created_by: "",
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
      await deleteDoc(doc(db, STATIC_WORDS.EPISODES, id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
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
        <div className="new-episode-container">
          <div className="right-side">
            <div className="right-header">
              <div className="right-header-title">Manage Season Of Series</div>
              <Link to={`/tvseries/${tv_series_id}/season`}>
                <button className="btn">Back</button>
              </Link>
              <ImportCSV
                docName={STATIC_WORDS.EPISODES}
                isLoading={handleIsLoading}
              />
              <div className="btn">Add Episode</div>
            </div>
            {edit ? (
              <form onSubmit={handleSubmit}>
                <div className="season-no">
                  <label htmlFor="episodeTitle">Episode Title</label>
                  <input
                    id="episodeTitle"
                    type="text"
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                  />
                </div>
                <div className="season-no">
                  <label htmlFor="episodeNo">Episode No.</label>
                  <input
                    id="episodeNo"
                    type="number"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                  />
                </div>
                <div className="season-slug">
                  <label htmlFor="duration">Duration</label>
                  <input
                    id="duration"
                    type="text"
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
                <div className="bottom-create">
                  <button type="reset" className="btn">
                    Reset
                  </button>
                  <button type="submit" className="btn">
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitEdit}>
                <div className="season-no">
                  <label htmlFor="episodeTitle">Episode Title</label>
                  <input
                    id="episodeTitle"
                    type="text"
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                  />
                </div>
                <div className="season-no">
                  <label htmlFor="episodeNo">Episode No.</label>
                  <input
                    id="episodeNo"
                    type="number"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                  />
                </div>
                <div className="season-slug">
                  <label htmlFor="duration">Duration</label>
                  <input
                    id="duration"
                    type="text"
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
                <div className="bottom-create">
                  <button type="reset" className="btn">
                    Reset
                  </button>
                  <button type="submit" className="btn">
                    Edit
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
