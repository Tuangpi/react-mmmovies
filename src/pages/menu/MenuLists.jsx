import { Link } from "react-router-dom";

const MenuLists = () => {
  return (
    <div className="tw-pt-5 tw-px-5">
      <div className="tw-flex tw-justify-between tw-items-center tw-px-5">
        <h1 className="tw-font-bold tw-text-slate-500"> All Menus</h1>
        <Link
          to="/menu/new"
          className="tw-py-1 tw-px-4 tw-border-none tw-outline-none tw-bg-sky-800 tw-rounded-md tw-text-slate-50"
        >
          Add New
        </Link>
      </div>
    </div>
  );
};

export default MenuLists;
