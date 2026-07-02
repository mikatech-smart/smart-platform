import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";

export default function MainLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          background: "#F8FAFC",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar />

        <div
          style={{
            padding: "40px",
            flex: 1,
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}