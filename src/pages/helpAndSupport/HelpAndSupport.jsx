import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ShowHelpAndSupport from "./ShowHelpAndSupport";

const HelpAndSupport = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <ShowHelpAndSupport />
      </div>
    </div>
  );
};

export default HelpAndSupport;
