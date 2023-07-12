import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, storage } from "../../configs/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { fromURL } from "image-resize-compress";
import { STATIC_WORDS } from "../../assets/STATICWORDS";

export const uploadData = async (rawData, docName) => {
  const data = await modifiedData(rawData, docName);
  console.log(data);
  let cleanedData = [];
  let batchArray = [];
  const checkQuerySnapShot = await getDocs(collection(db, docName));

  if (checkQuerySnapShot.empty) {
    cleanedData.push(...data);
  } else {
    data.forEach(async (object) => {
      const checkValue =
        docName === STATIC_WORDS.MOVIES ? object.tmdb_id : object.name;
      if (checkValue !== "" && checkValue !== null) {
        batchArray.push({ id: checkValue, data: object });
      } else {
        cleanedData.push(object);
      }
    });

    let lastBatchArray = [];

    if (batchArray.length > 0) {
      let tmpArrForCheck = [];
      for (let i = 0; i < batchArray.length; i++) {
        if (i % 20 === 0) {
          lastBatchArray = [];
          if (i === 0) continue;
          try {
            const q = query(
              collection(db, docName),
              where(
                docName === STATIC_WORDS.MOVIES ? "tmdb_id" : "name",
                "in",
                batchArray.slice(i - 20, i).map((result) => result.id)
              )
            );

            const querySnapshots = await Promise.all([getDocs(q)]);
            querySnapshots.forEach((querySnap) => {
              querySnap.forEach((q) => {
                if (docName === STATIC_WORDS.MOVIES) {
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
              docName === STATIC_WORDS.MOVIES ? "tmdb_id" : "name",
              "in",
              lastBatchArray.map((result) => result.id)
            )
          );

          tmpArrForCheck.length = 0;
          const querySnapshots = await Promise.all([getDocs(q)]);
          querySnapshots.forEach((querySnap) => {
            querySnap.forEach((q) => {
              if (docName === STATIC_WORDS.MOVIES) {
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
  if (docName === STATIC_WORDS.ACTORS) {
    const actorUrlPromise = await fetchRelatedImage(rawData, docName);
    for (let i = 0; i < rawData.length; i++) {
      rawData[i].image = actorUrlPromise[i];
    }
  }
  if (docName === STATIC_WORDS.MOVIES) {
    const [posterUrlPromise, thumbnailUrlPromise] = await fetchRelatedImage(
      rawData,
      docName
    );
    for (let i = 0; i < rawData.length; i++) {
      rawData[i].thumbnail = thumbnailUrlPromise[i];
      rawData[i].poster = posterUrlPromise[i];
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
  console.log(docName);
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
    if (docName === STATIC_WORDS.MOVIES) {
      if (data.poster !== null && data.poster !== "") {
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
  try {
    if (docName === STATIC_WORDS.ACTORS) {
      actorBlobPromise = await Promise.all(actorBlobs);
      console.log(actorBlobPromise);
    }
    if (docName === STATIC_WORDS.MOVIES) {
      posterBlobPromise = await Promise.all(posterBlobs);
      thumbnailBlobPromise = await Promise.all(thumbnailBlobs);
    }
  } catch (err) {
    console.log(err);
  }

  const uploadPosters = [];
  const uploadThumbnails = [];
  const uploadActors = [];

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
    if (docName === STATIC_WORDS.MOVIES) {
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
    if (docName === STATIC_WORDS.MOVIES) {
      await Promise.all(uploadPosters);
      await Promise.all(uploadThumbnails);
    }
  } catch (err) {
    console.log(err);
  }

  const posterUrls = [];
  const thumbnailUrls = [];
  const actorUrls = [];

  for (let i = 0; i < rawData.length; i++) {
    if (docName === STATIC_WORDS.ACTORS) {
      if (actorBlobPromise[i] !== null) {
        const actorUrl = getDownloadURL(actorRefs[i]);
        actorUrls.push(actorUrl);
      } else {
        actorUrls.push(Promise.resolve(null));
      }
    }
    if (docName === STATIC_WORDS.MOVIES) {
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
  let returnUrls = null;

  try {
    if (docName === STATIC_WORDS.ACTORS) {
      actorUrlPromise = await Promise.all(actorUrls);
      returnUrls = actorUrlPromise;
    }
    if (docName === STATIC_WORDS.MOVIES) {
      posterUrlPromise = await Promise.all(posterUrls);
      thumbnailUrlPromise = await Promise.all(thumbnailUrls);
      returnUrls = [posterUrlPromise, thumbnailUrlPromise];
    }
  } catch (err) {
    console.log(err);
  }
  return returnUrls;
};
