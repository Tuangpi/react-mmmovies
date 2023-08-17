import { Link, useLocation, useParams } from "react-router-dom";
import { STATIC_WORDS } from "../../../assets/STATIC_WORDS";
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
import { db, storage } from "../../../configs/firebase";
import { useEffect, useState } from "react";
import axios from "axios";
import { fromURL } from "image-resize-compress";
import { ForActors } from "../../../helper/ForActors";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Delete, Edit, SettingsSuggest } from "@mui/icons-material";
import ImportCSV from "../../../components/import/ImportCSV";
import Loading from "react-loading";

const NewSeason = ({ title }) => {
  const { id } = useParams();
  const [seasonNumber, setSeasonNumber] = useState();
  const [seasonSlug, setSeasonSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectTMDB, setSelectTMDB] = useState("tmdb");
  const [isProtected, setIsProtected] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [edit, setEdit] = useState(false);
  const [data, setData] = useState([]);
  const location = useLocation();
  const tmdb_id = location.state;

  const handleIsLoading = (value) => {
    setIsLoading(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      let list = [];
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, STATIC_WORDS.SEASONS),
            where("tvSeriesId", "==", id)
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

  async function fetchDataAndStore() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

    const trailer_url = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${seasonNumber}/videos?api_key=${TMDB_API_KEY}`
    );

    let trailerUrl = null;
    if (trailer_url && trailer_url["data"]["results"].length > 0) {
      trailerUrl = `https://youtu.be/${trailer_url["results"][0]["key"]}`;
    }
    const season_data = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
    );

    const credits = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${seasonNumber}/credits?api_key=${TMDB_API_KEY}`
    );

    const actor_id = await ForActors(TMDB_API_KEY, credits);

    let posterURL = null;
    if (season_data["data"]["poster_path"]) {
      const poster = await fromURL(
        `https://image.tmdb.org/t/p/original/${season_data["data"]["poster_path"]}`,
        1,
        0,
        0,
        "webp"
      );
      const posterRef = ref(
        storage,
        `tvseries/poster/${season_data["data"]["poster_path"]}`
      );

      await uploadBytesResumable(posterRef, poster);
      posterURL = await getDownloadURL(posterRef);
    }

    try {
      const obj = {
        tvSeriesId: id,
        tmdb_id: String(season_data["data"]["id"]),
        season_no: seasonNumber,
        season_slug: seasonSlug,
        tmdb: "Y",
        poster: posterURL ?? "",
        publish_year: season_data["data"]["air_date"].substring(0, 4),
        thumbnail: "",
        actorsId: actor_id,
        a_language: "",
        detail: season_data["data"]["overview"],
        views: "",
        featured: isFeatured,
        type: "S",
        is_protected: isProtected,
        password: "",
        trailer_url: trailerUrl ?? "",
        // created_by: "",
        tv_tmdb_id: tmdb_id,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, STATIC_WORDS.SEASONS), obj);
      setData([...data, { id: docRef.id, data: obj }]);
    } catch (error) {
      console.log(error);
    }
  }

  const handleEdit = (id) => {
    const fetchData = async (docRef) => {
      try {
        setIsLoading(true);
        const querySnapshot = await getDoc(
          doc(db, `${STATIC_WORDS.SEASONS}/${docRef}`)
        );
        const data = querySnapshot.data();
        setSeasonNumber(data.season_no);
        setSeasonSlug(data.season_slug);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    if (id) fetchData(id);
  };

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
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, STATIC_WORDS.SEASONS, id));
      setData(data.filter((item) => item.id !== id));
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="tw-pt-5 tw-px-5">
      {isLoading && (
        <div className="tw-absolute tw-z-50 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-opacity-50 tw-flex tw-justify-center tw-items-center">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="tw-mx-5">
        <h1 className="tw-font-bold tw-text-slate-500">{title}</h1>
        <div className="new-episode-container">
          <div className="right-side">
            <div className="right-header">
              <div className="right-header-title">Manage Season Of Series</div>
              <Link
                to="/tvseries"
                className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
              >
                Back
              </Link>
              <ImportCSV
                docName={STATIC_WORDS.SEASONS}
                isLoading={handleIsLoading}
              />
              <button className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50">
                Add Seasons
              </button>
            </div>
            {edit ? (
              <form onSubmit={handleSubmitEdit}>
                <div className="season-no">
                  <label htmlFor="seasonNo">Season No.</label>
                  <input
                    id="seasonNo"
                    type="number"
                    value={seasonNumber}
                    className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                    onChange={(e) => setSeasonNumber(e.target.value)}
                  />
                </div>
                <div className="season-slug">
                  <label htmlFor="seasonSlug">Season Slug</label>
                  <input
                    id="seasonSlug"
                    type="text"
                    className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                    value={seasonSlug}
                    onChange={(e) => setSeasonSlug(e.target.value)}
                  />
                </div>
                <div className="audio-languages">
                  <label htmlFor="audioLanguages">Audio Languages</label>
                  <input
                    id="audioLanguages"
                    type="text"
                    className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                    //   value={movieTitle}
                    //   onChange={handleMovieTitleChange}
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
                  <div>Protected Video?</div>
                  <label htmlFor="protected" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="protected"
                      value={isProtected}
                      onChange={() => setIsProtected(!isProtected)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div>Want IMDB Ratings And More Or Custom?</div>
                <div style={{ display: "tw-flex" }}>
                  <div>
                    <input
                      type="radio"
                      id="tmdb"
                      name="details"
                      value="tmdb"
                      className="hidden-radio"
                      // onChange={(e) => setSelectTMDB(e.target.value)}
                      // checked={selectTMDB === "tmdb"}
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
                      // onChange={(e) => setSelectTMDB(e.target.value)}
                      // checked={selectTMDB === "custom"}
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
                    className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
                  >
                    Edit
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="season-no">
                  <label htmlFor="seasonNo">Season No.</label>
                  <input
                    id="seasonNo"
                    type="number"
                    className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                    onChange={(e) => setSeasonNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="season-slug">
                  <label htmlFor="seasonSlug">Season Slug</label>
                  <input
                    id="seasonSlug"
                    type="text"
                    className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                    onChange={(e) => setSeasonSlug(e.target.value)}
                    required
                  />
                </div>
                <div className="audio-languages">
                  <label htmlFor="audioLanguages">Audio Languages</label>
                  <input
                    id="audioLanguages"
                    type="text"
                    className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
                    //   value={movieTitle}
                    //   onChange={handleMovieTitleChange}
                  />
                </div>
                <div className="custom-thumbnail">
                  <div>Choose Custom Thumbnail and Poster</div>
                  <label htmlFor="customThumbnail" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="customThumbnail"
                      onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="protected">
                  <div>Protected Video?</div>
                  <label htmlFor="protected" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="protected"
                      onChange={() => setIsProtected(!isProtected)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div>Want IMDB Ratings And More Or Custom?</div>
                <div style={{ display: "tw-flex" }}>
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
                <div className="bottom-create mt-6">
                  <button
                    type="reset"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded mr-6"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
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
                    <th>Thumbnail</th>
                    <th>Season</th>
                    <th>Episodes</th>
                    <th>ByTMDB</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 &&
                    data.map((doc) => (
                      <tr>
                        <td className="cell">
                          <img src={doc.data.poster} alt="season-thumbnail" />
                        </td>
                        <td className="cell">Season {doc.data.season_no}</td>
                        <td className="cell">12 Episodes</td>
                        <td className="cell">{doc.data.tmdb}</td>
                        <td className="cell">
                          <Link
                            to={`/tvseries/season/${doc.id}/episode`}
                            state={{
                              tmdb_id: doc.data.tv_tmdb_id,
                              tvSeriesId: id,
                              season_number: doc.data.season_no,
                            }}
                          >
                            <SettingsSuggest />
                          </Link>
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

export default NewSeason;
