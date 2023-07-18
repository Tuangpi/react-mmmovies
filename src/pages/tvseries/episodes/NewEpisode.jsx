import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import "../../../style/episode.scss";
import "../../../style/new.scss";
import { useState } from "react";

const NewEpisode = ({ title }) => {
  const { id } = useParams();
  const [seasonNumber, setSeasonNumber] = useState();
  const [seasonSlug, setSeasonSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const location = useLocation();
  const back_id = location.state;

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
              <Link to={`/tvseries/${back_id}/season`}>
                <button className="btn">Back</button>
              </Link>
              <div className="btn">Import CSV</div>
              <div className="btn">Add Episode</div>
            </div>
            <div className="season-no">
              <label htmlFor="episodeTitle">Episode Title</label>
              <input
                id="episodeTitle"
                type="text"
                //   value={movieTitle}
                //   onChange={handleMovieTitleChange}
              />
            </div>
            <div className="season-no">
              <label htmlFor="episodeNo">Episode No.</label>
              <input
                id="episodeNo"
                type="number"
                //   value={movieTitle}
                //   onChange={handleMovieTitleChange}
              />
            </div>
            <div className="season-slug">
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
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
              <div className="btn">Reset</div>
              <div className="btn">Create</div>
            </div>
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
                  <tr>
                    <td>1</td>
                    <td>Episodes1</td>
                    <td>y</td>
                    <td>60mins</td>
                    <td>adf</td>
                  </tr>
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
