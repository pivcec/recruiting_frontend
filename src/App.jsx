import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Profile from "./components/Profile";
import ManageDomains from "./components/ManageDomains";
import DomainProfiles from "./components/DomainProfiles";

const Home = () => {
  return <div>home</div>;
};

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage-domains" element={<ManageDomains />} />
        <Route
          path="/domain/:domainId/exams/:examIds/profiles"
          element={<DomainProfiles />}
        />
      </Routes>
    </>
  );
}

export default App;
