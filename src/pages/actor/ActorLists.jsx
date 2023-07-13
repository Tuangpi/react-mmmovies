import "../../style/cardlist.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImportCSV from "../../components/import/ImportCSV";
import { STATIC_WORDS } from "../../assets/STATICWORDS";
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
    <div className="datatable">
      {isLoading && (
        <div className="loading-container">
          <Loading type="spokes" color="#fff" height={"4%"} width={"4%"} />
        </div>
      )}
      <div className="datatableTitle">
        <div>All Actor</div>
        <div className="title-right">
          <div className="title-right-first">
            <ImportCSV
              docName={STATIC_WORDS.ACTORS}
              isLoading={handleIsLoading}
            />
          </div>
          <div>
            <Link to="/actors/new" className="link">
              Add New
            </Link>
          </div>
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
            <div className="card" key={id}>
              <ImageComponent
                alter="Actor Poster"
                src={item.image}
                className="card-image"
              />
              <div className="card-details">
                <h2 className="card-title">{item.name}</h2>
                <div className="card-info">
                  <div className="card-year">
                    DOB
                    <br />
                    {item.DOB}
                  </div>
                </div>
                <div className="card-ratings">
                  PLACE OF BIRTH
                  <br />
                  {item.place_of_birth}
                </div>
                <div className="card-genre">
                  BIOGRAPHY
                  <br />
                  {item.biography
                    ? item.biography.split(" ").slice(0, 6).join(" ") + " ..."
                    : item.biography}
                </div>
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
          key="0"
          className="nodata"
        >
          No Data
        </motion.div>
      )}
    </div>
  );
};

export default ActorLists;
