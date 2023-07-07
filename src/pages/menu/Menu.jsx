import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import MenuLists from "./MenuLists";

const Menu = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <MenuLists />
      </div>
    </div>
  );
};

export default Menu;
