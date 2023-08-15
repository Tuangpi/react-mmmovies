import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../configs/firebase";
import { MovieFilterSharp, TvOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Widget = ({ type }) => {
  const [amount, setAmount] = useState(null);
  const [diff, setDiff] = useState(null);
  let data;

  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link: "See all users",
        query: "users",
        icon: (
          <PersonOutlinedIcon
            className="tw-p-1 tw-rounded-md tw-self-end"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              fontSize: "2rem",
            }}
          />
        ),
      };
      break;
    case "movies":
      data = {
        title: "MOVIES",
        isMoney: false,
        link: "View all Movies",
        to: "/movies",
        query: "movies",
        icon: (
          <MovieFilterSharp
            className="tw-p-1 tw-rounded-md tw-self-end"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
              fontSize: "2rem",
            }}
          />
        ),
      };
      break;
    case "earning":
      data = {
        title: "EARNINGS",
        isMoney: true,
        link: "View net earnings",
        icon: (
          <MonetizationOnOutlinedIcon
            className="tw-p-1 tw-rounded-md tw-self-end"
            style={{
              backgroundColor: "rgba(0, 128, 0, 0.2)",
              color: "green",
              fontSize: "2rem",
            }}
          />
        ),
      };
      break;
    case "tvseries":
      data = {
        title: "TV Series",
        query: "tvseries",
        link: "View all TV Series",
        to: "/tvseries",
        icon: (
          <TvOutlined
            className="tw-p-1 tw-rounded-md tw-self-end"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
              fontSize: "2rem",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const lastMonth = new Date(new Date().setMonth(today.getMonth() - 1));
      const prevMonth = new Date(new Date().setMonth(today.getMonth() - 2));

      if (data.query) {
        const lastMonthQuery = query(
          collection(db, data.query)
          // where("timeStamp", "<=", today),
          // where("timeStamp", ">", lastMonth)
        );
        const prevMonthQuery = query(
          collection(db, data.query)
          // where("timeStamp", "<=", lastMonth),
          // where("timeStamp", ">", prevMonth)
        );

        const lastMonthData = await getDocs(lastMonthQuery);
        const prevMonthData = await getDocs(prevMonthQuery);

        setAmount(lastMonthData.docs.length);
        setDiff(
          ((lastMonthData.docs.length - prevMonthData.docs.length) /
            prevMonthData.docs.length) *
            100
        );
      }
    };
    try {
      fetchData();
    } catch (err) {
      console.log(err);
    }
  }, [data]);

  return (
    <div className="tw-flex tw-justify-between tw-border-2 tw-border-red-700 tw-p-3 tw-w-64 tw-h-28 tw-rounded-xl">
      <div className="tw-flex tw-flex-col tw-justify-between">
        <span className="tw-text-sm tw-font-bold tw-text-slate-700">
          {data.title}
        </span>
        <span className="tw-font-light tw-text-3xl tw-text-slate-600">
          {data.isMoney && "$"} {amount}
        </span>
        <Link
          to={data.to}
          className="tw-w-max tw-text-xs link tw-text-slate-700 tw-underline"
        >
          {data.link}
        </Link>
      </div>
      <div className="tw-flex tw-flex-col tw-justify-between">
        <div
          className={`tw-flex tw-items-center tw-text-sm ${
            diff < 0 ? "tw-text-red-700" : "tw-text-green-600"
          }`}
        >
          {diff < 0 ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          {diff} %
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
