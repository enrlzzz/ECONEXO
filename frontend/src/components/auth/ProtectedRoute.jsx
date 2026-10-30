import { Navigate, useLocation } from "react-router-dom";
import { useLogado } from "../../useUserData";

/**
 * Conveniência de UX, não segurança (regra 5 do CLAUDE.md): quem autoriza é
 * o backend, validando o ID token do Firebase em cada chamada.
 *
 * useLogado() é reativo: se a sessão cair com a tela aberta, redireciona.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const logado = useLogado();
  if (!logado) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
