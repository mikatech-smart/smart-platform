import React from "react";
import ReactDOM from "react-dom/client";

import { BrandConfig } from "./config/brand";
import { applyGoogleSiteVerification } from "./utils/seo";
import "./index.css";

import Router from "./router";

document.title = BrandConfig.platformName;
applyGoogleSiteVerification();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
