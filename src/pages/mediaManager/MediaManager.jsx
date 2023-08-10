import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ViewMediaManager from "./ViewMediaManager";

const MediaManager = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <ViewMediaManager />
      </div>
    </div>
  );
};

export default MediaManager;
