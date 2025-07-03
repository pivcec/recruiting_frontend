// import { Buffer } from "buffer";
// window.Buffer = Buffer;
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import process from "process";
window.process = process;

// import { StrictMode } from "react";
import "./index.css";
import App from "./App.jsx";

(async () => {
  if (typeof window.Buffer === "undefined") {
    const { Buffer } = await import("buffer");
    window.Buffer = Buffer;
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
