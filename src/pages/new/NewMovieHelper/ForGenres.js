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
import { db } from "../../../firebase";

export const ForGenres = async (data) => {
  let genreIds = [];
  const genreQuerySnapshot = await getDocs(collection(db, "genres"));
  const isGenreQuerySnapshotEmpty = genreQuerySnapshot.empty;

  if (data.genres.length > 0) {
    if (genreQuerySnapshot.empty) {
      try {
        const docRef = await addDoc(collection(db, "genres"), {
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
    const initial = isGenreQuerySnapshotEmpty ? 1 : 0;

    if (initial >= data.genres.length) return null;

    const genreNames = data.genres
      .slice(initial, data.genres.length)
      .map((item) => item.name);

    const q = query(collection(db, "genres"), where("name", "in", genreNames));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const genreRefs = querySnapshot.docs.map((doc) => doc.ref);
      genreIds.push(...genreRefs);
    } else {
      let increment = 0;
      const q = query(
        collection(db, "genres"),
        orderBy("position", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const highestDoc = querySnapshot.docs[0];
        increment = highestDoc.data().position;
      }

      for (let i = initial; i < data.genres.length; i++) {
        increment++;
        try {
          const docRef = await addDoc(collection(db, "genres"), {
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
  console.log(genreIds.flat());
  return genreIds.flat();
};
