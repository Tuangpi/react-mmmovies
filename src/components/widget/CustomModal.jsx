import "../../style/modalcard.scss";
import { Modal } from "react-overlays";
import "../../style/modal.scss";
import {
  ListObjects,
  SearchObjects,
  prepareDisplay,
} from "../../pages/new/NewMovieHelper/FetchObjects";
import { useEffect, useState } from "react";

export const CustomModal = ({
  showModal,
  handleSuccess,
  handleClose,
  handleSelect,
  handleSearch,
  objects,
}) => {
  const [data, setData] = useState(objects);
  useEffect(() => {
    setData(objects);
    console.log(objects);
  }, [objects]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (searchQuery && searchQuery !== "") {
  //       setIsLoading(true);
  //       try {
  //         const fetchedObjects = await SearchObjects(searchQuery);
  //         setObjects(fetchedObjects);
  //       } catch (error) {
  //         console.error("Error fetching objects:", error);
  //       }
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [searchQuery]);

  // console.log(objects);
  // Backdrop JSX code
  const renderBackdrop = (props) => <div className="backdrop" {...props} />;
  var handleSuccess = () => {
    console.log("success");
  };
  return (
    <Modal
      className="modal"
      show={showModal}
      onHide={handleClose}
      renderBackdrop={renderBackdrop}
    >
      <div className="modal-start">
        <div className="modal-header">
          <div className="modal-title">Modal Heading</div>
          <div>
            <span className="close-button" onClick={handleClose}>
              &#215;
            </span>
          </div>
        </div>
        <div className="modal-search">
          <input type="text" onKeyDown={handleSearch} />
        </div>
        <div className="modal-desc">
          {/* {isLoading ? (
            <div>Loading...</div>
          ) : ( */}
          {data &&
            data.length > 0 &&
            data.map((d, key) => (
              <div
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
              </div>
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
