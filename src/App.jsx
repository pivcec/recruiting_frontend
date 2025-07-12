import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import MapSearch from "./pages/MapSearch";
import ProfilePage from "./pages/ProfilePage";
import SearchByCert from "./components/SearchByCert";

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map-search" element={<MapSearch />} />
        <Route path="/profiles" element={<ProfilePage />} />
        <Route path="/search-by-cert" element={<SearchByCert />} />
      </Routes>
    </>
  );
}

export default App;
