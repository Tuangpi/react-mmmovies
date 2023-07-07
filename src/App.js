import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import Movies from "./pages/Movies";
import NewMovie from "./pages/new/NewMovie";
import Actors from "./pages/Actors";
import Directors from "./pages/Directors";
import Genres from "./pages/Genres";
import TvSeries from "./pages/TvSeries";
import NewTvSeries from "./pages/new/NewTvSeries";

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
                    <New inputs={userInputs} title="Add New User" />
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
                path=":productId"
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
                    <NewMovie />
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
                    <NewTvSeries />
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
