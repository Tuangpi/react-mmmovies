import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import GenreLists from "./list/GenreLists";

const Genres = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <GenreLists />
      </div>
    </div>
  );
};

export default Genres;
