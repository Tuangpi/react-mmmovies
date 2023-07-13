import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../../configs/firebase";
import { STATIC_WORDS } from "../../../assets/STATICWORDS";
import { isDocumentEmpty } from "../../../helper/isDocumentEmpty";

export const ForGenres = async (data) => {
  let genreIds = [];
  if (data.genres.length > 0) {
    if (await isDocumentEmpty(STATIC_WORDS.GENRES)) {
      try {
        const docRef = await addDoc(collection(db, STATIC_WORDS.GENRES), {
          name: data.genres[0].name,
          image: null,
          position: 1,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        genreIds.push(docRef);
      } catch (error) {
        console.log(error, "genres error");
      }
    }
    const initial = (await isDocumentEmpty(STATIC_WORDS.GENRES)) ? 1 : 0;

    if (initial >= data.genres.length) return null;

    for (let i = initial; i < data.genres.length; i++) {
      console.log(data.genres[i].name);
      const q = query(
        collection(db, STATIC_WORDS.GENRES),
        where("name", "==", data.genres[i].name)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const genreRefs = querySnapshot.docs.map((doc) => doc.ref);
        genreIds.push(...genreRefs);
      } else {
        let increment = 0;
        const q = query(
          collection(db, STATIC_WORDS.GENRES),
          orderBy("position", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const highestDoc = querySnapshot.docs[0];
          increment = highestDoc.data().position;
        }
        increment++;
        try {
          const docRef = await addDoc(collection(db, STATIC_WORDS.GENRES), {
            name: data.genres[i].name,
            image: null,
            position: increment,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });

          genreIds.push(docRef);
        } catch (error) {
          console.log(error, "genres error");
        }
      }
    }
  }
  return genreIds.flat();
};
