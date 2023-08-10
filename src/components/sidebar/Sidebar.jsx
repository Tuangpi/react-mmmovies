import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useEffect, useState } from "react";
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
            <Link to="/site-customization" style={{ textDecoration: "none" }}>
              <li>
                <DashboardCustomize className="icon" />
                <span>Site-Customization</span>
              </li>
            </Link>
            <Link to="/site-setting" style={{ textDecoration: "none" }}>
              <li>
                <Settings className="icon" />
                <span>Site-Setting</span>
              </li>
            </Link>
            <Link to="/player-setting" style={{ textDecoration: "none" }}>
              <li>
                <PlayCircleRounded className="icon" />
                <span>Player Setting</span>
              </li>
            </Link>
            <Link to="/payment-gateway" style={{ textDecoration: "none" }}>
              <li>
                <Payment className="icon" />
                <span>Payment Gateway</span>
              </li>
            </Link>
            <Link to="/app-setting" style={{ textDecoration: "none" }}>
              <li>
                <SettingsApplications className="icon" />
                <span>App Setting</span>
              </li>
            </Link>
            <Link to="/media-manager" style={{ textDecoration: "none" }}>
              <li>
                <ImageOutlined className="icon" />
                <span>Media Manager</span>
              </li>
            </Link>

            <p className="title">SUPPORT</p>
            <Link to="/help-and-support" style={{ textDecoration: "none" }}>
              <li>
                <Settings className="icon" />
                <span>Help And Support</span>
              </li>
            </Link>
            <li onClick={handleLogout}>
              <ExitToAppIcon className="icon" />
              <span>Logout</span>
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
      </div>
    </>
  );
};

export default Sidebar;
