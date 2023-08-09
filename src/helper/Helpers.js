import { collection, getDocs } from "firebase/firestore";
import { db } from "../configs/firebase";
import Papa from "papaparse";
import { STATIC_WORDS } from "../assets/STATIC_WORDS";
import { S3 } from "aws-sdk";
import awsConfig, { myBucket } from "../configs/wasabi";

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

export const generatePresignedUrl = async (objectKey) => {
  const s3 = new S3(awsConfig);

  const params = {
    Bucket: myBucket,
    Key: objectKey,
    Expires: Number.MAX_SAFE_INTEGER,
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (error, url) => {
      if (error) {
        reject(error);
      } else {
        resolve(url);
      }
    });
  });
}

export const convertToSlug = (str) => {
  return str.toLowerCase().replace(/\s+/g, '-');
}

export const starRating = (rating) => {
  const fullStars = Math.floor(rating / 2);
  const arr = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      arr.push("full");
    } else {
      arr.push("empty");
    }
  }
  return arr;
}