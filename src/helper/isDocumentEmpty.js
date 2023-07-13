import { collection, getDocs } from "firebase/firestore";
import { db } from "../configs/firebase";

export const isDocumentEmpty = async (docName) => {
  const documentQuerySnapshot = await getDocs(collection(db, docName));
  return documentQuerySnapshot.empty;
};
