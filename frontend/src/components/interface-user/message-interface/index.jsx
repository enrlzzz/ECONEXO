import "./index.css";
import "/src/variables.css";

import { Link } from "react-router-dom";
import { useState } from "react";
import HeaderInterface from "../header-interface";

import { CiSearch } from "react-icons/ci";

export default function MessageInterface() {
  return (
    <div className="messages-container">
      <HeaderInterface />

      <h2>Mensagens</h2>

      <div className="messages-layout">
        <div className="messages-sidebar">
          <div className="messages-search">
            <CiSearch />
            <input type="text" placeholder="Buscar conversas..." />
          </div>

          <div className="messages-list">{/* lista de conversas aqui */}</div>
        </div>

        <div className="messages-chat">
          <p>Selecione uma conversa para começar</p>
        </div>
      </div>
    </div>
  );
}
