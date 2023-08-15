import axios from "axios";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, storage } from "../configs/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { STATIC_WORDS } from "../assets/STATIC_WORDS";
import { isDocumentEmpty } from "./Helpers";

export const ForDirectors = async (TMDB_API_KEY, credits) => {
  let directorIds = [];
  let directorApis = [];
  let directors = [];

  if (credits.data) {
    let limit = 0;
    for (let i = 0; i < credits.data.crew.length; i++) {
      if (credits.data.crew[i].department === "Directing") {
        const element = credits.data.crew[i];
        const director = axios.get(
          `https://api.themoviedb.org/3/person/${element.id}?api_key=${TMDB_API_KEY}`
        );
        directorApis.push(director);
        limit++;
      }

      if (limit > 4) {
        break;
      }
    }

    try {
      directors = await Promise.all(directorApis);
    } catch (error) {
      console.log(error);
    }
    if (directors.length > 0) {
      if (await isDocumentEmpty(STATIC_WORDS.DIRECTORS)) {
        let directorURL = null;
        if (directors[0].data.profile_path != null) {
          const directorImage = await axios.get(
            `https://image.tmdb.org/t/p/w300/${directors[0].data.profile_path}`,
            { responseType: "arraybuffer" }
          );

          try {
            const directorRef = ref(
              storage,
              `directors/${directors[0].data.profile_path}`
            );

            if (directorImage.data) {
              await uploadBytesResumable(directorRef, directorImage.data);

              directorURL = await getDownloadURL(directorRef);
            }
          } catch (error) {
            console.log(error, "director_image");
          }
        }

        try {
          if (directorURL) {
            const docRef = await addDoc(
              collection(db, STATIC_WORDS.DIRECTORS),
              {
                name: directors[0].data.name,
                image: directorURL ?? '',
                biography: directors[0].data.biography ?? '',
                place_of_birth: directors[0].data.place_of_birth ?? "",
                DOB: directors[0].data.birthday ?? '',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                slug: '',
              }
            );
            directorIds.push(docRef);
          }
        } catch (error) {
          console.log(error, "directors error");
        }
      }

      const initial = (await isDocumentEmpty(STATIC_WORDS.DIRECTORS)) ? 1 : 0;

      if (initial >= directors.length) return null;

      const directorNames = directors
        .slice(initial, directors.length)
        .map((item) => item.data.name);
      const q = query(
        collection(db, STATIC_WORDS.DIRECTORS),
        where("name", "in", directorNames)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const directorRefs = querySnapshot.docs.map((doc) => doc.ref);
        directorIds.push(...directorRefs);
      } else {
        let directorImageApis = [];
        let directorImages = [];
        let directorRefs = [];

        for (let i = initial; i < directors.length; i++) {
          if (directors[i].data.profile_path != null) {
            const directorImageUrl = axios.get(
              `https://image.tmdb.org/t/p/w300/${directors[i].data.profile_path}`,
              { responseType: "arraybuffer" }
            );
            const directorRef = ref(
              storage,
              `directors/${directors[i].data.profile_path}`
            );
            directorRefs.push(directorRef);
            directorImageApis.push(directorImageUrl);
          }
        }

        try {
          directorImages = await Promise.all(directorImageApis);
        } catch (error) {
          console.error(error);
        }

        let uploadPromises = [];
        let downloadULPromises = [];
        let directorsURL = [];

        for (let i = 0; i < directorImages.length; i++) {
          const uploadPromise = uploadBytesResumable(
            directorRefs[i],
            directorImages[i].data
          );
          uploadPromises.push(uploadPromise);
        }
        try {
          await Promise.all(uploadPromises);
        } catch (error) {
          console.log(error);
        }
        for (let i = 0; i < directorImages.length; i++) {
          const downloadURLPromise = getDownloadURL(directorRefs[i]);
          downloadULPromises.push(downloadURLPromise);
        }
        try {
          directorsURL = await Promise.all(downloadULPromises);
        } catch (error) {
          console.log(error);
        }

        let directorDocsRefs = [];

        for (let i = initial; i < directors.length; i++) {
          if (directorsURL[initial === 1 ? i - 1 : i]) {
            const docRef = addDoc(collection(db, STATIC_WORDS.DIRECTORS), {
              name: directors[i].data.name,
              image: directorsURL[initial === 1 ? i - 1 : i] ?? '',
              biography: directors[i].data.biography ?? '',
              place_of_birth: directors[i].data.place_of_birth ?? '',
              DOB: directors[i].data.birthday ?? '',
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
              slug: '',
            });
            directorDocsRefs.push(docRef);
          }
        }
        if (directors && directorDocsRefs.length === 0) {
          const docRef = addDoc(collection(db, STATIC_WORDS.DIRECTORS), {
            name: directors[initial].data.name,
            image: '',
            biography: directors[initial].data.biography,
            place_of_birth: directors[initial].data.place_of_birth ?? '',
            DOB: directors[initial].data.birthday ?? '',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            slug: '',
          });
          directorDocsRefs.push(docRef);
        }
        try {
          const docRefs = await Promise.all(directorDocsRefs);
          directorIds.push(docRefs);
        } catch (error) {
          console.log(error, "directors error");
        }
      }
    }
  }
  return directorIds.flat();
};
