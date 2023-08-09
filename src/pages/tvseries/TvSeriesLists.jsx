import "../../style/cardlist.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImportCSV from "../../components/import/ImportCSV";
import ImageComponent from "../../components/widget/ImageComponent";
import Loading from "react-loading";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { motion } from "framer-motion";
import {
  Delete,
  Edit,
  Settings,
  Star,
  StarBorderOutlined,
} from "@mui/icons-material";
import { starRating } from "../../helper/Helpers";

const TvSeriesLists = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showElement, setShowElement] = useState(null);

  const handleIsLoading = (value) => {
    setIsLoading(value);
  };

  const handleClick = (id) => {
    setShowElement(id);
    if (showElement === id) setShowElement(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      let list = [];
      try {
        const querySnapshot = await getDocs(
          collection(db, STATIC_WORDS.TVSERIES)
        );
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, data: doc.data() });
        });
        setData(list);
        setIsFetching(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const deleteEpisodesForSeason = async (seasonId) => {
    const episodesQuery = query(
      collection(db, STATIC_WORDS.EPISODES),
      where("seasons_id", "==", seasonId)
    );
    const episodesSnapshot = await getDocs(episodesQuery);

    const deletionPromises = episodesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletionPromises);
  };

  const deleteSeasonsForTVSeries = async (tvSeriesId) => {
    const seasonsQuery = query(
      collection(db, STATIC_WORDS.SEASONS),
      where("tv_series_id", "==", tvSeriesId)
    );
    const seasonsSnapshot = await getDocs(seasonsQuery);

    const deletionPromises = seasonsSnapshot.docs.map(async (doc) => {
      await deleteEpisodesForSeason(doc.id);
      await deleteDoc(doc.ref);
    });

    await Promise.all(deletionPromises);
  };

  const deleteTVSeries = async (tvSeriesId) => {
    const tvSeriesDocRef = doc(db, STATIC_WORDS.TVSERIES, tvSeriesId);
    await deleteDoc(tvSeriesDocRef);
  };

  const deleteTVSeriesAndRelatedData = async (tvSeriesId) => {
    try {
      await deleteSeasonsForTVSeries(tvSeriesId);
      await deleteTVSeries(tvSeriesId);

      console.log("TV series and related data deleted successfully");
    } catch (error) {
      console.error("Error deleting TV series and related data:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTVSeriesAndRelatedData(id);
      setData(data.filter((item) => item.id !== id));
      setShowElement(() => null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="datatable">
      {isLoading && (
        <div className="loading-container">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="datatableTitle">
        <div>All TVSeries</div>
        <div className="title-right">
          <div className="title-right-first">
            <ImportCSV
              docName={STATIC_WORDS.TVSERIES}
              isLoading={handleIsLoading}
            />
          </div>
          <Link to="/tvseries/new" className="link">
            Add New
          </Link>
        </div>
      </div>
      {isFetching ? (
        <Loading
          type="bars"
          color="#017BFE"
          height={"4%"}
          width={"4%"}
          className="loading-container-1"
        />
      ) : data.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeIn" }}
          className="movie-card"
        >
          {data.map((item, id) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="card"
              key={id}
            >
              <ImageComponent
                alt="tvseries poster"
                src={item.data.thumbnail}
                className="card-image"
              />
              <div className="card-details">
                <div className="card-edit-link-container-tv">
                  {showElement === id && showElement !== null && (
                    <div className="card-edit-list">
                      <ul>
                        <Link
                          to={`/tvseries/${item.id}/season`}
                          state={item.data.tmdb_id}
                        >
                          <li>
                            <Settings fontSize="12px" />
                            <span>Manage Seasons</span>
                          </li>
                        </Link>
                        <Link to={`/tvseries/${item.id}/edit`}>
                          <li>
                            <Edit fontSize="12px" /> <span>Edit</span>
                          </li>
                        </Link>
                        <li
                          className="delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Delete fontSize="12px" />
                          <span>Delete</span>
                        </li>
                      </ul>
                    </div>
                  )}
                  <div
                    className="card-edit-link"
                    onClick={() => handleClick(id)}
                  >
                    <div className="dot">...</div>
                  </div>
                </div>
                <h2 className="card-title text-base font-extrabold">
                  {item.data.title}
                </h2>
                <div className="card-genre">
                  <div className="text-sm font-extrabold">GENRE</div>
                  <div className="text-xs">Action, Triller, Drama</div>
                </div>
                <div className="card-ratings">
                  <div className="text-sm font-extrabold">RATINGS</div>
                  {starRating(item.data.rating).map((i) =>
                    i === "full" ? (
                      <Star htmlColor="#e3ba15" />
                    ) : (
                      <StarBorderOutlined htmlColor="#e3ba15" />
                    )
                  )}
                </div>
                <div className="card-creator-status">
                  <div className="card-creator">
                    <div className="text-sm font-extrabold">CREATED BY</div>
                    <div className="text-xs">Admin</div>
                  </div>
                  <div className="card-status">
                    <div className="text-sm font-extrabold">STATUS</div>
                    {item.data.status ? (
                      <div className="text-xs">Active</div>
                    ) : (
                      <div className="text-xs">Inactive</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          key="0"
          className="nodata"
        >
          No Data
        </motion.div>
      )}
    </div>
  );
};

export default TvSeriesLists;
