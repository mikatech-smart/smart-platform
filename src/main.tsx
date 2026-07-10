import React from "react";
import ReactDOM from "react-dom/client";

import { BrandConfig } from "./config/brand";
import "./index.css";

import Router from "./router";

document.title = BrandConfig.platformName;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
