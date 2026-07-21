import React from "react";
import ReactDOM from "react-dom/client";

import { BrandConfig } from "./config/brand";
import {
  applyGoogleSiteVerification,
  applyPerformanceResourceHints,
  applyRobotsMetadata,
} from "./utils/seo";
import "./index.css";

import Router from "./router";
import { AuthProvider } from "./auth/AuthContext";

document.title = BrandConfig.platformName;
applyPerformanceResourceHints();
applyGoogleSiteVerification();
applyRobotsMetadata(
  /^\/(admin|dashboard|login|painel|pdv)(\/|$)/.test(window.location.pathname)
    ? "noindex,nofollow"
    : "index,follow"
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </React.StrictMode>
);
