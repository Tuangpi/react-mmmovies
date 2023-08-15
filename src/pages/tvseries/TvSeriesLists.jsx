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
    <div className="tw-flex tw-flex-col tw-px-5 tw-pt-5 tw-bg-slate-100">
      {isLoading && (
        <div className="tw-m-auto tw-mt-56">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="tw-flex tw-justify-between tw-items-center">
        <div className="tw-font-bold tw-text-slate-500">All TV Series</div>
        <div className="tw-flex tw-justify-between">
          <div>
            <ImportCSV
              docName={STATIC_WORDS.TVSERIES}
              isLoading={handleIsLoading}
            />
          </div>
          <Link
            to="/tvseries/new"
            className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
          >
            Add New
          </Link>
        </div>
      </div>
      <div className="tw-mt-4">
        {isFetching ? (
          <Loading
            type="bars"
            color="#017BFE"
            height={"4%"}
            width={"4%"}
            className="tw-m-auto tw-mt-56"
          />
        ) : data.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="tw-w-full tw-flex tw-gap-4 tw-flex-wrap tw-m-auto"
          >
            {data.map((item, id) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-56 tw-bg-slate-200 tw-shadow-lg tw-rounded-md"
                key={id}
              >
                <ImageComponent
                  alter="movie poster"
                  src={item.data.thumbnail}
                  className="tw-w-full tw-rounded-tr-md tw-rounded-tl-md"
                />

                <div className="tw-flex tw-justify-end tw-flex-col tw-relative tw-w-full tw-px-4">
                  {/* <div>
                    {showElement === id && showElement !== null && (
                      <div className="tw-absolute -tw-top-96 tw-z-10">
                        <ul className="tw-flex tw-flex-col tw-bg-red-600 tw-rounded-sm tw-list-none tw-text-blue-800 tw-pt-2 tw-pr-0 tw-pb-1 tw-pl-0">
                          <Link to={`/movies/${item.id}/edit`}>
                            <li className="tw-flex tw-text-xs tw-gap-x-2 tw-cursor-pointer tw-rounded-md tw-py-3 tw-px-4 hover:tw-text-green-700 hover:tw-bg-yellow-600">
                              <Edit fontSize="12px" /> <span>Edit</span>
                            </li>
                          </Link>
                          <li
                            className="tw-text-red-700 tw-cursor-pointer hover:tw-text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Delete fontSize="12px" />
                            <span>Delete</span>
                          </li>
                        </ul>
                      </div>
                    )}
                    <div
                      className="tw-cursor-pointer tw-text-base tw-font-extrabold"
                      onClick={() => handleClick(id)}
                    >
                      <div className="tw-bg-violet-900 tw-rounded-full tw-w-8 tw-h-8 tw-flex tw-justify-center tw-text-black tw-border-none tw-outline-none hover:tw-bg-lime-950">
                        ...
                      </div>
                    </div>
                  </div> */}
                  <h2
                    className="tw-my-4 tw-text-base tw-font-extrabold tw-cursor-default tw-text-slate-900"
                    title={item.data.title}
                  >
                    {item.data.title.length < 20
                      ? item.data.title
                      : item.data.title.substring(0, 20) + "..."}
                  </h2>
                  <div className="tw-mb-2">
                    <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                      RATINGS
                    </div>
                    {starRating(item.data.rating).map((i, key) =>
                      i === "full" ? (
                        <Star htmlColor="#e3ba15" key={key} />
                      ) : (
                        <StarBorderOutlined htmlColor="#e3ba15" key={key} />
                      )
                    )}
                  </div>
                  <div className="tw-mb-3">
                    <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                      GENRE
                    </div>
                    <div className="tw-text-xs">Action, Triller, Drama</div>
                  </div>
                  <div className="tw-flex tw-justify-between tw-mb-5">
                    <div>
                      <div className="tw-text-xs tw-font-semibold tw-mb-1 tw-text-slate-700">
                        CREATED BY
                      </div>
                      <div className="tw-text-xs">Admin</div>
                    </div>
                    <div>
                      <div className="tw-text-xs tw-font-semibold tw-mb-1 tw-text-slate-700">
                        STATUS
                      </div>
                      {item.data.status ? (
                        <div className="tw-text-xs">Active</div>
                      ) : (
                        <div className="tw-text-xs">Inactive</div>
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
            className="tw-m-auto tw-mt-56 tw-text-center"
          >
            No Data
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TvSeriesLists;
