import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import StoreIcon from "@mui/icons-material/Store";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsSystemDaydreamOutlinedIcon from "@mui/icons-material/SettingsSystemDaydreamOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Link, useLocation } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase";
import {
  DashboardCustomize,
  Menu,
  Movie,
  PagesOutlined,
  Payment,
  PlayCircleRounded,
  Settings,
  SettingsApplications,
  Tv,
} from "@mui/icons-material";
import classNames from "classnames";

const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const [show, setShow] = useState(false);

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
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">MMMovies</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <Link to="/" style={{ textDecoration: "none" }}>
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </li>
          </Link>
          <p className="title">USERS</p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li>
              <PersonOutlineIcon className="icon" />
              <span>Users</span>
            </li>
          </Link>
          <p className="title">MENU &amp; PACKAGES</p>
          <Link to="/menu" style={{ textDecoration: "none" }}>
            <li>
              <Menu className="icon" />
              <span>Menu</span>
            </li>
          </Link>
          <Link to="/packages" style={{ textDecoration: "none" }}>
            <li>
              <PagesOutlined className="icon" />
              <span>Packages</span>
            </li>
          </Link>
          <p className="title">CONTENT</p>

          <Link to="/movies" style={{ textDecoration: "none" }}>
            <li>
              <Movie className="icon" />
              <span>Movies</span>
            </li>
          </Link>
          <Link to="/tvseries" style={{ textDecoration: "none" }}>
            <li>
              <Tv className="icon" />
              <span>Tv Series</span>
            </li>
          </Link>
          <li onClick={toggleShow}>
            <CreditCardIcon className="icon" />
            <span className={`${show ? "arrow-left" : "arrow-right"}`}>
              Content
            </span>
          </li>
          {show && (
            <>
              <Link to="/actors" style={{ textDecoration: "none" }}>
                <li className="tab">
                  <div>-</div>
                  <span>Actors</span>
                </li>
              </Link>
              <Link to="/directors" style={{ textDecoration: "none" }}>
                <li className="tab">
                  <div>-</div>
                  <span>Directors</span>
                </li>
              </Link>
              <Link to="/genres" style={{ textDecoration: "none" }}>
                <li className="tab">
                  <div>-</div>
                  <span>Genres</span>
                </li>
              </Link>
            </>
          )}

          <p className="title">SETTINGS</p>
          <li>
            <DashboardCustomize className="icon" />
            <span>Site-Customization</span>
          </li>
          <li>
            <Settings className="icon" />
            <span>Site-Setting</span>
          </li>
          <li>
            <PlayCircleRounded className="icon" />
            <span>Player Setting</span>
          </li>
          <li>
            <Payment className="icon" />
            <span>Payment Gateway</span>
          </li>
          <li>
            <SettingsApplications className="icon" />
            <span>App Setting</span>
          </li>
          <p className="title">SUPPORT</p>
          <li>
            <Settings className="icon" />
            <span>Help And Support</span>
          </li>
          <li onClick={handleLogout}>
            <ExitToAppIcon className="icon" />
            <span>Logout</span>
          </li>
        </ul>
      </div>
      <div className="bottom">
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "LIGHT" })}
        ></div>
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "DARK" })}
        ></div>
      </div>
    </div>
  );
};

export default Sidebar;
