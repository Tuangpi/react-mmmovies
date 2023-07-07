import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import UpdateSiteCustomize from "./UpdateSiteCustomize";

const SiteCustomization = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <UpdateSiteCustomize />
      </div>
    </div>
  );
};

export default SiteCustomization;
