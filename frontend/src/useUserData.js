import { useState, useEffect } from "react";
import { getUser } from "./userSession";

export function useUserData() {
  const [userData, setUserData] = useState(() => readSafe());

  useEffect(() => {
    // "storage" só dispara em OUTRAS abas. Sem o evento próprio abaixo,
    // salvar o perfil não atualizava o nome no header da mesma aba até o F5.
    const onStorage = () => setUserData(readSafe());
    window.addEventListener("storage", onStorage);
    window.addEventListener("econexo:sessao", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("econexo:sessao", onStorage);
    };
  }, []);

  return userData;
}

function readSafe() {
  const u = getUser();
  return (
    u || {
      id: "",
      nome: "",
      email: "",
      cidade: "",
      estado: "",
      role: "",
      initials: "",
      color: "#2A26C7",
    }
  );
}
