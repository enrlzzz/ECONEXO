import { useNavigate } from "react-router-dom";

/** Depois de entrar ou criar a conta, o destino é sempre a timeline da comunidade. */
export function useAposEntrar() {
  const navigate = useNavigate();

  return (resultado) => {
    if (resultado.status === "ok") navigate("/menu-user", { replace: true });
  };
}
