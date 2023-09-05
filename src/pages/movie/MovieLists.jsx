import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../configs/firebase";
import { motion } from "framer-motion";
import ImageComponent from "../../components/widget/ImageComponent";
import ImportCSV from "../../components/import/ImportCSV";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import Loading from "react-loading";
import { Delete, Edit, Star, StarBorderOutlined } from "@mui/icons-material";
import { starRating } from "../../helper/Helpers";
import ReactPaginate from "react-paginate";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const MovieLists = () => {
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
            collection(db, STATIC_WORDS.MOVIES),
            orderBy("created_at", "desc"),
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, STATIC_WORDS.MOVIES, id));
      setData(data.filter((item) => item.id !== id));
      setShowElement(() => null);
    } catch (err) {
      console.log(err);
    }
    toast("Movie Delete Success!");
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
          collection(db, STATIC_WORDS.MOVIES),
          orderBy("created_at", "desc"),
          limit("12")
        )
      );
    } else {
      const next = await getDocs(
        query(
          collection(db, STATIC_WORDS.MOVIES),
          orderBy("created_at", "desc"),
          limit(limits)
        )
      );

      const startAfters = next.docs[next.docs.length - 1];
      querySnapshot = await getDocs(
        query(
          collection(db, STATIC_WORDS.MOVIES),
          orderBy("created_at", "desc"),
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
    <div className="tw-px-2 tw-pt-5">
      {isLoading && (
        <div className="tw-absolute tw-bg-black tw-z-50 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-opacity-50 tw-flex tw-justify-center tw-items-center">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <ToastContainer />
      <div className="tw-flex tw-justify-between tw-items-center">
        <div className="tw-font-bold tw-text-slate-500">All Movie</div>
      </div>
      <div className="tw-flex tw-items-center tw-justify-between">
        <div>
          <ImportCSV
            docName={STATIC_WORDS.MOVIES}
            isLoading={handleIsLoading}
          />
        </div>
        <div>
          <ImportCSV
            docName={STATIC_WORDS.VIDEO_LINKS}
            isLoading={handleIsLoading}
          />
        </div>
        <Link
          to="/movies/new"
          className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
        >
          Add New
        </Link>
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
                      <div className="tw-absolute -tw-top-[5.6rem] tw-z-10 tw-left-8">
                        <ul className="tw-flex tw-flex-col tw-bg-slate-50 tw-rounded-sm tw-list-none tw-text-slate-800">
                          <Link to={`/movies/${item.id}/edit`}>
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
                  <div className="tw-flex tw-justify-between tw-mb-2">
                    <div>
                      <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                        YEAR
                      </div>
                      <div className="tw-text-sm">{item.data.publish_year}</div>
                    </div>
                    <div>
                      <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                        LENGTH
                      </div>
                      <div className="tw-text-sm">
                        {item.data.duration} mins
                      </div>
                    </div>
                  </div>
                  <div className="tw-mb-2">
                    <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                      RATINGS
                    </div>
                    {starRating(item.data.rating).map((i, key) =>
                      i === "full" ? (
                        <Star htmlColor="#bf9e17" key={key} />
                      ) : (
                        <StarBorderOutlined htmlColor="#bf9e17" key={key} />
                      )
                    )}
                  </div>
                  <div className="tw-mb-3">
                    <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                      GENRE
                    </div>
                    <div className="tw-text-sm">Action, Triller, Drama</div>
                  </div>
                  <div className="tw-flex tw-justify-between tw-mb-5">
                    <div>
                      <div className="tw-text-xs tw-font-semibold tw-mb-1 tw-text-slate-700">
                        CREATED BY
                      </div>
                      <div className="tw-text-xs tw-font-medium">Admin</div>
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
export default MovieLists;
