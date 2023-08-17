import Login from "./pages/login/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { userInputs } from "./formSource";
import { Suspense, lazy, useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import "./index.css";
import Loading from "react-loading";
import { motion } from 'framer-motion'

const SiteSetting = lazy(() => import('./pages/siteSetting/SiteSetting'));
const TvSeriesLists = lazy(() => import('./pages/tvseries/TvSeriesLists'));
const NewTvSeries = lazy(() => import('./pages/tvseries/NewTvSeries'));
const EditTvSeries = lazy(() => import('./pages/tvseries/EditTvSeries'));
const NewSeason = lazy(() => import('./pages/tvseries/seasons/NewSeason'));
const NewEpisode = lazy(() => import('./pages/tvseries/episodes/NewEpisode'));
const SiteCustomization = lazy(() => import('./pages/siteCustomization/SiteCustomization'));
const PlayerSetting = lazy(() => import('./pages/playerSetting/PlayerSetting'));
const PaymentGateWay = lazy(() => import('./pages/paymentGateWay/PaymentGateWay'));
const PackageLists = lazy(() => import('./pages/package/PackageLists'));
const NewPackage = lazy(() => import('./pages/package/NewPackage'));
const MovieLists = lazy(() => import("./pages/movie/MovieLists"));
const NewMovie = lazy(() => import('./pages/movie/NewMovie'));
const EditMovie = lazy(() => import('./pages/movie/EditMovie'));
const MenuLists = lazy(() => import('./pages/menu/MenuLists'));
const NewMenu = lazy(() => import('./pages/menu/NewMenu'));
const MediaManager = lazy(() => import('./pages/mediaManager/MediaManager'));
const Home = lazy(() => import('./pages/home/Home'));
const HelpAndSupport = lazy(() => import('./pages/helpAndSupport/HelpAndSupport'));
const GenreLists = lazy(() => import('./pages/genre/GenreLists'));
const NewGenre = lazy(() => import('./pages/genre/NewGenre'));
const DirectorLists = lazy(() => import('./pages/director/DirectorLists'));
const NewDirector = lazy(() => import('./pages/director/NewDirector'));
const AppSetting = lazy(() => import('./pages/appSetting/AppSetting'));
const ActorLists = lazy(() => import('./pages/actor/ActorLists'));
const NewActor = lazy(() => import('./pages/actor/NewActor'));

const List = lazy(() => import('./pages/user/UserLists'));
const Single = lazy(() => import('./pages/single/Single'));
const NewUser = lazy(() => import('./pages/user/NewUser'));

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <div className={currentUser ? 'tw-flex' : ''}>
          <div className="hide-scroll flex-1 tw-h-screen tw-overflow-y-auto tw-bg-slate-900">
            {currentUser ? <Sidebar /> : ''}
          </div>
          <div className={currentUser ? "hide-scroll tw-bg-slate-100 flex-6 tw-h-screen tw-overflow-y-auto" : ''}>
            {currentUser ? <Navbar /> : ''}
            <Suspense fallback={<motion.div initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeIn" }} className="tw-w-full tw-flex tw-justify-center tw-mt-56"><Loading Loading type="bars"
                color="#017BFE"
                height={"4%"}
                width={"4%"} /></motion.div>}>
              <Routes>
                <Route path="/">
                  <Route path="login" element={<Login />} />
                  <Route
                    index
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
                        <RequireAuth>
                          <List />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path=":userId"
                      element={
                        <RequireAuth>
                          <Single />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="new"
                      element={
                        <RequireAuth>
                          <NewUser inputs={userInputs} title="Add New User" />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="menu">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <MenuLists />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="new"
                      element={
                        <RequireAuth>
                          <NewMenu inputs={userInputs} title="Add New Menu" />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="packages">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <PackageLists />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="new"
                      element={
                        <RequireAuth>
                          <NewPackage inputs={userInputs} title="Add New Package" />
                        </RequireAuth>
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
                        <RequireAuth>
                          <NewMovie title="Add New Movie" />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path=":id/edit"
                      element={
                        <RequireAuth>
                          <EditMovie title="Edit Movie" />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="tvseries">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <TvSeriesLists />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="new"
                      element={
                        <RequireAuth>
                          <NewTvSeries title="Add New TV Series" />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path=":id/edit"
                      element={
                        <RequireAuth>
                          <EditTvSeries title="Edit TV Series" />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path=":id/season"
                      element={
                        <RequireAuth>
                          <NewSeason title="Add New Season" />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="season/:id/episode"
                      element={
                        <RequireAuth>
                          <NewEpisode title="Add New Episode" />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="actors">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <ActorLists />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="new"
                      element={
                        <RequireAuth>
                          <NewActor title="Add New Actor" />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="directors">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <DirectorLists />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="new"
                      element={
                        <RequireAuth>
                          <NewDirector title="Add New Director" />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="genres">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <GenreLists />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="new"
                      element={
                        <RequireAuth>
                          <NewGenre title="Add New Genre" />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="site-customization">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <SiteCustomization />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="site-setting">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <SiteSetting />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="player-setting">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <PlayerSetting />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="payment-gateway">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <PaymentGateWay />
                        </RequireAuth>
                      }
                    />
                  </Route>
                  <Route path="app-setting">
                    <Route
                      index
                      element={
                        <RequireAuth>
                          <AppSetting />
                        </RequireAuth>
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
                        <RequireAuth>
                          <HelpAndSupport />
                        </RequireAuth>
                      }
                    />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
