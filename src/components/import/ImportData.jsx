import { useEffect, useState } from "react";
import { uploadData } from "./uploadData";
import Papa from "papaparse";
import axios from "axios";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../configs/firebase";
import { blobToURL, fromURL } from "image-resize-compress";

const ImportData = ({ docName }) => {
  const [tmdbId, setTmdbId] = useState("318846");
  const [image, setImage] = useState();
  const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

  const fetchImage = async () => {
    try {
      // const response = await axios.get(
      //   `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
      // );
      // const sourceUrl = `https://image.tmdb.org/t/p/original/${response.data["backdrop_path"]}`;
      // let asdf = null;
      // fromURL(sourceUrl, 1, 0, 0, "webp").then((blob) => {
      //   const posterRef = ref(storage, response.data["backdrop_path"]);
      //   uploadBytesResumable(posterRef, blob)
      //     .then((snapshot) => {
      //       asdf = getDownloadURL(posterRef);
      //       console.log(snapshot);
      //     })
      //     .catch((error) => {
      //       console.error("Error uploading image: ", error);
      //     });
      // });
      // console.log(asdf);
      // return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // fetchImage();
  }, []);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    try {
      reader.onload = (event) => {
        const csvFileContent = event.target.result;
        const parsedData = Papa.parse(csvFileContent, { header: true });
        parsedData.data.pop();
        // uploadData(parsedData.data, docName);
      };

      reader.readAsText(file);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <input type="file" onChange={handleFileUpload} accept=".csv" />
      <img src={image} />
    </>
  );
};

export default ImportData;
