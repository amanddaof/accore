import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { MesProvider } from "./contextos/MesContexto";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MesProvider>
        <App />
      </MesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
