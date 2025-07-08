import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import MapSearch from "./pages/MapSearch";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map-search" element={<MapSearch />} />
        <Route path="/profiles" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default App;
