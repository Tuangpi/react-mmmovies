import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import "../../../style/episode.scss";
import "../../../style/new.scss";
import { STATIC_WORDS } from "../../../assets/STATIC_WORDS";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../../../configs/firebase";
import { useEffect, useState } from "react";
import axios from "axios";
import { fromURL } from "image-resize-compress";
import { ForActors } from "../../new/NewMovieHelper/ForActors";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const NewSeason = ({ title }) => {
  const { id } = useParams();
  const [seasonNumber, setSeasonNumber] = useState();
  const [seasonSlug, setSeasonSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const location = useLocation();
  const tmdb_id = location.state;

  useEffect(() => {
    const fetchData = async () => {
      let list = [];
      try {
        const querySnapshot = await getDocs(
          collection(db, STATIC_WORDS.SEASONS)
        );
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, data: doc.data() });
        });
        list.map((doc) => {
          console.log(doc.data);
        });
        setData(list);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  async function fetchDataAndStore() {
    const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
    console.log(id, tmdb_id);
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
    console.log(season_data);

    const credits = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${seasonNumber}/credits?api_key=${TMDB_API_KEY}`
    );

    const actor_id = await ForActors(TMDB_API_KEY, credits);
    console.log(actor_id);

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
        tv_series_id: id,
        tmdb_id: tmdb_id,
        season_no: seasonNumber,
        season_slug: seasonSlug,
        tmdb: "Y",
        poster: posterURL,
        publish_year: season_data["data"]["air_date"].substring(0, 4),
        thumbnail: null,
        actor_id: actor_id,
        a_language: null,
        detail: season_data["data"]["overview"],
        views: null,
        featured: null,
        type: "S",
        is_protected: false,
        password: null,
        trailer_url: trailerUrl,
        created_by: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, STATIC_WORDS.SEASONS), obj);
      setData([...data, { id: docRef, data: obj }]);
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
              <Link to="/tvseries">
                <button className="btn">Back</button>
              </Link>
              <div className="btn">Import CSV</div>
              <div className="btn">Add Seasons</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="season-no">
                <label htmlFor="seasonNo">Season No.</label>
                <input
                  id="seasonNo"
                  type="number"
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                />
              </div>
              <div className="season-slug">
                <label htmlFor="seasonSlug">Season Slug</label>
                <input
                  id="seasonSlug"
                  type="text"
                  //   value={movieTitle}
                  //   onChange={handleMovieTitleChange}
                />
              </div>
              <div className="audio-languages">
                <label htmlFor="audioLanguages">Audio Languages</label>
                <input
                  id="audioLanguages"
                  type="text"
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
                <button type="reset" className="btn">
                  Reset
                </button>
                <button type="submit" className="btn">
                  Create
                </button>
              </div>
            </form>
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
                        <td>Thumbnail</td>
                        <td>Season {doc.data.season_no}</td>
                        <td>12 Episodes</td>
                        <td>{doc.data.tmdb}</td>
                        <td>
                          <Link
                            to={`/tvseries/season/${doc.id}/episode`}
                            state={id}
                          >
                            episode
                          </Link>
                          <Link to="/tvseries/season/episode">Edit</Link>
                          <Link to="/tvseries/season/episode">Delete</Link>
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
