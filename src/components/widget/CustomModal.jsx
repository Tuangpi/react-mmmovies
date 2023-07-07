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
  // handleSearch,
}) => {
  const [objects, setObjects] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    const abortController = new AbortController();
    const getObjects = async () => {
      setIsLoading(true);
      try {
        const fetchedObjects = await ListObjects(abortController.signal);
        setObjects(fetchedObjects);
      } catch (error) {
        console.error("Error fetching objects:", error);
      }
      setIsLoading(false);
    };
    getObjects();
    return () => {
      abortController.abort();
    };
  }, []);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      const search = e.target.value;
      // const fetchObj = await SearchObjects(search);
      // setObjects(fetchObj);
      setSearchQuery(search);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (searchQuery && searchQuery !== "") {
        setIsLoading(true);
        try {
          const fetchedObjects = await SearchObjects(searchQuery);
          setObjects(fetchedObjects);
        } catch (error) {
          console.error("Error fetching objects:", error);
        }
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  console.log(objects);
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
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            objects.length > 0 &&
            objects.map((object, key) => (
              <div
                className="modal-card"
                key={key}
                onClick={() => handleSelect(object.path)}
              >
                <div className="modal-card-extension">{object.extension}</div>
                <div className="modal-card-title">
                  {object.name
                    ? object.name.split("").slice(0, 20).join("") + " ..."
                    : object.name}
                </div>
                <div className="modal-meta-data">
                  <div className="card-ratings">{object.size}</div>
                  <div className="card-genre">{object.fileTime}</div>
                </div>
              </div>
            ))
          )}
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
