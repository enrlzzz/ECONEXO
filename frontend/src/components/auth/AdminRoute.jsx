import { Navigate } from "react-router-dom";
import { isLoggedIn, isAdmin } from "../../userSession";

/**
 * Guard do painel administrativo.
 *
 * ATENÇÃO — isto é conveniência de UX, não autorização (regra 5 do
 * CLAUDE.md). A flag `admin` vem do localStorage e qualquer pessoa a edita no
 * DevTools em cinco segundos; o que ela consegue com isso é ver a casca da
 * tela, hoje vazia.
 *
 * A autorização de verdade tem que estar no backend, em cada endpoint
 * administrativo. Como esses endpoints ainda não existem, não há o que
 * proteger além da navegação — quando existirem, cada um precisa conferir
 * `admin` no servidor, e não confiar nesta rota.
 */
export default function AdminRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/menu-user" replace />;
  }
  return children;
}
