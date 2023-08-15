import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link, useLocation } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useState } from "react";
import { auth } from "../../configs/firebase";
import {
  DashboardCustomize,
  ImageOutlined,
  Menu,
  Movie,
  PagesOutlined,
  Payment,
  PlayCircleRounded,
  Settings,
  SettingsApplications,
  Tv,
} from "@mui/icons-material";

const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const [show, setShow] = useState(false);
  const location = useLocation();

  const toggleShow = () => {
    setShow(!show);
  };

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        // Perform any necessary actions upon successful logout
        console.log("Logout successful");
      })
      .catch((error) => {
        console.log("Logout failed:", error.message);
      });
  };
  return (
    <>
      <div className="tw-h-12 tw-flex tw-justify-center tw-items-center">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="tw-text-xl tw-font-bold tw-text-slate-50">
            MMMovies
          </span>
        </Link>
      </div>
      <hr />
      <div className="tw-px-0 tw-pt-1 tw-pb-0 tw-pl-2">
        <ul>
          <p className="tw-text-xs tw-font-bold tw-text-slate-100 tw-mt-4 tw-mb-1">
            MAIN
          </p>
          <Link to="/" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname === "/" ? "tw-bg-slate-800" : ""
              }`}
            >
              <DashboardIcon className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Dashboard
              </span>
            </li>
          </Link>
          <p className="tw-text-xs tw-font-bold tw-text-slate-100 tw-mt-3 tw-mb-1">
            USERS
          </p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/users") ? "tw-bg-slate-800" : ""
              }`}
            >
              <PersonOutlineIcon className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Users
              </span>
            </li>
          </Link>
          <p className="tw-text-xs tw-font-bold tw-text-slate-100 tw-mt-3 tw-mb-1">
            MENU &amp; PACKAGES
          </p>
          <Link to="/menu" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/menu") ? "tw-bg-slate-800" : ""
              }`}
            >
              <Menu className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Menu
              </span>
            </li>
          </Link>
          <Link to="/packages" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/packages") ? "tw-bg-slate-800" : ""
              }`}
            >
              <PagesOutlined className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Packages
              </span>
            </li>
          </Link>
          <p className="tw-text-xs tw-font-bold tw-text-slate-100 tw-mt-3 tw-mb-1">
            CONTENT
          </p>

          <Link to="/movies" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/movies") ? "tw-bg-slate-800" : ""
              }`}
            >
              <Movie className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Movies
              </span>
            </li>
          </Link>
          <Link to="/tvseries" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/tvseries") ? "tw-bg-slate-800" : ""
              }`}
            >
              <Tv className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Tv Series
              </span>
            </li>
          </Link>
          <li
            onClick={toggleShow}
            className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
              location.pathname.includes("/actors") ||
              location.pathname.includes("/directors") ||
              location.pathname.includes("/genres")
                ? "tw-bg-slate-800"
                : ""
            }`}
          >
            <CreditCardIcon className="tw-text-lg tw-text-slate-200" />
            <span
              className={`${
                show ? "arrow-left" : "arrow-right"
              } tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2`}
            >
              Content
            </span>
          </li>
          {show && (
            <>
              <Link to="/actors" style={{ textDecoration: "none" }}>
                <li
                  className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                    location.pathname.includes("/actors")
                      ? "tw-bg-slate-800"
                      : ""
                  }`}
                >
                  <div>-</div>
                  <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                    Actors
                  </span>
                </li>
              </Link>
              <Link to="/directors" style={{ textDecoration: "none" }}>
                <li
                  className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                    location.pathname.includes("/directors")
                      ? "tw-bg-slate-800"
                      : ""
                  }`}
                >
                  <div>-</div>
                  <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                    Directors
                  </span>
                </li>
              </Link>
              <Link to="/genres" style={{ textDecoration: "none" }}>
                <li
                  className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                    location.pathname.includes("/genres")
                      ? "tw-bg-slate-800"
                      : ""
                  }`}
                >
                  <div>-</div>
                  <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                    Genres
                  </span>
                </li>
              </Link>
            </>
          )}

          <p className="tw-text-xs tw-font-bold tw-text-slate-100 tw-mt-3 tw-mb-1">
            SETTINGS
          </p>
          <Link to="/site-customization" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/site-customization")
                  ? "tw-bg-slate-800"
                  : ""
              }`}
            >
              <DashboardCustomize className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Site-Customization
              </span>
            </li>
          </Link>
          <Link to="/site-setting" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/site-setting")
                  ? "tw-bg-slate-800"
                  : ""
              }`}
            >
              <Settings className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Site-Setting
              </span>
            </li>
          </Link>
          <Link to="/player-setting" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/player-setting")
                  ? "tw-bg-slate-800"
                  : ""
              }`}
            >
              <PlayCircleRounded className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Player Setting
              </span>
            </li>
          </Link>
          <Link to="/payment-gateway" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/payment-gateway")
                  ? "tw-bg-slate-800"
                  : ""
              }`}
            >
              <Payment className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Payment Gateway
              </span>
            </li>
          </Link>
          <Link to="/app-setting" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/app-setting")
                  ? "tw-bg-slate-800"
                  : ""
              }`}
            >
              <SettingsApplications className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                App Setting
              </span>
            </li>
          </Link>
          <Link to="/media-manager" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/media-manager")
                  ? "tw-bg-slate-800"
                  : ""
              }`}
            >
              <ImageOutlined className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Media Manager
              </span>
            </li>
          </Link>

          <p className="tw-text-xs tw-font-bold tw-text-slate-100 tw-mt-3 tw-mb-1">
            SUPPORT
          </p>
          <Link to="/help-and-support" style={{ textDecoration: "none" }}>
            <li
              className={`tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded ${
                location.pathname.includes("/help-and-support")
                  ? "tw-bg-slate-800"
                  : ""
              }`}
            >
              <Settings className="tw-text-lg tw-text-slate-200" />
              <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
                Help And Support
              </span>
            </li>
          </Link>
          <li
            onClick={handleLogout}
            className="tw-flex tw-items-center tw-px-5 tw-py-2 tw-cursor-pointer hover:tw-bg-slate-800 tw-rounded"
          >
            <ExitToAppIcon className="tw-text-lg tw-text-slate-200" />
            <span className="tw-text-xs tw-font-semibold tw-text-slate-200 tw-ml-2">
              Logout
            </span>
          </li>
        </ul>
      </div>
      {/* <div className="bottom">
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "LIGHT" })}
        ></div>
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "DARK" })}
        ></div>
      </div> */}
    </>
  );
};

export default Sidebar;
