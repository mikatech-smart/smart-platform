import React from "react";
import ReactDOM from "react-dom/client";

import { BrandConfig } from "./config/brand";
import { applyGoogleSiteVerification, applyRobotsMetadata } from "./utils/seo";
import "./index.css";

import Router from "./router";

document.title = BrandConfig.platformName;
applyGoogleSiteVerification();
applyRobotsMetadata(
  /^\/(admin|dashboard|login|painel)(\/|$)/.test(window.location.pathname)
    ? "noindex,nofollow"
    : "index,follow"
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
