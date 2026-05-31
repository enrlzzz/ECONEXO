import { useState, useEffect } from "react";
import { getUser } from "./userSession";

export function useUserData() {
  const [userData, setUserData] = useState(() => readSafe());

  useEffect(() => {
    const onStorage = () => setUserData(readSafe());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
