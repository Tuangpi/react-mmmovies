import "../../style/cardlist.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import { motion } from "framer-motion";
import ImageComponent from "../../components/widget/ImageComponent";
import ImportData from "../../components/import/ImportData";
import { STATIC_WORDS } from "../../assets/STATICWORDS";

const MovieLists = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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
      <div className="datatableTitle">
        <div>All Movie</div>
        <div className="title-right">
          <div className="title-right-first">
            <ImportData docName={STATIC_WORDS.MOVIES} />
          </div>
          <Link to="/movies/new" className="link">
            Add New
          </Link>
        </div>
      </div>
      <div className="movie-card">
        {data.length > 0 ? (
          data.map((item, id) => (
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
          ))
        ) : (
          <div className="nodata">nodata</div>
        )}
      </div>
    </div>
  );
};

export default MovieLists;
