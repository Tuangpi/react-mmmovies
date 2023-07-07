import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import MovieLists from "./MovieLists";

const Movies = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <MovieLists />
      </div>
    </div>
  );
};

export default Movies;
