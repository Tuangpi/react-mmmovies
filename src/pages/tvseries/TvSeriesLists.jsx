import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
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
import ReactPaginate from "react-paginate";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const TvSeriesLists = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showElement, setShowElement] = useState(null);
  const [pageCount, setPageCount] = useState(0);

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
        const queryAll = await getDocs(
          query(collection(db, STATIC_WORDS.MOVIES))
        );
        setPageCount(Math.ceil(queryAll.docs.length / 12));

        const querySnapshot = await getDocs(
          query(
            collection(db, STATIC_WORDS.TVSERIES),
            orderBy("created_at"),
            limit("1")
          )
        );

        querySnapshot.forEach((doc) => {
          list.push({ data: doc.data(), id: doc.id });
        });
        setData(list);
      } catch (err) {
        console.log(err);
      }
      setIsFetching(false);
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
    toast("Tv Series Delete Success!");
  };

  const handlePageClick = async (data) => {
    const perPage = 12;
    console.log("onPageChange", data);
    const selected = data.selected;
    const limits = ((selected + 1) * perPage - perPage).toString();
    let querySnapshot = null;

    if (selected === 0) {
      querySnapshot = await getDocs(
        query(
          collection(db, STATIC_WORDS.TVSERIES),
          orderBy("created_at"),
          limit("12")
        )
      );
    } else {
      const next = await getDocs(
        query(
          collection(db, STATIC_WORDS.TVSERIES),
          orderBy("created_at"),
          limit(limits)
        )
      );

      const startAfters = next.docs[next.docs.length - 1];
      querySnapshot = await getDocs(
        query(
          collection(db, STATIC_WORDS.TVSERIES),
          orderBy("created_at"),
          startAfter(startAfters),
          limit("12")
        )
      );
    }

    let list = [];
    querySnapshot.forEach((doc) => {
      list.push({ data: doc.data(), id: doc.id });
    });
    setData(list);
  };

  return (
    <div className="tw-flex tw-flex-col tw-px-2 tw-pt-5">
      {isLoading && (
        <div className="tw-absolute tw-bg-black tw-z-50 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-opacity-50 tw-flex tw-justify-center tw-items-center">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <ToastContainer />
      <div className="tw-flex tw-justify-between tw-items-center">
        <div className="tw-font-bold tw-text-slate-500">All TV Series</div>
        <div className="tw-flex tw-items-center tw-justify-between">
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
            className="tw-max-w-fit tw-flex tw-gap-4 tw-flex-wrap"
          >
            {data.map((item, id) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-64 tw-bg-slate-300 tw-shadow-lg tw-rounded-md"
                key={id}
              >
                <ImageComponent
                  alter="movie poster"
                  src={item.data.thumbnail}
                  className="tw-w-full tw-rounded-tr-md tw-rounded-tl-md"
                />

                <div className="tw-flex tw-justify-end tw-flex-col tw-relative tw-w-full tw-px-4">
                  <div>
                    {showElement === id && showElement !== null && (
                      <div className="tw-absolute -tw-top-[8.7rem] tw-z-10 tw-left-8">
                        <ul className="tw-flex tw-flex-col tw-bg-slate-50 tw-rounded-sm tw-list-none tw-text-slate-800">
                          <Link
                            to={`/tvseries/${item.id}/season`}
                            state={item.data.tmdb_id}
                          >
                            <li className="tw-flex tw-text-sm tw-gap-x-2 tw-cursor-pointer tw-rounded-md tw-py-3 tw-px-4 hover:tw-text-slate-800 hover:tw-bg-slate-200">
                              <Settings style={{ fontSize: "18px" }} />
                              <div>Manage Seasons</div>
                            </li>
                          </Link>
                          <Link to={`/tvseries/${item.id}/edit`}>
                            <li className="tw-flex tw-text-sm tw-gap-x-2 tw-cursor-pointer tw-rounded-md tw-py-3 tw-px-4 hover:tw-text-slate-800 hover:tw-bg-slate-200">
                              <Edit style={{ fontSize: "18px" }} />
                              <div>Edit</div>
                            </li>
                          </Link>
                          <li
                            className="tw-flex tw-text-sm tw-gap-x-2 tw-cursor-pointer tw-rounded-md tw-py-3 tw-px-4 hover:tw-text-red-600 hover:tw-bg-slate-200 tw-text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Delete style={{ fontSize: "18px" }} />
                            <div>Delete</div>
                          </li>
                        </ul>
                      </div>
                    )}
                    <div
                      className="tw-cursor-pointer tw-text-base tw-font-extrabold"
                      onClick={() => handleClick(id)}
                    >
                      <div className="tw-bg-blue-700 tw-rounded-full tw-w-8 tw-h-8 tw-flex tw-justify-center tw-text-slate-100 tw-scale-110 tw-border-none tw-outline-none hover:tw-bg-blue-500 tw-rotate-90 -tw-mt-4">
                        ...
                      </div>
                    </div>
                  </div>
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
            <ReactPaginate
              previousLabel="previous"
              nextLabel="next"
              breakLabel="..."
              breakClassName="page-item"
              breakLinkClassName="tw-mr-1"
              pageCount={pageCount}
              pageRangeDisplayed={4}
              marginPagesDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName="tw-flex tw-py-3 tw-justify-center tw-items-center tw-w-full"
              pageClassName="tw-ml-3 tw-border-2 tw-border-slate-700 tw-rounded-sm tw-text-center tw-p-1"
              pageLinkClassName=""
              previousClassName=""
              previousLinkClassName="tw-border-2 tw-border-slate-700 tw-rounded-sm tw-text-center tw-p-1 tw-capitalize"
              nextClassName=""
              nextLinkClassName="tw-ml-3 tw-border-2 tw-border-slate-700 tw-rounded-sm tw-text-center tw-p-1 tw-capitalize"
              activeClassName="tw-bg-slate-300"
              activeLinkClassName=""
              initialPage={0}
            />
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
