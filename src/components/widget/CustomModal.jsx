import "../../style/modalcard.scss";
import { Modal } from "react-overlays";
import "../../style/modal.scss";
import { motion } from "framer-motion";

export const CustomModal = ({
  showModal,
  handleSuccess,
  handleClose,
  handleSelect,
  handleSearch,
  objects,
}) => {
  const renderBackdrop = (props) => <div className="backdrop" {...props} />;

  return (
    <Modal
      className="modal"
      show={showModal}
      onHide={handleClose}
      renderBackdrop={renderBackdrop}
    >
      <div className="modal-start" id="custom-modal">
        <div className="modal-header">
          <div className="modal-title">Modal Heading</div>
          <div>
            <span className="close-button" onClick={handleClose}>
              &#215;
            </span>
          </div>
        </div>
        <div className="modal-search">
          <input type="text" onKeyDown={handleSearch} className="p-2 text-sm" />
        </div>

        <div className="modal-desc" id="custom-modal-desc">
          {objects &&
            objects.map((d, key) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="modal-card"
                key={key}
                onClick={() => handleSelect(d.path)}
              >
                <div className="modal-card-extension">{d.extension}</div>
                <div className="modal-card-title">
                  {d.name
                    ? d.name.split("").slice(0, 20).join("") + " ..."
                    : d.name}
                </div>
                <div className="modal-meta-data">
                  <div className="card-ratings">{d.size}</div>
                  <div className="card-genre">{d.fileTime}</div>
                </div>
              </motion.div>
            ))}
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={handleClose}>
            Close
          </button>
          <button className="primary-button" onClick={handleSuccess}>
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};
