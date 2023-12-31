import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../configs/firebase";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";

const UserLists = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let list = [];
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
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
      const docRef = doc(db, STATIC_WORDS.USERS, id);
      await updateDoc(docRef, { status: "deleted" });
      setData(
        data.map((item) =>
          item.id === id ? { ...item, status: "deleted" } : item
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="tw-px-2 tw-pt-5">
      <div className="tw-flex tw-justify-between tw-items-center">
        <div className="tw-font-bold tw-text-slate-500">Add New User</div>
        <Link
          to="/users/new"
          className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
        >
          Add New
        </Link>
      </div>
      <DataGrid
        className="tw-bg-white tw-border-none tw-outline-none tw-mt-2"
        rows={data}
        columns={[
          { field: "id", headerName: "ID", width: 70 },
          {
            field: "user",
            headerName: "User",
            width: 230,
            renderCell: (params) => {
              return (
                <div className="cellWithImg">
                  <img className="cellImg" src={params.row.img} alt="avatar" />
                  {params.row.username}
                </div>
              );
            },
          },
          {
            field: "email",
            headerName: "Email",
            width: 230,
          },

          {
            field: "role",
            headerName: "Role",
            width: 100,
          },
          {
            field: "status",
            headerName: "Status",
            width: 160,
            renderCell: (params) => {
              return params.row.status && params.row.status === "deleted" ? (
                <div className="tw-text-red-500 tw-border-none tw-outline-none">
                  Deleted
                </div>
              ) : (
                <div className="tw-text-green-500 tw-border-none tw-outline-none">
                  Active
                </div>
              );
            },
          },
          {
            field: "action",
            headerName: "Action",
            width: 200,
            renderCell: (params) => {
              return (
                <div className="tw-flex tw-justify-between tw-px-2 tw-items-center tw-gap-x-1 tw-flex-wrap">
                  <Link
                    to={`/users/${params.row.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="tw-text-slate-50 tw-px-2 tw-py-1 tw-rounded-md tw-bg-green-500 tw-border-none tw-outline-none tw-cursor-pointer">
                      View
                    </div>
                  </Link>
                  <div
                    className="tw-text-slate-50 tw-px-2 tw-py-1 tw-bg-red-500 tw-border-none tw-rounded-md tw-outline-none tw-cursor-pointer"
                    onClick={() => handleDelete(params.row.id)}
                  >
                    Delete
                  </div>
                </div>
              );
            },
          },
        ]}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
    </div>
  );
};

export default UserLists;
