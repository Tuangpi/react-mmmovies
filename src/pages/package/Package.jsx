import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import PackageLists from "./PackageLists";

const Package = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <PackageLists />
      </div>
    </div>
  );
};

export default Package;
