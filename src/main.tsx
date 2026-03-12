import React from "react";
import ReactDOM from "react-dom/client";

import { setupIonicReact } from "@ionic/react";

import "@/app/styles/typography.css";
import "@/app/styles/global.css";

import App from "./App";

setupIonicReact();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
