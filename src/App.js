import Login from "./pages/login/Login";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import "./index.css";
import Loading from "react-loading";
import { motion } from "framer-motion";
import Register from "./pages/login/Register";
import { NotFound } from "./pages/notFound/NotFound";
import { UserAuth } from "./context/AuthContext";

const SiteSetting = lazy(() => import("./pages/siteSetting/SiteSetting"));
const TvSeriesLists = lazy(() => import("./pages/tvseries/TvSeriesLists"));
const NewTvSeries = lazy(() => import("./pages/tvseries/NewTvSeries"));
const EditTvSeries = lazy(() => import("./pages/tvseries/EditTvSeries"));
const NewSeason = lazy(() => import("./pages/tvseries/seasons/NewSeason"));
const NewEpisode = lazy(() => import("./pages/tvseries/episodes/NewEpisode"));
const SiteCustomization = lazy(() =>
  import("./pages/siteCustomization/SiteCustomization")
);
const PlayerSetting = lazy(() => import("./pages/playerSetting/PlayerSetting"));
const PaymentGateWay = lazy(() =>
  import("./pages/paymentGateWay/PaymentGateWay")
);
const PackageLists = lazy(() => import("./pages/package/PackageLists"));
const NewPackage = lazy(() => import("./pages/package/NewPackage"));
const MovieLists = lazy(() => import("./pages/movie/MovieLists"));
const NewMovie = lazy(() => import("./pages/movie/NewMovie"));
const EditMovie = lazy(() => import("./pages/movie/EditMovie"));
const MenuLists = lazy(() => import("./pages/menu/MenuLists"));
const NewMenu = lazy(() => import("./pages/menu/NewMenu"));
const MediaManager = lazy(() => import("./pages/mediaManager/MediaManager"));
const Home = lazy(() => import("./pages/home/Home"));
const HelpAndSupport = lazy(() =>
  import("./pages/helpAndSupport/HelpAndSupport")
);
const GenreLists = lazy(() => import("./pages/genre/GenreLists"));
const NewGenre = lazy(() => import("./pages/genre/NewGenre"));
const DirectorLists = lazy(() => import("./pages/director/DirectorLists"));
const NewDirector = lazy(() => import("./pages/director/NewDirector"));
const AppSetting = lazy(() => import("./pages/appSetting/AppSetting"));
const ActorLists = lazy(() => import("./pages/actor/ActorLists"));
const NewActor = lazy(() => import("./pages/actor/NewActor"));

const UserLists = lazy(() => import("./pages/user/UserLists"));
const Single = lazy(() => import("./pages/user/Single"));
const NewUser = lazy(() => import("./pages/user/NewUser"));

function App() {
  const { user } = UserAuth();

  console.log(user);
  const RequireAuth = ({ children }) => {
    return user === null ? <Navigate to="/" /> : children;
  };

  const RequireAuthAndAdmin = ({ children }) => {
    return user === null ? (
      <Navigate to="/" />
    ) : user.role === "admin" ? (
      children
    ) : (
      <Navigate to="/dashboard" />
    );
  };

  const RequireAuthEditor = ({ children }) => {
    return user === null ? (
      <Navigate to="/" />
    ) : user.role === "editor" || user.role === 'admin' ? (
      children
    ) : (
      <Navigate to="/dashboard" />
    );
  };

  const GotoDashboard = ({ children }) => {
    return user === null ? children : <Navigate to="/dashboard" />;
  };

  return (
    <div className="app">
      <div className={user === null ? "" : "tw-flex"}>
        <div
          className={
            user === null
              ? ""
              : "hide-scroll flex-1 tw-h-screen tw-overflow-y-auto tw-bg-slate-900"
          }
        >
          {user === null ? "" : <Sidebar />}
        </div>
        <div
          className={
            user === null
              ? ""
              : "hide-scroll tw-bg-slate-100 flex-6 tw-h-screen tw-overflow-y-auto"
          }
        >
          {user === null ? "" : <Navbar />}
          <Suspense
            fallback={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeIn" }}
                className="tw-w-full tw-flex tw-justify-center tw-mt-56"
              >
                <Loading
                  type="spokes"
                  color="#017BFE"
                  height={"4%"}
                  width={"4%"}
                />
              </motion.div>
            }
          >
            <Routes>
              <Route path="/">
                <Route
                  index
                  element={
                    <GotoDashboard>
                      <Login />
                    </GotoDashboard>
                  }
                />
                <Route
                  path="register"
                  element={
                    <GotoDashboard>
                      <Register />
                    </GotoDashboard>
                  }
                />

                <Route
                  path="dashboard"
                  element={
                    <RequireAuth>
                      <Home />
                    </RequireAuth>
                  }
                />
                <Route path="users">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <UserLists />
                      </RequireAuthAndAdmin>
                    }
                  />
                  <Route
                    path=":userId"
                    element={
                      <RequireAuthAndAdmin>
                        <Single />
                      </RequireAuthAndAdmin>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthAndAdmin>
                        <NewUser title="Add New User" />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="menu">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <MenuLists />
                      </RequireAuthAndAdmin>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthAndAdmin>
                        <NewMenu title="Add New Menu" />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="packages">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <PackageLists />
                      </RequireAuthAndAdmin>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthAndAdmin>
                        <NewPackage title="Add New Package" />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="movies">
                  <Route
                    index
                    element={
                      <RequireAuth>
                        <MovieLists />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthEditor>
                        <NewMovie title="Add New Movie" />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <RequireAuthEditor>
                        <EditMovie title="Edit Movie" />
                      </RequireAuthEditor>
                    }
                  />
                </Route>
                <Route path="tvseries">
                  <Route
                    index
                    element={
                      <RequireAuthEditor>
                        <TvSeriesLists />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthEditor>
                        <NewTvSeries title="Add New TV Series" />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <RequireAuthEditor>
                        <EditTvSeries title="Edit TV Series" />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path=":id/season"
                    element={
                      <RequireAuthEditor>
                        <NewSeason title="Add New Season" />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path="season/:id/episode"
                    element={
                      <RequireAuthEditor>
                        <NewEpisode title="Add New Episode" />
                      </RequireAuthEditor>
                    }
                  />
                </Route>
                <Route path="actors">
                  <Route
                    index
                    element={
                      <RequireAuthEditor>
                        <ActorLists />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthEditor>
                        <NewActor title="Add New Actor" />
                      </RequireAuthEditor>
                    }
                  />
                </Route>
                <Route path="directors">
                  <Route
                    index
                    element={
                      <RequireAuthEditor>
                        <DirectorLists />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthEditor>
                        <NewDirector title="Add New Director" />
                      </RequireAuthEditor>
                    }
                  />
                </Route>
                <Route path="genres">
                  <Route
                    index
                    element={
                      <RequireAuthEditor>
                        <GenreLists />
                      </RequireAuthEditor>
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <RequireAuthEditor>
                        <NewGenre title="Add New Genre" />
                      </RequireAuthEditor>
                    }
                  />
                </Route>
                <Route path="site-customization">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <SiteCustomization />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="site-setting">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <SiteSetting />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="player-setting">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <PlayerSetting />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="payment-gateway">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <PaymentGateWay />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="app-setting">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <AppSetting />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
                <Route path="media-manager">
                  <Route
                    index
                    element={
                      <RequireAuth>
                        <MediaManager />
                      </RequireAuth>
                    }
                  />
                </Route>
                <Route path="help-and-support">
                  <Route
                    index
                    element={
                      <RequireAuthAndAdmin>
                        <HelpAndSupport />
                      </RequireAuthAndAdmin>
                    }
                  />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
