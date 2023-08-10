import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, storage } from "../../configs/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { fromURL } from "image-resize-compress";
import { STATIC_WORDS } from "../../assets/STATIC_WORDS";
import { isDocumentEmpty } from "../../helper/Helpers";

export const uploadData = async (rawData, docName) => {
  const data = await modifiedData(rawData, docName);
  console.log(data);
  let cleanedData = [];
  let batchArray = [];

  const validDocNames = [
    STATIC_WORDS.MOVIES,
    STATIC_WORDS.TVSERIES,
    STATIC_WORDS.SEASONS,
    STATIC_WORDS.EPISODES,
  ];

  if (await isDocumentEmpty(docName)) {
    cleanedData.push(...data);
  } else {
    data.forEach(async (object) => {
      let checkValue = object.name;
      if (validDocNames.includes(docName)) checkValue = object.tmdb_id;

      if (checkValue !== "" && checkValue !== null) {
        batchArray.push({ id: checkValue, data: object });
      } else {
        cleanedData.push(object);
      }
    });

    let lastBatchArray = [];

    if (batchArray.length > 0) {
      let tmpArrForCheck = [];
      let fieldWhere = "name";
      if (validDocNames.includes(docName)) fieldWhere = "tmdb_id";

      for (let i = 0; i < batchArray.length; i++) {
        if (i % 20 === 0 && i !== 0) {
          lastBatchArray = [];
          try {
            const q = query(
              collection(db, docName),
              where(
                fieldWhere,
                "in",
                batchArray.slice(i - 20, i).map((result) => result.id)
              )
            );

            const querySnapshots = await Promise.all([getDocs(q)]);
            querySnapshots.forEach((querySnap) => {
              querySnap.forEach((q) => {
                if (validDocNames.includes(docName)) {
                  tmpArrForCheck.push(q.data().tmdb_id);
                } else {
                  tmpArrForCheck.push(q.data().name);
                }
              });
            });

            const uniqueTmpArrForCheck = Array.from(new Set(tmpArrForCheck));

            batchArray.slice(i - 20, i).forEach((data) => {
              if (!uniqueTmpArrForCheck.includes(data.id)) {
                cleanedData.push(data.data);
              }
            });

            tmpArrForCheck.length = 0;
          } catch (err) {
            console.log(err);
          }
        }

        lastBatchArray.push(batchArray[i]);
        tmpArrForCheck.length = 0;
      }

      if (lastBatchArray.length > 0) {
        try {
          const q = query(
            collection(db, docName),
            where(
              fieldWhere,
              "in",
              lastBatchArray.map((result) => result.id)
            )
          );

          tmpArrForCheck.length = 0;
          const querySnapshots = await Promise.all([getDocs(q)]);
          querySnapshots.forEach((querySnap) => {
            querySnap.forEach((q) => {
              if (validDocNames.includes(docName)) {
                tmpArrForCheck.push(q.data().tmdb_id);
              } else {
                tmpArrForCheck.push(q.data().name);
              }
            });
          });

          const uniqueTmpArrForCheck = Array.from(new Set(tmpArrForCheck));

          batchArray
            .slice(batchArray.length - lastBatchArray.length, batchArray.length)
            .forEach((data) => {
              if (!uniqueTmpArrForCheck.includes(data.id)) {
                cleanedData.push(data.data);
              }
            });
          tmpArrForCheck.length = 0;
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  const batchSize = 10;
  const batch = [];
  let batchCounter = 0;
  const uniqueCleanedData = Array.from(new Set(cleanedData));
  console.log(uniqueCleanedData);
  uniqueCleanedData.forEach(async (object) => {
    batch.push(addDoc(collection(db, docName), object));
    batchCounter++;

    if (batchCounter === batchSize) {
      try {
        await Promise.all(batch);
        console.log("Batch uploaded successfully!");
      } catch (error) {
        console.error("Error uploading batch:", error);
      }

      batch.length = 0;
      batchCounter = 0;
    }
  });

  if (batch.length > 0) {
    try {
      await Promise.all(batch);
      console.log("Last batch uploaded successfully!");
    } catch (error) {
      console.error("Error uploading last batch:", error);
    }
  }
};

const modifiedData = async (rawData, docName) => {
  console.log(docName);
  const validDocNames = [
    STATIC_WORDS.MOVIES,
    STATIC_WORDS.TVSERIES,
    STATIC_WORDS.SEASONS,
    STATIC_WORDS.EPISODES,
  ];

  if (docName === STATIC_WORDS.ACTORS || docName === STATIC_WORDS.DIRECTORS) {
    const imageUrlPromise = await fetchRelatedImage(rawData, docName);
    for (let i = 0; i < rawData.length; i++) {
      rawData[i].image = imageUrlPromise[i] ?? '';
      rawData[i].created_at = new Date(rawData[i].created_at);
      rawData[i].updated_at = new Date(rawData[i].updated_at);
      if (docName === STATIC_WORDS.ACTORS) {
        rawData[i].actor_id = rawData[i].id;
        delete rawData[i].id;
      }

      if (docName === STATIC_WORDS.DIRECTORS) {
        rawData[i].director_id = rawData[i].id;
        delete rawData[i].id;
      }
    }
  }

  if (validDocNames.includes(docName)) {
    const [posterUrlPromise, thumbnailUrlPromise] = await fetchRelatedImage(
      rawData,
      docName
    );
    for (let i = 0; i < rawData.length; i++) {
      rawData[i].thumbnail = thumbnailUrlPromise[i] ?? '';
      rawData[i].poster = posterUrlPromise[i] ?? '';
      rawData[i].created_at = new Date(rawData[i].created_at);
      rawData[i].updated_at = new Date(rawData[i].updated_at);
      rawData[i].tmdb_id = String(rawData[i].tmdb_id);

      if (docName === STATIC_WORDS.MOVIES || docName === STATIC_WORDS.TVSERIES) {
        delete rawData[i].created_by;
        rawData[i].featured = rawData[i].featured === '1' ? true : false;
        rawData[i].is_kids = rawData[i].is_kids === '1' ? true : false;
        rawData[i].is_upcoming = rawData[i].is_upcoming === '1' ? true : false;
        rawData[i].status = rawData[i].status === '1' ? true : false;
        rawData[i].rating = parseFloat(rawData[i].rating);
        rawData[i].upcoming_date = rawData[i].upcoming_date ? new Date(rawData[i].upcoming_date) : new Timestamp(0, 0);
        delete rawData[i].updated_by;
        rawData[i].country = [];
        rawData[i].channel = Number(rawData[i].channel);
      }

      if (docName === STATIC_WORDS.MOVIES) {
        rawData[i].movie_id = rawData[i].id;
        delete rawData[i].id;
        rawData[i].is_protected = rawData[i].is_protected === '1' ? true : false;
        rawData[i].series = rawData[i].series === '1' ? true : false;
        rawData[i].subtitle = rawData[i].subtitle === '1' ? true : false;
      }

      if (docName === STATIC_WORDS.TVSERIES) {
        rawData[i].tvseries_id = rawData[i].id;
        delete rawData[i].id;
      }

      if (docName === STATIC_WORDS.SEASONS) {
        rawData[i].featured = rawData[i].featured === '1' ? true : false;
        rawData[i].season_id = rawData[i].id;
        delete rawData[i].id;
      }
    }
  }

  if (docName === STATIC_WORDS.GENRES) {
    let increment = 1;
    if (await isDocumentEmpty(STATIC_WORDS.GENRES)) {
      rawData.forEach((data) => {
        data.name = data.name.substring(7, data.name.length - 2);
        data.created_at = new Date(data.created_at);
        data.updated_at = new Date(data.updated_at);
        data.genre_id = data.id;
        delete data.id;
      });
    } else {
      rawData.forEach(async (data) => {
        data.name = data.name.substring(7, data.name.length - 2);
        data.created_at = new Date(data.created_at);
        data.updated_at = new Date(data.updated_at);
        data.genre_id = data.id;
        delete data.id;
        const q = query(
          collection(db, STATIC_WORDS.GENRES),
          where("name", "==", data.name)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const q = query(
            collection(db, STATIC_WORDS.GENRES),
            orderBy("position", "desc"),
            limit(1)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const highestDoc = querySnapshot.docs[0];
            const position = highestDoc.data().position;
            data.position = position + increment;
            increment++;
          }
        }
      });
    }
  }

  return rawData;
};

const fetchRelatedImage = async (rawData, docName) => {
  const posterBlobs = [];
  const thumbnailBlobs = [];
  const posterRefs = [];
  const thumbnailRefs = [];
  const actorBlobs = [];
  const actorRefs = [];
  const directorBlobs = [];
  const directorRefs = [];
  const validDocNames = [
    STATIC_WORDS.MOVIES,
    STATIC_WORDS.TVSERIES,
    STATIC_WORDS.SEASONS,
    STATIC_WORDS.EPISODES,
  ];

  rawData.forEach((data) => {
    if (docName === STATIC_WORDS.ACTORS) {
      if (data.image !== null && data.image !== "") {
        const imagePath = data.image.replace("tmdb_", "");
        const actor = `https://image.tmdb.org/t/p/w300/${imagePath}`;
        const actorRef = ref(storage, `actors/${imagePath}`);
        const blob = fromURL(actor, 80, 0, 0, "webp");
        actorBlobs.push(blob);
        actorRefs.push(actorRef);
      } else {
        actorRefs.push(Promise.resolve(null));
        actorBlobs.push(Promise.resolve(null));
      }
    }
    if (docName === STATIC_WORDS.DIRECTORS) {
      if (data.image !== null && data.image !== "") {
        const imagePath = data.image.replace("tmdb_", "");
        const director = `https://image.tmdb.org/t/p/w300/${imagePath}`;
        const directorRef = ref(storage, `directors/${imagePath}`);
        const blob = fromURL(director, 80, 0, 0, "webp");
        directorBlobs.push(blob);
        directorRefs.push(directorRef);
      } else {
        directorRefs.push(Promise.resolve(null));
        directorBlobs.push(Promise.resolve(null));
      }
    }
    if (validDocNames.includes(docName)) {
      if (data.poster && data.poster !== null && data.poster !== "") {
        const posterPath = data.poster.replace("poster_", "");
        const poster = `https://image.tmdb.org/t/p/original/${posterPath}`;
        const posterRef = ref(storage, `posters/${posterPath}`);

        const blob1 = fromURL(poster, 1, 0, 0, "webp");
        posterBlobs.push(blob1);
        posterRefs.push(posterRef);
      } else {
        posterRefs.push(Promise.resolve(null));
        posterBlobs.push(Promise.resolve(null));
      }

      if (data.thumbnail !== null && data.thumbnail !== "") {
        const thumbnailPath = data.thumbnail.replace("tmdb_", "");
        const thumnail = `https://image.tmdb.org/t/p/original/${thumbnailPath}`;
        const thumbnailRef = ref(storage, `thumbnail/${thumbnailPath}`);
        const blob2 = fromURL(thumnail, 1, 0, 0, "webp");
        thumbnailBlobs.push(blob2);
        thumbnailRefs.push(thumbnailRef);
      } else {
        thumbnailRefs.push(Promise.resolve(null));
        thumbnailBlobs.push(Promise.resolve(null));
      }
    }
  });

  let posterBlobPromise = [];
  let thumbnailBlobPromise = [];
  let actorBlobPromise = [];
  let directorBlobPromise = [];

  try {
    if (docName === STATIC_WORDS.ACTORS) {
      actorBlobPromise = await Promise.all(actorBlobs);
    }
    if (docName === STATIC_WORDS.DIRECTORS) {
      directorBlobPromise = await Promise.all(directorBlobs);
    }
    if (validDocNames.includes(docName)) {
      posterBlobPromise = await Promise.all(posterBlobs);
      thumbnailBlobPromise = await Promise.all(thumbnailBlobs);
    }
  } catch (err) {
    console.log(err);
  }

  const uploadPosters = [];
  const uploadThumbnails = [];
  const uploadActors = [];
  const uploadDirectors = [];

  for (let i = 0; i < rawData.length; i++) {
    if (docName === STATIC_WORDS.ACTORS) {
      if (actorBlobPromise[i] !== null) {
        const uploadActor = uploadBytesResumable(
          actorRefs[i],
          actorBlobPromise[i]
        );
        uploadActors.push(uploadActor);
      } else {
        uploadActors.push(Promise.resolve(null));
      }
    }
    if (docName === STATIC_WORDS.DIRECTORS) {
      if (directorBlobPromise[i] !== null) {
        const uploadDirector = uploadBytesResumable(
          directorRefs[i],
          directorBlobPromise[i]
        );
        uploadDirectors.push(uploadDirector);
      } else {
        uploadDirectors.push(Promise.resolve(null));
      }
    }
    if (validDocNames.includes(docName)) {
      if (posterBlobPromise[i] !== null) {
        const uploadPoster = uploadBytesResumable(
          posterRefs[i],
          posterBlobPromise[i]
        );
        uploadPosters.push(uploadPoster);
      } else {
        uploadPosters.push(Promise.resolve(null));
      }
      if (thumbnailBlobPromise[i] !== null) {
        const uploadThumbnail = uploadBytesResumable(
          thumbnailRefs[i],
          thumbnailBlobPromise[i]
        );
        uploadThumbnails.push(uploadThumbnail);
      } else {
        uploadThumbnails.push(Promise.resolve(null));
      }
    }
  }

  try {
    if (docName === STATIC_WORDS.ACTORS) {
      await Promise.all(uploadActors);
    }
    if (docName === STATIC_WORDS.DIRECTORS) {
      await Promise.all(uploadDirectors);
    }
    if (validDocNames.includes(docName)) {
      await Promise.all(uploadPosters);
      await Promise.all(uploadThumbnails);
    }
  } catch (err) {
    console.log(err);
  }

  const posterUrls = [];
  const thumbnailUrls = [];
  const actorUrls = [];
  const directorUrls = [];

  for (let i = 0; i < rawData.length; i++) {
    if (docName === STATIC_WORDS.ACTORS) {
      if (actorBlobPromise[i] !== null) {
        const actorUrl = getDownloadURL(actorRefs[i]);
        actorUrls.push(actorUrl);
      } else {
        actorUrls.push(Promise.resolve(null));
      }
    }
    if (docName === STATIC_WORDS.DIRECTORS) {
      if (directorBlobPromise[i] !== null) {
        const directorUrl = getDownloadURL(directorRefs[i]);
        directorUrls.push(directorUrl);
      } else {
        directorUrls.push(Promise.resolve(null));
      }
    }
    if (validDocNames.includes(docName)) {
      if (posterBlobPromise[i] !== null) {
        const posterUrl = getDownloadURL(posterRefs[i]);
        posterUrls.push(posterUrl);
      } else {
        posterUrls.push(Promise.resolve(null));
      }
      if (thumbnailBlobPromise[i] !== null) {
        const thumbnailUrl = getDownloadURL(thumbnailRefs[i]);
        thumbnailUrls.push(thumbnailUrl);
      } else {
        thumbnailUrls.push(Promise.resolve(null));
      }
    }
  }

  let posterUrlPromise = [];
  let thumbnailUrlPromise = [];
  let actorUrlPromise = [];
  let directorUrlPromise = [];
  let returnUrls = null;

  try {
    if (docName === STATIC_WORDS.ACTORS) {
      actorUrlPromise = await Promise.all(actorUrls);
      returnUrls = actorUrlPromise;
    }
    if (docName === STATIC_WORDS.DIRECTORS) {
      directorUrlPromise = await Promise.all(directorUrls);
      returnUrls = directorUrlPromise;
    }
    if (validDocNames.includes(docName)) {
      posterUrlPromise = await Promise.all(posterUrls);
      thumbnailUrlPromise = await Promise.all(thumbnailUrls);
      returnUrls = [posterUrlPromise, thumbnailUrlPromise];
    }
  } catch (err) {
    console.log(err);
  }
  return returnUrls;
};
