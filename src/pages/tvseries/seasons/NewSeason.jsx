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
    <div className="tw-pt-5 tw-px-2">
      {isLoading && (
        <div className="tw-absolute tw-z-50 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-opacity-50 tw-flex tw-justify-center tw-items-center">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="tw-mx-2">
        <h1 className="tw-font-bold tw-text-slate-500">{title}</h1>
        <div className="tw-flex tw-justify-between tw-bg-white tw-p-1 tw-w-full">
          <div className="tw-p-2 tw-w-[56%]">
            <div className="tw-text-slate-600">Manage Season Of Series</div>
            <div className="tw-flex tw-justify-between tw-mt-2 tw-flex-wrap">
              <Link
                to="/tvseries"
                className="tw-py-1 tw-px-2 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
              >
                Back
              </Link>
              <ImportCSV
                docName={STATIC_WORDS.SEASONS}
                isLoading={handleIsLoading}
              />
              <div className="tw-py-1 tw-px-2 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50">
                Add Seasons
              </div>
            </div>
            {edit ? (
              <form
                onSubmit={handleSubmitEdit}
                className="tw-bg-slate-300 tw-p-2 tw-mt-2 tw-pt-1 tw-rounded-md"
              >
                <div className="tw-flex tw-flex-col">
                  <label
                    htmlFor="seasonNo"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Season No.
                  </label>
                  <input
                    id="seasonNo"
                    type="number"
                    placeholder="Enter Season Number"
                    value={seasonNumber}
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    onChange={(e) => setSeasonNumber(e.target.value)}
                  />

                  <label
                    htmlFor="seasonSlug"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Season Slug
                  </label>
                  <input
                    id="seasonSlug"
                    placeholder="Enter Season Slug"
                    type="text"
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    value={seasonSlug}
                    onChange={(e) => setSeasonSlug(e.target.value)}
                  />
                  <label
                    htmlFor="audioLanguages"
                    className="tw-text-slate-800 tw-pt-2"
                  >
                    Audio Languages
                  </label>
                  <input
                    id="audioLanguages"
                    type="text"
                    className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                    //   value={movieTitle}
                    //   onChange={handleMovieTitleChange}
                  />
                </div>
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
                <div className="tw-text-slate-800">Protected Video?</div>
                <label htmlFor="protected" className="toggle-switch">
                  <input
                    type="checkbox"
                    id="protected"
                    value={isProtected}
                    onChange={() => setIsProtected(!isProtected)}
                  />
                  <span className="slider"></span>
                </label>
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
                <>
                  <div className="tw-flex tw-flex-col">
                    <label
                      htmlFor="seasonNo"
                      className="tw-text-slate-800 tw-pt-2"
                    >
                      Season No.
                    </label>
                    <input
                      id="seasonNo"
                      type="number"
                      placeholder="Enter Season Number"
                      className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                      onChange={(e) => setSeasonNumber(e.target.value)}
                      required
                    />

                    <label
                      htmlFor="seasonSlug"
                      className="tw-text-slate-800 tw-pt-2"
                    >
                      Season Slug
                    </label>
                    <input
                      id="seasonSlug"
                      placeholder="Enter Season Slug"
                      type="text"
                      className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                      onChange={(e) => setSeasonSlug(e.target.value)}
                      required
                    />
                    <label
                      htmlFor="audioLanguages"
                      className="tw-text-slate-800 tw-pt-2"
                    >
                      Audio Languages
                    </label>
                    <input
                      id="audioLanguages"
                      type="text"
                      className="tw-p-2 tw-text-sm tw-border-none tw-outline-none tw-mt-1"
                      //   value={movieTitle}
                      //   onChange={handleMovieTitleChange}
                    />
                  </div>

                  <div className="tw-text-slate-800 tw-pt-2">
                    Choose Custom Thumbnail and Poster
                  </div>
                  <label htmlFor="customThumbnail" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="customThumbnail"
                      onChange={() => setIsFeatured(!isFeatured)}
                    />
                    <span className="slider"></span>
                  </label>

                  <div className="tw-text-slate-800 tw-pt-2">
                    Protected Video?
                  </div>
                  <label htmlFor="protected" className="toggle-switch">
                    <input
                      type="checkbox"
                      id="protected"
                      onChange={() => setIsProtected(!isProtected)}
                    />
                    <span className="slider"></span>
                  </label>

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
                </>
                <div className="tw-flex tw-gap-x-2 tw-my-5">
                  <button
                    type="reset"
                    className="tw-bg-red-500 hover:tw-bg-red-700 tw-text-white tw-font-bold tw-py-1 tw-px-4 tw-rounded-sm tw-w-full"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-sm tw-text-slate-50 tw-w-full"
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
                    <th className="tw-text-center tw-px-2">Thumbnail</th>
                    <th className="tw-text-center tw-px-2">Season</th>
                    <th className="tw-text-center tw-px-2">Episodes</th>
                    <th className="tw-text-center tw-px-2">ByTMDB</th>
                    <th className="tw-text-center tw-px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 &&
                    data.map((doc) => (
                      <tr>
                        <td
                          className="tw-text-center tw-align-middle tw-w-10
                         tw-h-auto"
                        >
                          <img src={doc.data.poster} alt="season-thumbnail" />
                        </td>
                        <td className="tw-text-center tw-align-middle">
                          Season {doc.data.season_no}
                        </td>
                        <td className="tw-text-center tw-align-middle">
                          12 Episodes
                        </td>
                        <td className="tw-text-center tw-align-middle">
                          {doc.data.tmdb}
                        </td>
                        <td className="tw-flex tw-flex-wrap tw-align-middle">
                          <Link
                            to={`/tvseries/season/${doc.id}/episode`}
                            state={{
                              tmdb_id: doc.data.tv_tmdb_id,
                              tvSeriesId: id,
                              season_number: doc.data.season_no,
                            }}
                          >
                            <SettingsSuggest
                              className="tw-cursor-pointer tw-px-1"
                              style={{ fontSize: "28px" }}
                            />
                          </Link>
                          <Edit
                            onClick={() => {
                              setEdit((preEdit) => !preEdit);
                              handleEdit(doc.id);
                            }}
                            className="tw-cursor-pointer tw-px-1"
                            style={{ fontSize: "28px" }}
                          />
                          <Delete
                            className="tw-text-red-500 tw-cursor-pointer tw-px-1"
                            onClick={() => handleDelete(doc.id)}
                            style={{ fontSize: "28px" }}
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
