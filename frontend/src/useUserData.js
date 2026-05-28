import { useState, useEffect } from "react";

export function useUserData() {
  const [userData, setUserData] = useState({
    nome: "",
    cidade: "",
    estado: "",
  });

  useEffect(() => {
    setUserData({
      nome: localStorage.getItem("userName") || "",
      cidade: localStorage.getItem("userCidade") || "",
      estado: localStorage.getItem("userEstado") || "",
    });
  }, []);

  return userData;
}