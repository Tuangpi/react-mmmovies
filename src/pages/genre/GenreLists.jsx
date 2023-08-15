import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImportCSV from "../../components/import/ImportCSV";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { motion } from "framer-motion";
import Loading from "react-loading";

const GenreLists = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleIsLoading = (data) => {
    setIsLoading(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      let list = [];
      try {
        const querySnapshot = await getDocs(collection(db, "genres"));
        querySnapshot.forEach((doc) => {
          list.push(doc.data());
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
    <div className="tw-bg-slate-100 tw-pt-5 tw-min-h-screen">
      {isLoading && (
        <div className="tw-m-auto tw-mt-56">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="tw-flex tw-justify-between tw-items-center">
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
          <div className="movie-card">
            {data.map((item, id) => (
              <div
                className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-56 tw-bg-slate-300 tw-shadow-lg tw-rounded-md"
                key={id}
              >
                <img
                  src={item.image}
                  alt="Genre Thumnail"
                  className="tw-w-full tw-rounded-tr-md tw-rounded-tl-md"
                />
                <div className="card-details">
                  <h2 className="card-title">{item.name}</h2>
                </div>
              </div>
            ))}
          </div>
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
