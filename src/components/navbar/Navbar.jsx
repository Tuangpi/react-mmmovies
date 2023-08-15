import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);

  return (
    <nav className="tw-text-sm tw-text-slate-900 tw-bg-white">
      <div className="tw-h-14 tw-w-full tw-flex tw-justify-between tw-items-center tw-pl-4">
        <div className="tw-border-solid tw-border-slate-300 tw-border-2 tw-flex tw-items-center tw-p-1">
          <input
            type="text"
            placeholder="Search..."
            className="tw-border-none tw-outline-none tw-bg-transparent placeholder:tw-text-sm"
          />
          <SearchOutlinedIcon />
        </div>
        <div className="tw-flex tw-justify-between tw-items-center">
          <div className="tw-flex tw-items-center tw-pr-5">
            <LanguageOutlinedIcon className="tw-text-xl" />
            English
          </div>
          <div className="tw-flex tw-items-center tw-pr-5">
            <DarkModeOutlinedIcon
              className="tw-text-xl"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>
          <div className="tw-flex tw-items-center tw-pr-5">
            <FullscreenExitOutlinedIcon className="tw-text-xl" />
          </div>
          <div className="tw-flex tw-items-center tw-pr-5 tw-relative">
            <NotificationsNoneOutlinedIcon className="tw-text-xl" />
            <div className="tw-w-4 tw-h-4 tw-bg-red-600 tw-rounded-full tw-text-emerald-50 tw-text-xs tw-flex tw-justify-center tw-items-center tw-font-bold tw-absolute -tw-top-1 -tw-right-1">
              1
            </div>
          </div>
          <div className="tw-flex tw-items-center tw-pr-5 tw-relative">
            <ChatBubbleOutlineOutlinedIcon className="tw-text-xl" />
            <div className="tw-w-4 tw-h-4 tw-bg-red-600 tw-rounded-full tw-text-emerald-50 tw-text-xs tw-flex tw-justify-center tw-items-center tw-font-bold tw-absolute -tw-top-1 -tw-right-1">
              2
            </div>
          </div>
          <div className="tw-flex tw-items-center tw-pr-5">
            <ListOutlinedIcon className="tw-text-xl" />
          </div>
          <div className="tw-flex tw-items-center tw-pr-5">
            <img
              src="https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
              alt=""
              className="tw-w-8 tw-h-8 tw-rounded-full"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
