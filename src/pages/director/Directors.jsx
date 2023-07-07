import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import DirectorLists from "./DirectorLists";

const Directors = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <DirectorLists />
      </div>
    </div>
  );
};

export default Directors;
