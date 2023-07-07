import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import ActorLists from "./list/ActorLists";

const Actors = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <ActorLists />
      </div>
    </div>
  );
};

export default Actors;
