import "../../style/cardlist.scss";
import { Link } from "react-router-dom";

const MenuLists = () => {
  return (
    <div className="datatable">
      <div className="datatableTitle">
        All Menus
        <Link to="/menu/new" className="link">
          Add New
        </Link>
      </div>
    </div>
  );
};

export default MenuLists;
