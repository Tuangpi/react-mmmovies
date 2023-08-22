import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";

const Home = () => {
  return (
    <div className="tw-pt-5 tw-px-2">
      <div className="tw-flex tw-justify-between tw-flex-wrap tw-gap-1 tw-ml-3 tw-mr-5 ">
        <Widget type="user" />
        <Widget type="movies" />
        <Widget type="tvseries" />
        <Widget type="earning" />
      </div>
      <div className="tw-flex tw-gap-3 tw-justify-between tw-flex-wrap tw-ml-3 tw-mr-5 tw-mt-5 tw-text-slate-800">
        <Featured />
        <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
      </div>
      <div className="tw-ml-3 tw-mr-5 tw-mt-5">
        <div className="tw-text-slate-900 tw-font-bold">
          Latest Transactions
        </div>
        <Table />
      </div>
    </div>
  );
};

export default Home;
