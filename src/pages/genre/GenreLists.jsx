import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  limit,
  startAfter,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImportCSV from "../../components/import/ImportCSV";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { motion } from "framer-motion";
import Loading from "react-loading";
import ReactPaginate from "react-paginate";

const GenreLists = () => {
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
          query(collection(db, STATIC_WORDS.GENRES))
        );
        setPageCount(Math.ceil(queryAll.docs.length / 16));

        const querySnapshot = await getDocs(
          query(
            collection(db, STATIC_WORDS.GENRES),
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
      await deleteDoc(doc(db, "genres", id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handlePageClick = async (data) => {
    const perPage = 16;
    console.log("onPageChange", data);
    const selected = data.selected;
    const limits = ((selected + 1) * perPage - perPage).toString();
    let querySnapshot = null;

    if (selected === 0) {
      querySnapshot = await getDocs(
        query(
          collection(db, STATIC_WORDS.GENRES),
          orderBy("created_at"),
          limit("16")
        )
      );
    } else {
      const next = await getDocs(
        query(
          collection(db, STATIC_WORDS.GENRES),
          orderBy("created_at"),
          limit(limits)
        )
      );

      const startAfters = next.docs[next.docs.length - 1];
      querySnapshot = await getDocs(
        query(
          collection(db, STATIC_WORDS.GENRES),
          orderBy("created_at"),
          startAfter(startAfters),
          limit("16")
        )
      );
    }

    let list = [];
    querySnapshot.forEach((doc) => {
      list.push({ data: doc.data(), id: doc.id });
    });
    setData(list);
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to="/products/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="tw-pt-5 tw-px-2">
      {isLoading && (
        <div className="tw-m-auto tw-mt-56">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="tw-flex tw-justify-between tw-items-center tw-pl-3 tw-pr-5">
        <div className="tw-font-bold tw-text-slate-500">All Genres</div>
        <div className="tw-flex tw-justify-between">
          <div>
            <ImportCSV
              docName={STATIC_WORDS.GENRES}
              isLoading={handleIsLoading}
            />
          </div>
          <div>
            <Link
              to="/genres/new"
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
            type="bars"
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
                transition={{ duration: 0.5, ease: "easeIn" }}
                className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-56 tw-bg-slate-300 tw-shadow-lg tw-rounded-md"
                key={id}
              >
                <img
                  src={item.data.image}
                  alt="Genre Thumnail"
                  className="tw-w-full tw-rounded-tr-md tw-rounded-tl-md"
                />
                <div className="card-details">
                  <h2 className="card-title">{item.data.name}</h2>
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
            className="tw-m-auto tw-mt-56 tw-text-center"
            key="0"
          >
            No Data
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GenreLists;
