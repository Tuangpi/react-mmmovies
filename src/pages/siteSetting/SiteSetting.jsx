import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import UpdateSiteSetting from "./UpdateSiteSetting";

const SiteSetting = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <UpdateSiteSetting />
      </div>
    </div>
  );
};

export default SiteSetting;
