import { collection, getDocs } from "firebase/firestore";
import { db } from "../configs/firebase";
import Papa from "papaparse";
import { STATIC_WORDS } from "../assets/STATIC_WORDS";

export const isDocumentEmpty = async (docName) => {
  const documentQuerySnapshot = await getDocs(collection(db, docName));
  return documentQuerySnapshot.empty;
};

export const areDocumentsNotEmpty = async () => {
  const moviesNotEmpty = !(await isDocumentEmpty(STATIC_WORDS.MOVIES));
  const actorsNotEmpty = !(await isDocumentEmpty(STATIC_WORDS.ACTORS));
  const directorsNotEmpty = !(await isDocumentEmpty(STATIC_WORDS.DIRECTORS));
  const genreNotEmpty = !(await isDocumentEmpty(STATIC_WORDS.GENRES));
  const tvseriesNotEmpty = !(await isDocumentEmpty(STATIC_WORDS.TVSERIES));

  return (
    moviesNotEmpty &&
    actorsNotEmpty &&
    directorsNotEmpty &&
    tvseriesNotEmpty &&
    genreNotEmpty
  );
};

export const ChangeCSVtoJson = (csvFile) => {
  const parsedData = Papa.parse(csvFile, { header: true });
  parsedData.data.pop();
  return parsedData.data;
};
