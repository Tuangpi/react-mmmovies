import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import UpdatePlayerSetting from "./UpdatePlayerSetting";

const PlayerSetting = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <UpdatePlayerSetting />
      </div>
    </div>
  );
};

export default PlayerSetting;
