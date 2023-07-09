import "../../style/cardlist.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import ImageComponent from "../../components/widget/ImageComponent";

const DirectorLists = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      let list = [];
      try {
        const querySnapshot = await getDocs(collection(db, "directors"));
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
      await deleteDoc(doc(db, "directors", id));
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
        All Director
        <Link to="/directors/new" className="link">
          Add New
        </Link>
      </div>
      <div className="movie-card">
        {data.map((item, id) => (
          <div className="card" key={id}>
            <ImageComponent
              alt="Director Poster"
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
    </div>
  );
};

export default DirectorLists;