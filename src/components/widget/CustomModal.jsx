import { Modal } from "react-overlays";
import { motion } from "framer-motion";

export const CustomModal = ({
  showModal,
  handleSuccess,
  handleClose,
  handleSelect,
  handleSearch,
  objects,
}) => {
  const renderBackdrop = (props) => (
    <div
      className="tw-fixed tw-z-30 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-bg-black tw-opacity-50"
      {...props}
    />
  );

  return (
    <Modal
      className="tw-font-sans tw-fixed tw-w-7/12 tw-z-30 tw-top-14 tw-left-1/4 tw-bg-slate-50 tw-rounded-md tw-shadow-md"
      show={showModal}
      onHide={handleClose}
      renderBackdrop={renderBackdrop}
    >
      <div
        className="tw-flex tw-flex-col tw-w-full tw-max-h-screen tw-overflow-y-auto"
        id="custom-modal"
      >
        <div className="tw-p-3 tw-flex tw-justify-between tw-border-b-2">
          <div className="tw-font-medium tw-text-base tw-text-slate-700">
            Modal Heading
          </div>
          <div>
            <span
              className="tw-text-2xl tw-font-extrabold tw-py-0 tw-px-2 tw-border-none tw-outline-none hover:tw-bg-red-500 tw-bg-red-700 tw-opacity-70 tw-cursor-pointer tw-text-white"
              onClick={handleClose}
            >
              &#215;
            </span>
          </div>
        </div>
        <div className="tw-self-end tw-mt-2 tw-mr-6">
          Search
          <input
            type="text"
            onKeyDown={handleSearch}
            className="tw-p-2 tw-text-sm tw-outline-none"
          />
        </div>

        <div
          className="tw-flex tw-flex-wrap tw-gap-4 tw-p-6"
          id="custom-modal-desc"
        >
          {objects &&
            objects.map((d, key) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="tw-relative tw-w-40 tw-bg-slate-200 tw-shadow-md hover:tw-scale-105 tw-cursor-pointer"
                key={key}
                onClick={() => handleSelect(d.path)}
              >
                <div className="tw-m-2 tw-py-12 tw-px-0 tw-bg-slate-100 tw-flex tw-justify-center tw-items-center tw-text-xl tw-uppercase tw-text-slate-700 tw-font-extrabold">
                  {d.extension}
                </div>
                <div className="tw-py-1 tw-px-2 tw-text-sm tw-font-semibold tw-text-slate-700">
                  {d.name
                    ? d.name.split("").slice(0, 20).join("") + " ..."
                    : d.name}
                </div>
                <div className="tw-flex tw-justify-between tw-pt-1 tw-px-2 tw-pb-3 tw-text-xs tw-font-semibold tw-text-slate-600">
                  <div className="card-ratings">{d.size}</div>
                  <div className="card-genre">{d.fileTime}</div>
                </div>
              </motion.div>
            ))}
        </div>

        <div className="tw-p-3">
          <button
            className="tw-cursor-pointer tw-text-base tw-py-3 tw-px-3 tw-rounded-md tw-border-none tw-outline-none tw-text-white tw-bg-slate-600"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="tw-cursor-pointer tw-text-base tw-py-3 tw-px-3 tw-rounded-md tw-border-none tw-outline-none tw-text-white tw-bg-slate-600"
            onClick={handleSuccess}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};
