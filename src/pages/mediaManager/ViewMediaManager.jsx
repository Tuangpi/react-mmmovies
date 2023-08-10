import "../../style/cardlist.scss";
import { motion } from "framer-motion";
import { Folder } from "@mui/icons-material";
import { CustomModal } from "../../components/widget/CustomModal";
import { ListObjects, SearchObjects } from "../new/NewMovieHelper/FetchObjects";
import { useEffect, useState } from "react";

const ViewMediaManager = () => {
  const [objectKey, setObjectKey] = useState("movies_upload_wasabi");
  const [objects, setObjects] = useState([]);
  const [continuationToken, setContinuationToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectKey, setSelectKey] = useState("");

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      const search = e.target.value;
      try {
        const fetchObj = await SearchObjects(search);
        setObjects(fetchObj);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async (key) => {
      try {
        const { objects: fetchedObjects, continuationToken: nextToken } =
          await ListObjects(continuationToken, key);
        setObjects((prevObjects) => [...prevObjects, ...fetchedObjects]);
        setContinuationToken(nextToken);
      } catch (error) {
        console.error("Error fetching objects:", error);
      }
    };

    const handleScrollEvent = (e) => {
      const isNearBottom =
        e.target.scrollHeight - e.target.scrollTop < e.target.clientHeight + 5;
      if (isNearBottom && continuationToken) {
        fetchData(objectKey);
      }
    };

    const modalContentElement = document.getElementById("custom-modal");

    if (showModal) {
      if (continuationToken === null) fetchData(objectKey);
      console.log(continuationToken);
      modalContentElement.addEventListener("scroll", handleScrollEvent);
    }

    return () => {
      if (modalContentElement) {
        modalContentElement.removeEventListener("scroll", handleScrollEvent);
      }
    };
  }, [showModal, continuationToken, objectKey]);

  console.log(objects, objects.length, showModal);

  var handleClose = () => {
    setShowModal(false);
    setObjects([]);
    setContinuationToken(null);
  };
  var handleSuccess = () => console.log("success");

  const handleSelect = (key) => {
    setSelectKey(key);
    setShowModal(false);
    setContinuationToken(null);
  };
  return (
    <div className="datatable">
      <div className="datatableTitle">
        <div>Media Manager</div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1, ease: "easeIn" }}
        className="flex gap-x-5 gap-y-2 flex-wrap bg-slate-100 p-9 rounded-sm"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeIn" }}
          className="py-2 px-6 bg-sky-900 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("movies_upload_wasabi/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Movies Upload
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
          className="py-2 px-6 bg-purple-800 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("movies_upload_wasabi/url_360/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Movies 360 Video
          Upload
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          className="py-2 px-6 bg-slate-900 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("movies_upload_wasabi/url_480/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Movies 480 Video
          Upload
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          className="py-2 px-6 bg-emerald-800 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("movies_upload_wasabi/url_720/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Movies 720 Video
          Upload
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="py-2 px-6 bg-red-600 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("movies_upload_wasabi/url_1080/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Movies 1080 Video
          Upload
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="py-2 px-6 bg-slate-900 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("tvshow_upload_wasabi/url_360/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Episode 360 Video
          Upload
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="py-2 px-6 bg-orange-900 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("tvshow_upload_wasabi/url_480/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Episode 480 Video
          Upload Upload
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="py-2 px-6 bg-amber-900 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("tvshow_upload_wasabi/url_720/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Episode 720 Video
          Upload Upload
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="py-2 px-6 bg-indigo-900 border-none outline-none rounded-md text-lime-100 hover:bg-slate-600 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            setObjectKey("tvshow_upload_wasabi/url_1080/");
          }}
        >
          <Folder className="icon" htmlColor="#fefefe" /> Episode 1080 Video
          Upload Upload
        </motion.div>
      </motion.div>
      <CustomModal
        showModal={showModal}
        handleClose={handleClose}
        handleSuccess={handleSuccess}
        handleSelect={handleSelect}
        handleSearch={handleSearch}
        objects={objects}
      />
    </div>
  );
};

export default ViewMediaManager;
