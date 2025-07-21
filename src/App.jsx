import { Routes, Route } from "react-router-dom";
import Profile from "./components/Profile";
import ManageDomains from "./components/ManageDomains";

const Home = () => {
  return <div>home</div>;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage-domains" element={<ManageDomains />} />
      </Routes>
    </>
  );
}

export default App;
