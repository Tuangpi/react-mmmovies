import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ShowAllPaymentGateWay from "./ShowAllPaymentGateWay";

const PaymentGateWay = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <ShowAllPaymentGateWay />
      </div>
    </div>
  );
};

export default PaymentGateWay;
