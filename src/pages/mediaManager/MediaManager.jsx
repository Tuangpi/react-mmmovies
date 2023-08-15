import { motion } from "framer-motion";
import { Folder } from "@mui/icons-material";
import { CustomModal } from "../../components/widget/CustomModal";
import { ListObjects, SearchObjects } from "../../helper/FetchObjects";
import { useEffect, useState } from "react";

const MediaManager = () => {
  const [objectKey, setObjectKey] = useState("movies_upload_wasabi");
  const [objects, setObjects] = useState([]);
  const [continuationToken, setContinuationToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectKey, setSelectKey] = useState("");

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      const search = e.target.value;
      try {
        const fetchObj = await SearchObjects(search, objectKey);
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
    <div className="tw-bg-slate-100 tw-pt-5 tw-min-h-screen">
      <div className="tw-mx-5">
        <h1 className="tw-font-bold tw-text-slate-500">Media Manager</h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1, ease: "easeIn" }}
        className="tw-flex tw-gap-x-5 tw-gap-y-2 tw-flex-wrap tw-bg-slate-100 tw-p-9 tw-rounded-sm"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeIn" }}
          className="tw-py-2 tw-px-6 tw-bg-sky-900 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-purple-800 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-slate-900 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-emerald-800 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-red-600 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-slate-900 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-orange-900 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-amber-900 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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
          className="tw-py-2 tw-px-6 tw-bg-indigo-900 tw-border-none tw-outline-none tw-rounded-md tw-text-lime-100 hover:tw-bg-slate-600 tw-cursor-pointer"
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

export default MediaManager;
