import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../configs/firebase";

const Single = () => {
  const { userId } = useParams();
  const [data, setData] = useState();

  useEffect(() => {
    const fetchData = async (docRef) => {
      try {
        const querySnapshot = await getDoc(doc(db, "users/" + docRef));
        const userData = querySnapshot.data();
        setData(userData);
      } catch (err) {
        console.log(err);
      }
    };

    if (userId) fetchData(userId);
  }, [userId]);

  const onRoleChangeHandle = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", userId), {
        role: e.target.value,
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <div className="tw-p-5">
      <div className="tw-flex tw-shadow-md tw-p-5 tw-items-center tw-gap-x-5">
        <div className="tw-w-1/4 tw-shadow-sm tw-flex tw-flex-col tw-justify-center tw-items-center">
          <div className="tw-w-1/5 tw-flex tw-justify-center tw-items-center tw-text-xs tw-text-slate-700 tw-bg-amber-500 tw-cursor-pointer tw-rounded-md tw-border-none tw-outline-none tw-p-1">
            Edit
          </div>
          <h1 className="tw-text-slate-700 tw-mb-5 tw-text-base">
            Information
          </h1>
          <div className="tw-w-1/2 tw-flex tw-justify-center tw-items-center">
            <img
              src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
              alt=""
              className="tw-w-20 tw-h-20 tw-rounded-full tw-object-cover"
            />
          </div>
        </div>
        <div className="">
          <div className="tw-mb-3 tw-text-slate-700">
            <h1 className="tw-mb-3 tw-text-slate-700">Jane Doe</h1>
            <div className="tw-mb-3 tw-text-sm">
              <span className="tw-font-bold tw-text-slate-700 tw-mr-1">
                Email:
              </span>
              <span className="tw-font-light">{data ? data.email : "J"}</span>
            </div>
            <div className="tw-mb-3 tw-text-sm">
              <span className="tw-font-bold tw-text-slate-700 tw-mr-1">
                Phone:
              </span>
              <span className="tw-font-light">+1 2345 67 89</span>
            </div>
            <div className="tw-mb-3 tw-text-sm">
              <span className="tw-font-bold tw-text-slate-700 tw-mr-1">
                Address:
              </span>
              <span className="tw-font-light">
                Elton St. 234 Garden Yd. NewYork
              </span>
            </div>
            <div className="tw-mb-3 tw-text-sm">
              <span className="tw-font-bold tw-text-slate-700 tw-mr-1">
                Country:
              </span>
              <span className="tw-font-light">USA</span>
            </div>
            <div className="tw-mb-3 tw-text-sm">
              <span className="tw-font-bold tw-text-slate-700 tw-mr-1">
                Role:
              </span>
              <select onChange={onRoleChangeHandle}>
                <option
                  value=""
                  selected={data ? (data.role === "" ? true : false) : true}
                >
                  Select Role
                </option>
                <option
                  value="admin"
                  selected={
                    data ? (data.role === "admin" ? true : false) : false
                  }
                >
                  Admin
                </option>
                <option
                  value="editor"
                  selected={
                    data ? (data.role === "editor" ? true : false) : false
                  }
                >
                  Editor
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Single;
