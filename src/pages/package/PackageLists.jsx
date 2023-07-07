import "../../style/cardlist.scss";
import { Link } from "react-router-dom";

const PackageLists = () => {
  return (
    <div className="datatable">
      <div className="datatableTitle">
        All Packages
        <Link to="/packages/new" className="link">
          Add New
        </Link>
      </div>
    </div>
  );
};

export default PackageLists;
