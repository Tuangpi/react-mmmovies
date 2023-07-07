import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import TvSeriesLists from "./list/TvSeriesLists";

const TvSeries = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <TvSeriesLists />
      </div>
    </div>
  );
};

export default TvSeries;
