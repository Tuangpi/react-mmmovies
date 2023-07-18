import { collection, getDocs } from "firebase/firestore";
import { db } from "../configs/firebase";
import Papa from "papaparse";

export const isDocumentEmpty = async (docName) => {
  const documentQuerySnapshot = await getDocs(collection(db, docName));
  return documentQuerySnapshot.empty;
};

export const ChangeCSVtoJson = (csvFile) => {
  const parsedData = Papa.parse(csvFile, { header: true });
  parsedData.data.pop();
  return parsedData.data;
};
