import "../../style/cardlist.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImportCSV from "../../components/import/ImportCSV";
import ImageComponent from "../../components/widget/ImageComponent";
import Loading from "react-loading";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { motion } from "framer-motion";
import { Delete, Edit, Settings } from "@mui/icons-material";

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
        const querySnapshot = await getDocs(collection(db, "tvseries"));
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tvseries", id));
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
            {/* <ImportCSV
              docName={STATIC_WORDS.MOVIES}
              isLoading={handleIsLoading}
            /> */}
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
                <div className="card-edit-link-container">
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
                        <li>
                          <Edit fontSize="12px" /> <span>Edit</span>
                        </li>
                        <li className="delete">
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
                    ...
                  </div>
                </div>
                <h2 className="card-title">{item.data.title}</h2>
                <div className="card-info">
                  <div className="card-year">
                    YEAR
                    <br />
                    {item.data.released}
                  </div>
                  <div className="card-length">
                    LENGTH
                    <br />
                    68 mins
                  </div>
                </div>
                <div className="card-ratings">
                  RATINGS
                  <br />
                  <span className="star-rating">{item.data.rating}/10</span>
                </div>
                <div className="card-genre">
                  GENRE
                  <br />
                  Action
                </div>
                <div className="card-creator-status">
                  <div className="card-creator">
                    CREATED BY
                    <br />
                    Admin
                  </div>
                  <div className="card-status">
                    STATUS
                    <br />
                    Active
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
