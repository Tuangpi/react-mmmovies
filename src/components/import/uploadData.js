import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../configs/firebase";

export const uploadData = async (data, docName) => {
  let cleanedData = [];
  let batchArray = [];
  const checkQuerySnapShot = await getDocs(collection(db, docName));

  if (checkQuerySnapShot.empty) {
    cleanedData.push(...data);
  } else {
    data.forEach(async (object) => {
      const checkValue = docName === "movies" ? object.tmdb_id : object.name;
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
                docName === "movies" ? "tmdb_id" : "name",
                "in",
                batchArray.slice(i - 20, i).map((result) => result.id)
              )
            );

            const querySnapshots = await Promise.all([getDocs(q)]);
            querySnapshots.forEach((querySnap) => {
              querySnap.forEach((q) => {
                if (docName === "movies") {
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
              docName === "movies" ? "tmdb_id" : "name",
              "in",
              lastBatchArray.map((result) => result.id)
            )
          );

          tmpArrForCheck.length = 0;
          const querySnapshots = await Promise.all([getDocs(q)]);
          querySnapshots.forEach((querySnap) => {
            querySnap.forEach((q) => {
              if (docName === "movies") {
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
