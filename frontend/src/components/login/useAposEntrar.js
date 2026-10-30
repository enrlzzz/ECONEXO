import { useLocation, useNavigate } from "react-router-dom";

/**
 * Para onde ir depois de uma entrada. As três respostas possíveis do
 * backend viram três destinos — a tela só chama `seguir(resultado)`.
 */
export function useAposEntrar() {
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from || "/perfil";

  return (resultado, definirConfirmacao) => {
    if (resultado.status === "ok") navigate(destino, { replace: true });
    else if (resultado.status === "concluir-cadastro") navigate("/concluir-cadastro", { state: { from: destino } });
    else if (resultado.status === "confirmar-email") definirConfirmacao(resultado.mensagem);
  };
}
