/**
 * Firebase Authentication — SÓ login. Nada de Firestore, Storage etc.
 *
 * A config vem de variáveis de ambiente (VITE_FIREBASE_*). Ela não é segredo
 * no sentido de senha — vai parar no bundle de qualquer jeito, é assim que o
 * SDK web funciona —, mas mantê-la fora do código evita misturar projetos
 * (dev x produção) e deixa o repositório público sem identificadores.
 * Quem protege de verdade é: domínios autorizados no console do Firebase e o
 * backend validando o ID token (iss/aud = projeto).
 *
 * Imports modulares (firebase/app, firebase/auth): o bundle leva só o Auth.
 */
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** false quando o .env não tem a config: o site abre, só o login fica indisponível. */
export const firebaseConfigurado = Boolean(config.apiKey && config.authDomain && config.projectId);

export const auth = firebaseConfigurado ? getAuth(initializeApp(config)) : null;

// Só em desenvolvimento: aponta para o emulador local do Firebase Auth
// (`firebase emulators:start --only auth`). Nunca vai para o build de
// produção — import.meta.env.DEV é false lá.
const emulador = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR;
if (auth && emulador) {
  connectAuthEmulator(auth, emulador, { disableWarnings: true });
}

if (auth) {
  // E-mails de verificação e de nova senha saem em português.
  auth.languageCode = "pt-BR";
  // Sessão persistente: continua logado depois de fechar o navegador.
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}
