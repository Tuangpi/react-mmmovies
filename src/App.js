import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/user/UserLists";
import Single from "./pages/single/Single";
import NewUser from "./pages/user/NewUser";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import Movies from "./pages/movie/Movies";
import NewMovie from "./pages/movie/NewMovie";
import Actors from "./pages/actor/Actors";
import Directors from "./pages/director/Directors";
import Genres from "./pages/genre/Genres";
import TvSeries from "./pages/tvseries/TvSeries";
import NewTvSeries from "./pages/tvseries/NewTvSeries";
import Menu from "./pages/menu/Menu";
import NewMenu from "./pages/menu/NewMenu";
import Package from "./pages/package/Package";
import NewPackage from "./pages/package/NewPackage";
import NewDirector from "./pages/director/NewDirector";
import NewActor from "./pages/actor/NewActor";
import NewGenre from "./pages/genre/NewGenre";
import SiteCustomization from "./pages/siteCustomization/SiteCustomization";
import SiteSetting from "./pages/siteSetting/SiteSetting";
import PlayerSetting from "./pages/playerSetting/PlayerSetting";
import PaymentGateWay from "./pages/paymentGateWay/PaymentGateWay";
import AppSetting from "./pages/appSetting/AppSetting";
import HelpAndSupport from "./pages/helpAndSupport/HelpAndSupport";
import NewSeason from "./pages/tvseries/seasons/NewSeason";
import NewEpisode from "./pages/tvseries/episodes/NewEpisode";
import EditMovie from "./pages/movie/EditMovie";
import EditTvSeries from "./pages/tvseries/EditTvSeries";

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
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
                    <Menu />
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
                    <Package />
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
                    <Movies />
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
                    <TvSeries />
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
                    <Actors />
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
                    <Directors />
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
                    <Genres />
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
      </BrowserRouter>
    </div>
  );
}

export default App;
