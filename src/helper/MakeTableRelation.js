import {
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import { STATIC_WORDS } from "../assets/STATIC_WORDS";
import { areDocumentsNotEmpty } from "./Helpers";

export const MakeTableRelation = async (docName) => {
  if (await areDocumentsNotEmpty()) {
    if (await getUnRelatedIds() === null) {
      return "Movies Connected with Actors, Director and Genres";
    } else {
      const [
        actors,
        directors,
        genres,
        tvGenres,
        seasons,
        seasonActors,
        episodes,
        movielink,
        episodelink,
      ] = await getUnRelatedIds();

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

        case STATIC_WORDS.VIDEO_LINKS:
          const readyMovielink = await modifiedArray(
            movielink,
            STATIC_WORDS.MOVIES
          );
          console.log(readyMovielink);
          await updateVideoLinkDoc(readyMovielink);
          const readyEpisodelink = await modifiedArray(
            episodelink,
            STATIC_WORDS.EPISODES
          );
          console.log(readyEpisodelink);
          await updateVideoLinkDoc(readyEpisodelink);
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
          const readyMovielink1 = await modifiedArray(
            movielink,
            STATIC_WORDS.MOVIES
          );
          console.log(readyMovielink1);
          await updateVideoLinkDoc(readyMovielink1);
          const readyEpisodelink1 = await modifiedArray(
            episodelink,
            STATIC_WORDS.EPISODES
          );
          console.log(readyEpisodelink1);
          await updateVideoLinkDoc(readyEpisodelink1);
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

          const readyMovielink2 = await modifiedArray(
            movielink,
            STATIC_WORDS.MOVIES
          );
          console.log(readyMovielink2);
          await updateVideoLinkDoc(readyMovielink2);
          const readyEpisodelink2 = await modifiedArray(
            episodelink,
            STATIC_WORDS.EPISODES
          );
          console.log(readyEpisodelink2);
          await updateVideoLinkDoc(readyEpisodelink2);
          break;
      }
      return "Connected Movies Relations";
    }
  }
  return "Some of Documents Empty";
};

const updateVideoLinkDoc = async (readyForUpdateData) => {
  const updates = [];
  if (readyForUpdateData && readyForUpdateData.length > 0) {
    readyForUpdateData.forEach((data) => {
      const docRef = doc(db, STATIC_WORDS.VIDEO_LINKS, data.docId);
      if (data.ref) {
        if (data.movieId) {
          const update = updateDoc(docRef, {
            movieId: data.ref,
            movie_id: deleteField(),
          });
          updates.push(update);
        } else if (data.episodeId) {
          const update = updateDoc(docRef, {
            episodeId: data.ref,
            episode_id: deleteField(),
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
            genre_id: deleteField(),
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.SEASONS) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            tvSeriesId: data.ref,
            tv_series_id: deleteField(),
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.ACTORS) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            actorsId: data.ref,
            actor_id: deleteField(),
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.EPISODES) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            seasonsId: data.ref,
            season_id: deleteField(),
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
            actorsId: data.ref,
            actor_id: deleteField(),
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.DIRECTORS) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            directorsId: data.ref,
            director_id: deleteField(),
          });
          updates.push(update);
        }
      }
      if (docName === STATIC_WORDS.GENRES) {
        if (data.ref) {
          const update = updateDoc(docRef, {
            genreId: data.ref,
            genere_id: deleteField(),
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
    case STATIC_WORDS.MOVIES:
      ids = Array.from(new Set(ars.map((ar) => ar.movieId)));
      break;
    case STATIC_WORDS.EPISODES:
      ids = Array.from(new Set(ars.map((ar) => ar.episodeId)));
      break;
    default:
      break;
  }
  let id = "";

  if (docName === STATIC_WORDS.ACTORS) id = "actor_id";
  if (docName === STATIC_WORDS.DIRECTORS) id = "director_id";
  if (docName === STATIC_WORDS.TVSERIES) id = "tvseries_id";
  if (docName === STATIC_WORDS.SEASONS) id = "season_id";
  if (docName === STATIC_WORDS.GENRES) id = "genre_id";
  if (docName === STATIC_WORDS.MOVIES) id = 'movie_id';
  if (docName === STATIC_WORDS.EPISODES) id = 'episode_id';

  if (ids && ids.length > 0) {
    let lastBatchArray = [];
    for (let i = 0; i < ids.length; i++) {
      if (i % 20 === 0 && i !== 0) {
        lastBatchArray = [];
        const q = query(
          collection(db, docName),
          where(id, "in", ids.slice(i - 20, i))
        );
        const querySnapShot = await getDocs(q);
        console.log(querySnapShot);
        if (!querySnapShot.empty) {
          querySnapShot.docs.forEach((doc) => {
            ars.forEach((ar) => {
              if (docName === STATIC_WORDS.ACTORS) {
                if (ar.actorId) {
                  ar.actorId.forEach((id) => {
                    if (id === doc.data().actor_id)
                      ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
                  });
                }
              }
              if (docName === STATIC_WORDS.DIRECTORS) {
                if (ar.directorId) {
                  ar.directorId.forEach((id) => {
                    if (id === doc.data().director_id)
                      ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
                  });
                }
              }
              if (docName === STATIC_WORDS.GENRES) {
                if (ar.genreId) {
                  ar.genreId.forEach((id) => {
                    if (id === doc.data().genre_id)
                      ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
                  });
                }
              }
              if (docName === STATIC_WORDS.TVSERIES) {
                if (ar.tvSeriesId) {
                  if (ar.tvSeriesId === doc.data().tvseries_id) ar.ref = doc.id;
                }
              }
              if (docName === STATIC_WORDS.SEASONS) {
                if (ar.seasonsId) {
                  if (ar.seasonsId === doc.data().season_id) ar.ref = doc.id;
                }
              }
              if (docName === STATIC_WORDS.EPISODES) {
                if (ar.episodeId) {
                  if (ar.episodeId === doc.data().episode_id) ar.ref = doc.ref;
                }
              }
              if (docName === STATIC_WORDS.MOVIES) {
                if (ar.movieId) {
                  if (ar.movieId === doc.data().movie_id) ar.ref = doc.ref;
                }
              }
            });
          });
        }
      }
      lastBatchArray.push(ids[i]);
    }
    if (lastBatchArray.length > 0) {
      const q = query(collection(db, docName), where(id, "in", lastBatchArray));

      const querySnapShot = await getDocs(q);
      if (!querySnapShot.empty) {
        querySnapShot.docs.forEach((doc) => {
          ars.forEach((ar) => {
            if (docName === STATIC_WORDS.ACTORS) {
              if (ar.actorId) {
                ar.actorId.forEach((id) => {
                  if (id === doc.data().actor_id)
                    ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
                });
              }
            }
            if (docName === STATIC_WORDS.DIRECTORS) {
              if (ar.directorId) {
                ar.directorId.forEach((id) => {
                  if (id === doc.data().director_id)
                    ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
                });
              }
            }
            if (docName === STATIC_WORDS.GENRES) {
              if (ar.genreId) {
                ar.genreId.forEach((id) => {
                  if (id === doc.data().genre_id)
                    ar.ref ? ar.ref.push(doc.ref) : (ar.ref = [doc.ref]);
                });
              }
            }
            if (docName === STATIC_WORDS.TVSERIES) {
              if (ar.tvSeriesId) {
                if (ar.tvSeriesId === doc.data().tvseries_id) ar.ref = doc.id;
              }
            }
            if (docName === STATIC_WORDS.SEASONS) {
              if (ar.seasonsId) {
                if (ar.seasonsId === doc.data().season_id) ar.ref = doc.id;
              }
            }
            if (docName === STATIC_WORDS.EPISODES) {
              if (ar.episodeId) {
                if (ar.episodeId === doc.data().episode_id) ar.ref = doc.ref;
              }
            }
            if (docName === STATIC_WORDS.MOVIES) {
              if (ar.movieId) {
                if (ar.movieId === doc.data().movie_id) ar.ref = doc.ref;
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
  const videolinksSnapshot = await getDocs(
    collection(db, STATIC_WORDS.VIDEO_LINKS)
  );

  let actors = [];
  let directors = [];
  let genres = [];
  let tvGenres = [];
  let seasons = [];
  let seasonActors = [];
  let episodes = [];
  let movielink = [];
  let episodelink = [];

  movieQuerySnapshot.docs.forEach((doc) => {
    if (doc.data().actor_id && !isTableConnected(doc.data().actor_id))
      actors.push({
        docId: doc.id,
        actorId: convertToArray(modifiedId(doc.data().actor_id)),
      });
    if (doc.data().director_id && !isTableConnected(doc.data().director_id))
      directors.push({
        docId: doc.id,
        directorId: convertToArray(modifiedId(doc.data().director_id)),
      });
    if (doc.data().genre_id && !isTableConnected(doc.data().genre_id))
      genres.push({
        docId: doc.id,
        genreId: convertToArray(modifiedId(doc.data().genre_id)),
      });
  });

  tvQuerySnapshot.docs.forEach((doc) => {
    if (doc.data().genre_id && !isTableConnected(doc.data().genre_id))
      tvGenres.push({
        docId: doc.id,
        genreId: convertToArray(modifiedId(doc.data().genre_id)),
      });
  });
  seasonQuerySnapshot.docs.forEach((doc) => {
    if (doc.data().tv_series_id && !isTableConnected(doc.data().tv_series_id))
      seasons.push({
        docId: doc.id,
        tvSeriesId: doc.data().tv_series_id,
      });
    if (doc.data().actor_id && !isTableConnected(doc.data().actor_id))
      seasonActors.push({
        docId: doc.id,
        actorId: convertToArray(modifiedId(doc.data().actor_id)),
      });
  });

  episodeQuerySnapshot.docs.forEach((doc) => {
    if (doc.data().seasons_id && !isTableConnected(doc.data().seasons_id))
      episodes.push({
        docId: doc.id,
        seasonsId: doc.data().seasons_id,
      });
  });

  videolinksSnapshot.docs.forEach((doc) => {
    if (doc.data().movie_id && !isTableConnected(doc.data().movie_id))
      movielink.push({
        docId: doc.id,
        movieId: doc.data().movie_id,
      });
    if (doc.data().episode_id && !isTableConnected(doc.data().episode_id))
      episodelink.push({
        docId: doc.id,
        episodeId: doc.data().episode_id,
      });
  });

  if (
    [
      actors,
      directors,
      genres,
      tvGenres,
      seasons,
      seasonActors,
      episodes,
      movielink,
      episodelink
    ].every((array) => array.length === 0)
  ) {
    return null;
  } else {
    return [
      actors,
      directors,
      genres,
      tvGenres,
      seasons,
      seasonActors,
      episodes,
      movielink,
      episodelink,
    ];
  }

};

const isTableConnected = (id) => {
  if (id && id.includes("/")) return true;
  return false;
};

const modifiedId = (id) => {
  if (id && id.includes("+")) id = id.split("E+")[0].replace(".", "");
  if (id && !id.includes(",")) {
    if (id.length > 6) id = parseInt(id).toLocaleString();
  }
  return id;
};

const convertToArray = (id) => {
  const ids = [];
  if (id && id.includes(",")) {
    const i = id.split(",");
    ids.push(...i);
  } else {
    if (id && !id.includes("/")) ids.push(id);
  }
  return ids;
};
