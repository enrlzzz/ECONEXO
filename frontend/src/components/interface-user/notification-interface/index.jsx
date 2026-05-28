import "./index.css";
import "/src/variables.css";

import { IoIosNotificationsOutline } from "react-icons/io";
import HeaderInterface from "../header-interface";

export default function NotificationInterface() {
  return (
    <main className="notifications-container">
      <HeaderInterface />

      <h2>Notificações</h2>
      <div className="bar-process-notifications">
        <p>Todas(0)</p>
        <p>Não Lidas(0)</p>
      </div>
      <div className="notifications-list">
        {/* lista de notificações aqui */}
        <div className="notifications-item">
          <IoIosNotificationsOutline />
        </div>
        <p>Você não tem notificações</p>
      </div>
    </main>
  );
}
