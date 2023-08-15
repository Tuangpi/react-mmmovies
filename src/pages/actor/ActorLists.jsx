import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImportCSV from "../../components/import/ImportCSV";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import Loading from "react-loading";
import { motion } from "framer-motion";
import ImageComponent from "../../components/widget/ImageComponent";

const ActorLists = () => {
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
        const querySnapshot = await getDocs(collection(db, "actors"));
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
      await deleteDoc(doc(db, "actors", id));
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
        <div className="tw-font-bold tw-text-slate-500">All Actor</div>
        <div className="tw-flex tw-justify-between">
          <div>
            <ImportCSV
              docName={STATIC_WORDS.ACTORS}
              isLoading={handleIsLoading}
            />
          </div>
          <div>
            <Link
              to="/actors/new"
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
                transition={{ duration: 0.5, ease: "easeIn" }}
                className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-56 tw-bg-slate-300 tw-shadow-lg tw-rounded-md"
                key={id}
              >
                <ImageComponent
                  alter="Actor Poster"
                  src={item.image}
                  className="tw-w-full tw-rounded-tr-md tw-rounded-tl-md"
                />
                <div className="tw-flex tw-justify-end tw-flex-col tw-relative tw-w-full tw-px-4">
                  <h2 className="tw-my-4 tw-text-base tw-font-extrabold tw-cursor-default tw-text-slate-900">
                    {item.name}
                  </h2>
                  <div className="card-info">
                    <div className="card-year">
                      DOB
                      <br />
                      {item.DOB}
                    </div>
                  </div>
                  <div className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700">
                    PLACE OF BIRTH
                    <br />
                    {item.place_of_birth}
                  </div>
                  <div
                    className="tw-text-sm tw-font-semibold tw-mb-1 tw-text-slate-700"
                    title={item.biography}
                  >
                    BIOGRAPHY
                    <br />
                    {item.biography
                      ? item.biography.split(" ").slice(0, 6).join(" ") + " ..."
                      : item.biography}
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

export default ActorLists;
