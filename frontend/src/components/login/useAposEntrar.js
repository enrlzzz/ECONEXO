import { useLocation, useNavigate } from "react-router-dom";

/** Para onde ir depois de entrar: a página que pediu o login, ou o perfil. */
export function useAposEntrar() {
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from || "/perfil";

  return (resultado) => {
    if (resultado.status === "ok") navigate(destino, { replace: true });
  };
}
