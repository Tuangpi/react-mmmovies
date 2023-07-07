import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import UpdateApp from "./UpdateApp";

const AppSetting = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <UpdateApp />
      </div>
    </div>
  );
};

export default AppSetting;
