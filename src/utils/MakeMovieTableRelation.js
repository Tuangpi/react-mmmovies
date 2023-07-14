import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import { STATIC_WORDS } from "../assets/STATICWORDS";

export const MakeMovieTableRelation = async (docName) => {
  const [actors, directors, genres] = await getUnRelatedIds();

  if (actors.length === 0 && directors.length === 0 && genres.length === 0)
    return "Movies Connected with Actors, Director and Genres";

  switch (docName) {
    case STATIC_WORDS.ACTORS:
      const readyActors = await modifiedArray(actors, docName);
      console.log(readyActors);
      await updateMovieDoc(readyActors, docName);
      break;

    case STATIC_WORDS.DIRECTORS:
      const readyDirectors = await modifiedArray(directors, docName);
      console.log(readyDirectors);
      await updateMovieDoc(readyDirectors, docName);
      break;

    case STATIC_WORDS.GENRES:
      const readyGenres = await modifiedArray(genres, docName);
      await updateMovieDoc(readyGenres, docName);
      break;

    default:
      const readyActor = await modifiedArray(actors, STATIC_WORDS.ACTORS);
      console.log(readyActor);
      await updateMovieDoc(readyActor, STATIC_WORDS.ACTORS);
      const readyDirector = await modifiedArray(
        directors,
        STATIC_WORDS.DIRECTORS
      );
      console.log(readyDirector);
      await updateMovieDoc(readyDirector, STATIC_WORDS.DIRECTORS);
      const readyGenre = await modifiedArray(genres, STATIC_WORDS.GENRES);
      console.log(readyGenre);
      await updateMovieDoc(readyGenre, STATIC_WORDS.GENRES);
      break;
  }

  return "Connected Movies Relations";
};

const updateMovieDoc = async (readyForUpdateData, docName) => {
  const updates = [];
  if (readyForUpdateData && readyForUpdateData.length > 0) {
    readyForUpdateData.forEach((data) => {
      const docRef = doc(db, STATIC_WORDS.MOVIES, data.docId);
      if (docName === STATIC_WORDS.ACTORS) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            actorId: data.ref,
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.DIRECTORS) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            directorId: data.ref,
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.GENRES) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            genreId: data.ref,
          });
          updates.push(update);
        }
      }
    });

    try {
      await Promise.all(updates);
    } catch (err) {
      console.log(err);
    }
  }
};

const modifiedArray = async (ars, docName) => {
  const ids =
    docName === STATIC_WORDS.ACTORS
      ? ars.map((ar) => ar.actorId).flat()
      : docName === STATIC_WORDS.DIRECTORS
      ? ars.map((ar) => ar.directorId).flat()
      : ars.map((ar) => ar.genreId).flat();

  const q = query(collection(db, docName), where("id", "in", ids));

  const actorQuerySnapShot = await getDocs(q);
  actorQuerySnapShot.docs.forEach((doc) => {
    ars.forEach((ar) => {
      if (docName === STATIC_WORDS.ACTORS) {
        if (ar.actorId) {
          ar.actorId.forEach((id) => {
            if (id === doc.data().id)
              ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
          });
        }
      }
      if (docName === STATIC_WORDS.DIRECTORS) {
        if (ar.directorId) {
          ar.directorId.forEach((id) => {
            if (id === doc.data().id)
              ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
          });
        }
      }
      if (docName === STATIC_WORDS.GENRES) {
        if (ar.genreId) {
          ar.genreId.forEach((id) => {
            if (id === doc.data().id)
              ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
          });
        }
      }
    });
  });
  return ars;
};

const getUnRelatedIds = async () => {
  const movieQuerySnapshot = await getDocs(collection(db, STATIC_WORDS.MOVIES));

  let actors = [];
  let directors = [];
  let genres = [];

  movieQuerySnapshot.docs.forEach((doc) => {
    if (!isTableConnected(doc.data().actor_id))
      actors.push({
        docId: doc.id,
        actorId: convertToArray(modifiedId(doc.data().actor_id)),
      });
    if (!isTableConnected(doc.data().director_id))
      directors.push({
        docId: doc.id,
        directorId: convertToArray(modifiedId(doc.data().director_id)),
      });
    if (!isTableConnected(doc.data().genre_id))
      genres.push({
        docId: doc.id,
        genreId: convertToArray(modifiedId(doc.data().genre_id)),
      });
  });
  return [actors, directors, genres];
};

const isTableConnected = (id) => {
  if (id.includes("/")) return true;
  return false;
};

const modifiedId = (id) => {
  if (id.includes("+")) id = id.split("E+")[0].replace(".", "");
  if (!id.includes(",")) {
    if (id.length > 6) id = parseInt(id).toLocaleString();
  }
  return id;
};

const convertToArray = (id) => {
  const ids = [];
  if (id.includes(",")) {
    const i = id.split(",");
    ids.push(...i);
  } else {
    if (!id.includes("/")) ids.push(id);
  }
  return ids;
};
