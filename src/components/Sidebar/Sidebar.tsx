import { NavLink } from "react-router-dom";

import { BrandConfig } from "../../config/brand";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <h2>{BrandConfig.platformName}</h2>

      <nav>

        <NavLink to="/">🏠 Visão Geral</NavLink>

        <NavLink to="/clientes">👥 Clientes</NavLink>

        <NavLink to="/nfc">📱 NFC</NavLink>

        <NavLink to="/wifi">📶 Wi-Fi</NavLink>

        <NavLink to="/whatsapp">💬 WhatsApp</NavLink>

        <NavLink to="/reviews">⭐ Reviews</NavLink>

        <NavLink to="/configuracoes">⚙ Configurações</NavLink>

      </nav>

    </aside>
  );
}
