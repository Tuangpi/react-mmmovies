import axios from "axios";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, storage } from "../../../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const ForActors = async (TMDB_API_KEY, credits) => {
  let actorIds = [];
  let actorApis = [];
  let actors = [];

  if (credits.data) {
    for (let i = 0; i < 5; i++) {
      const element = credits.data.cast[i];
      if (element.id) {
        const actorUrl = axios.get(
          `https://api.themoviedb.org/3/person/${element.id}?api_key=${TMDB_API_KEY}`
        );
        actorApis.push(actorUrl);
      }
    }
    try {
      actors = await Promise.all(actorApis);
    } catch (error) {
      console.error(error);
    }
    if (actors.length > 0) {
      const actorSnapShot = await getDocs(collection(db, "actors"));
      const isActorSnapShotEmpty = actorSnapShot.empty;

      if (isActorSnapShotEmpty) {
        let actorURL = null;
        if (actors[0].data.profile_path != null) {
          const actor_image = await axios.get(
            `https://image.tmdb.org/t/p/w300/${actors[0].data.profile_path}`,
            { responseType: "arraybuffer" }
          );

          try {
            const actorRef = ref(
              storage,
              `actors/${actors[0].data.profile_path}`
            );

            await uploadBytesResumable(actorRef, actor_image.data);

            actorURL = await getDownloadURL(actorRef);
          } catch (error) {
            console.log(error, "actor_image");
          }
        }

        try {
          const docRef = await addDoc(collection(db, "actors"), {
            name: actors[0].data.name,
            image: actorURL,
            biography: actors[0].data.biography,
            place_of_birth: actors[0].data.place_of_birth,
            DOB: actors[0].data.birthday,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            slug: null,
          });
          actorIds.push(docRef);
        } catch (error) {
          console.log(error, "actors error");
        }
      }

      const initial = isActorSnapShotEmpty ? 1 : 0;

      if (initial >= actors.length) return null;

      const actorNames = actors
        .slice(initial, actors.length)
        .map((item) => item.data.name);
      const q = query(
        collection(db, "actors"),
        where("name", "in", actorNames)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const actorRefs = querySnapshot.docs.map((doc) => doc.ref);
        actorIds.push(...actorRefs);
      } else {
        let actorImageApis = [];
        let actorImages = [];
        let actorRefs = [];

        for (let i = initial; i < actors.length; i++) {
          if (actors[i].data.profile_path != null) {
            const actorImageUrl = axios.get(
              `https://image.tmdb.org/t/p/w300/${actors[i].data.profile_path}`,
              { responseType: "arraybuffer" }
            );
            const actorRef = ref(
              storage,
              `actors/${actors[i].data.profile_path}`
            );
            actorRefs.push(actorRef);
            actorImageApis.push(actorImageUrl);
          }
        }

        try {
          actorImages = await Promise.all(actorImageApis);
        } catch (error) {
          console.error(error);
        }

        let uploadPromises = [];
        let downloadULPromises = [];
        let actorsURL = [];

        for (let i = 0; i < actorImages.length; i++) {
          const uploadPromise = uploadBytesResumable(
            actorRefs[i],
            actorImages[i].data
          );
          uploadPromises.push(uploadPromise);
        }
        try {
          await Promise.all(uploadPromises);
        } catch (error) {
          console.log(error);
        }
        for (let i = 0; i < actorImages.length; i++) {
          const downloadURLPromise = getDownloadURL(actorRefs[i]);
          downloadULPromises.push(downloadURLPromise);
        }
        try {
          actorsURL = await Promise.all(downloadULPromises);
        } catch (error) {
          console.log(error);
        }

        let actorDocsRefs = [];

        for (let i = initial; i < actors.length; i++) {
          const docRef = addDoc(collection(db, "actors"), {
            name: actors[i].data.name,
            image: actorsURL[initial === 1 ? i - 1 : i] ?? null,
            biography: actors[i].data.biography,
            place_of_birth: actors[i].data.place_of_birth,
            DOB: actors[i].data.birthday,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            slug: null,
          });
          actorDocsRefs.push(docRef);
        }
        try {
          const docRefs = await Promise.all(actorDocsRefs);
          actorIds.push(docRefs);
        } catch (error) {
          console.log(error, "actors error");
        }
      }
    }
  }
  return actorIds.flat();
};
