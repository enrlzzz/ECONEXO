import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

/**
 * Usuário do Firebase, reativo. `pronto` só vira true depois que o SDK leu
 * a sessão salva — antes disso "sem usuário" ainda não quer dizer nada.
 */
export function useUsuarioFirebase() {
  const [estado, setEstado] = useState({ pronto: !auth, usuario: auth?.currentUser ?? null });

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (usuario) => setEstado({ pronto: true, usuario }));
  }, []);

  return estado;
}
