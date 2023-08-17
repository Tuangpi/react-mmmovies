import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";

const Featured = () => {
  return (
    <div className="featured tw-p-3 tw-bg-white">
      <div className="tw-flex tw-items-center tw-justify-between tw-text-slate-700">
        <h1 className="tw-font-medium tw-text-base">Total Revenue</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="tw-flex tw-items-center tw-justify-center tw-flex-col tw-p-5 tw-gap-4">
        <div className="tw-w-28 tw-h-28">
          <CircularProgressbar value={70} text={"70%"} strokeWidth={5} />
        </div>
        <p className="tw-font-medium tw-text-slate-700">
          Total sales made today
        </p>
        <p className="tw-text-3xl">$420</p>
        <p className="tw-font-light tw-text-xs tw-text-slate-600 tw-text-center">
          Previous transactions processing. Last payments may not be included.
        </p>
        <div className="tw-flex tw-w-full tw-justify-between tw-items-center">
          <div className="tw-text-center">
            <div className="tw-text-sm tw-text-slate-800">Target</div>
            <div className="tw-flex tw-items-center tw-mt-3 tw-text-sm tw-text-red-700">
              <KeyboardArrowDownIcon fontSize="small" />
              <div>$12.4k</div>
            </div>
          </div>
          <div className="tw-text-center">
            <div className="tw-text-sm tw-text-slate-800">Last Week</div>
            <div className="tw-flex tw-items-center tw-mt-3 tw-text-sm tw-text-green-700">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div>$12.4k</div>
            </div>
          </div>
          <div className="tw-text-center">
            <div className="tw-text-sm tw-text-slate-800">Last Month</div>
            <div className="tw-flex tw-items-center tw-mt-3 tw-text-sm tw-text-green-700">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div>$12.4k</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
