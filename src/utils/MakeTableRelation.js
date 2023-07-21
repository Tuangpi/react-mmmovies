import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import { STATIC_WORDS } from "../assets/STATIC_WORDS";
import { areDocumentsNotEmpty } from "../helper/Helpers";

export const MakeTableRelation = async (docName) => {
  if (await areDocumentsNotEmpty()) {
    const [
      actors,
      directors,
      genres,
      tvGenres,
      seasons,
      seasonActors,
      episodes,
    ] = await getUnRelatedIds();
    if (
      [
        actors,
        directors,
        genres,
        tvGenres,
        seasons,
        seasonActors,
        episodes,
      ].every((array) => array.length === 0)
    )
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

      case STATIC_WORDS.EPISODES:
        const readyEpisodes = await modifiedArray(
          episodes,
          STATIC_WORDS.SEASONS
        );
        console.log(readyEpisodes);
        await updateTVSeriesDoc(readyEpisodes, docName);
        break;

      case STATIC_WORDS.SEASONS:
        const readySeasons = await modifiedArray(
          seasons,
          STATIC_WORDS.TVSERIES
        );
        console.log(readySeasons);
        await updateTVSeriesDoc(readySeasons, docName);

        const readyActorsSeason = await modifiedArray(
          seasonActors,
          STATIC_WORDS.ACTORS
        );
        console.log(readyActorsSeason);
        await updateTVSeriesDoc(readyActorsSeason, STATIC_WORDS.ACTORS);

        const readyEpisode = await modifiedArray(episodes, docName);
        console.log(readyEpisode);
        await updateTVSeriesDoc(readyEpisode, STATIC_WORDS.EPISODES);
        break;

      case STATIC_WORDS.TVSERIES:
        const readyGenreTV = await modifiedArray(tvGenres, STATIC_WORDS.GENRES);
        console.log(readyGenreTV);
        await updateTVSeriesDoc(readyGenreTV, docName);
        const readySeason = await modifiedArray(seasons, docName);
        console.log(readySeason);
        await updateTVSeriesDoc(readySeason, STATIC_WORDS.SEASONS);

        const readyActorsSeasons = await modifiedArray(
          seasonActors,
          STATIC_WORDS.ACTORS
        );
        console.log(readyActorsSeasons);
        await updateTVSeriesDoc(readyActorsSeasons, STATIC_WORDS.ACTORS);

        const readyEpisodess = await modifiedArray(
          episodes,
          STATIC_WORDS.SEASONS
        );
        console.log(readyEpisodess);
        await updateTVSeriesDoc(readyEpisodess, STATIC_WORDS.EPISODES);
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
  }
  return "Document Empty";
};

const updateTVSeriesDoc = async (readyForUpdateData, docName) => {
  const updates = [];
  if (readyForUpdateData && readyForUpdateData.length > 0) {
    readyForUpdateData.forEach((data) => {
      let docRef = doc(db, docName, data.docId);
      if (docName === STATIC_WORDS.ACTORS)
        docRef = doc(db, STATIC_WORDS.SEASONS, data.docId);

      if (docName === STATIC_WORDS.TVSERIES) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            genreId: data.ref,
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.SEASONS) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            tvSeriesId: data.ref,
          });
          console.log(data.ref);
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.ACTORS) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            actorId: data.ref,
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.EPISODES) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            seasonsId: data.ref,
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
  let ids = null;
  switch (docName) {
    case STATIC_WORDS.ACTORS:
      ids = Array.from(new Set(ars.map((ar) => ar.actorId).flat()));
      break;
    case STATIC_WORDS.DIRECTORS:
      ids = Array.from(new Set(ars.map((ar) => ar.directorId).flat()));
      break;
    case STATIC_WORDS.GENRES:
      ids = Array.from(new Set(ars.map((ar) => ar.genreId).flat()));
      break;
    case STATIC_WORDS.TVSERIES:
      ids = Array.from(new Set(ars.map((ar) => ar.tvSeriesId)));
      break;
    case STATIC_WORDS.SEASONS:
      ids = Array.from(new Set(ars.map((ar) => ar.seasonsId)));
      break;
    default:
      break;
  }

  if (ids && ids.length > 0) {
    let lastBatchArray = [];
    for (let i = 0; i < ids.length; i++) {
      if (i % 20 === 0 && i !== 0) {
        lastBatchArray = [];
        const q = query(
          collection(db, docName),
          where("id", "in", ids.slice(i - 20, i))
        );
        const querySnapShot = await getDocs(q);
        if (!querySnapShot.empty) {
          querySnapShot.docs.forEach((doc) => {
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
              if (docName === STATIC_WORDS.TVSERIES) {
                if (ar.tvSeriesId) {
                  console.log(doc.id, doc.ref.path, doc.ref.id);
                  if (ar.tvSeriesId === doc.data().id) ar.ref = doc.id;
                }
              }
              if (docName === STATIC_WORDS.SEASONS) {
                if (ar.seasonsId) {
                  if (ar.seasonsId === doc.data().id) ar.ref = doc.id;
                }
              }
            });
          });
        }
      }
      lastBatchArray.push(ids[i]);
    }
    if (lastBatchArray.length > 0) {
      const q = query(
        collection(db, docName),
        where("id", "in", lastBatchArray)
      );
      const querySnapShot = await getDocs(q);
      if (!querySnapShot.empty) {
        querySnapShot.docs.forEach((doc) => {
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
            if (docName === STATIC_WORDS.TVSERIES) {
              if (ar.tvSeriesId) {
                if (ar.tvSeriesId === doc.data().id) ar.ref = doc.id;
              }
            }
            if (docName === STATIC_WORDS.SEASONS) {
              if (ar.seasonsId) {
                if (ar.seasonsId === doc.data().id) ar.ref = doc.id;
              }
            }
          });
        });
      }
    }
  }
  return ars;
};

const getUnRelatedIds = async () => {
  const movieQuerySnapshot = await getDocs(collection(db, STATIC_WORDS.MOVIES));
  const tvQuerySnapshot = await getDocs(collection(db, STATIC_WORDS.TVSERIES));
  const seasonQuerySnapshot = await getDocs(
    collection(db, STATIC_WORDS.SEASONS)
  );
  const episodeQuerySnapshot = await getDocs(
    collection(db, STATIC_WORDS.EPISODES)
  );

  let actors = [];
  let directors = [];
  let genres = [];
  let tvGenres = [];
  let seasons = [];
  let seasonActors = [];
  let episodes = [];

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

  tvQuerySnapshot.docs.forEach((doc) => {
    if (!isTableConnected(doc.data().genre_id))
      tvGenres.push({
        docId: doc.id,
        genreId: convertToArray(modifiedId(doc.data().genre_id)),
      });
  });
  seasonQuerySnapshot.docs.forEach((doc) => {
    if (!isTableConnected(doc.data().tv_series_id))
      seasons.push({
        docId: doc.id,
        tvSeriesId: doc.data().tv_series_id,
      });
    if (!isTableConnected(doc.data().actor_id))
      seasonActors.push({
        docId: doc.id,
        actorId: convertToArray(modifiedId(doc.data().actor_id)),
      });
  });

  episodeQuerySnapshot.docs.forEach((doc) => {
    if (!isTableConnected(doc.data().seasons_id))
      episodes.push({
        docId: doc.id,
        seasonsId: doc.data().seasons_id,
      });
  });
  return [actors, directors, genres, tvGenres, seasons, seasonActors, episodes];
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
