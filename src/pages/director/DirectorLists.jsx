import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImageComponent from "../../components/widget/ImageComponent";
import ImportCSV from "../../components/import/ImportCSV";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import Loading from "react-loading";
import { motion } from "framer-motion";
import ReactPaginate from "react-paginate";

const DirectorLists = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const handleIsLoading = (data) => {
    setIsLoading(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      let list = [];
      try {
        const queryAll = await getDocs(
          query(collection(db, STATIC_WORDS.DIRECTORS))
        );
        setPageCount(Math.ceil(queryAll.docs.length / 12));

        const querySnapshot = await getDocs(
          query(
            collection(db, STATIC_WORDS.ACTORS),
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "directors", id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handlePageClick = async (data) => {
    const perPage = 8;
    console.log("onPageChange", data);
    const selected = data.selected;
    const limits = ((selected + 1) * perPage - perPage).toString();
    let querySnapshot = null;

    if (selected === 0) {
      querySnapshot = await getDocs(
        query(
          collection(db, STATIC_WORDS.DIRECTORS),
          orderBy("created_at"),
          limit("12")
        )
      );
    } else {
      const next = await getDocs(
        query(
          collection(db, STATIC_WORDS.DIRECTORS),
          orderBy("created_at"),
          limit(limits)
        )
      );

      const startAfters = next.docs[next.docs.length - 1];
      querySnapshot = await getDocs(
        query(
          collection(db, STATIC_WORDS.DIRECTORS),
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
    <div className="tw-pt-5 tw-px-2">
      {isLoading && (
        <div className="tw-m-auto tw-mt-56">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="tw-flex tw-justify-between tw-pl-3 tw-pr-5 tw-items-center">
        <div className="tw-font-bold tw-text-slate-500">All Director</div>
        <div className="tw-flex tw-justify-between">
          <div>
            <ImportCSV
              docName={STATIC_WORDS.DIRECTORS}
              isLoading={handleIsLoading}
            />
          </div>
          <div>
            <Link
              to="/directors/new"
              className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
            >
              Add New
            </Link>
          </div>
        </div>
      </div>
      <div className="tw-mt-4">
        {isFetching ? (
          <Loading
            type="bubbles"
            color="#017BFE"
            height={"5%"}
            width={"4%"}
            className="tw-m-auto tw-mt-56"
          />
        ) : data.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="tw-w-full tw-flex tw-gap-4 tw-flex-wrap tw-m-auto tw-pr-5 tw-pl-3"
          >
            {data.map((item, id) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-56 tw-bg-slate-300 tw-shadow-lg tw-rounded-md"
                key={id}
              >
                <ImageComponent
                  alt="Director Poster"
                  src={item.data.image}
                  className="tw-w-full tw-rounded-tr-md tw-rounded-tl-md"
                />
                <div className="tw-flex tw-justify-end tw-flex-col tw-relative tw-w-full tw-px-4">
                  <h2 className="tw-my-4 tw-text-base tw-font-extrabold tw-cursor-default tw-text-slate-900">
                    {item.data.name}
                  </h2>
                  <div className="card-info">
                    <div className="card-year">
                      DOB
                      <div className="tw-text-slate-700 tw-font-normal">
                        {item.data.DOB}
                      </div>
                    </div>
                  </div>
                  <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                    PLACE OF BIRTH
                    <div className="tw-text-slate-700 tw-font-normal">
                      {item.data.place_of_birth}
                    </div>
                  </div>
                  <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                    BIOGRAPHY
                    <div className="tw-text-slate-700 tw-font-normal">
                      {item.data.biography
                        ? item.data.biography.split(" ").slice(0, 6).join(" ") +
                          " ..."
                        : item.data.biography}
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

export default DirectorLists;
