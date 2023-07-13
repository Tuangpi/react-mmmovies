import "../../style/cardlist.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import { motion } from "framer-motion";
import ImageComponent from "../../components/widget/ImageComponent";
import ImportCSV from "../../components/import/ImportCSV";
import { STATIC_WORDS } from "../../assets/STATICWORDS";
import Loading from "react-loading";

const MovieLists = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleIsLoading = (value) => {
    setIsLoading(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      let list = [];
      try {
        const querySnapshot = await getDocs(
          collection(db, STATIC_WORDS.MOVIES)
        );
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
      await deleteDoc(doc(db, "movies", id));
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
        <div>All Movie</div>
        <div className="title-right">
          <div className="title-right-first">
            <ImportCSV
              docName={STATIC_WORDS.MOVIES}
              isLoading={handleIsLoading}
            />
          </div>
          <Link to="/movies/new" className="link">
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
        <div className="movie-card">
          {data.map((item, id) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="card"
              key={id}
            >
              <ImageComponent
                alter="movie poster"
                src={item.thumbnail}
                className="card-image"
              />

              <div className="card-details">
                <h2 className="card-title">{item.title}</h2>
                <div className="card-info">
                  <div className="card-year">
                    YEAR
                    <br />
                    {item.released}
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
                  <span className="star-rating">{item.rating}/10</span>
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
        </div>
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

export default MovieLists;
