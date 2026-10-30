/**
 * Equipe Lunitec — seção "Nossa equipe" da home.
 *
 * Fonte: slide "Distribuição de Papéis no Grupo" da apresentação da 1ª entrega
 * (11/09/2026). O RA de cada um NÃO entra aqui de propósito: o repositório e
 * o site são públicos.
 *
 * `foto`: arquivo em /public/equipe, quadrado 240×240, WebP (~5 kB).
 * `link`: perfil público (LinkedIn/GitHub) — opcional; ainda não informado.
 */
export const MEMBROS = [
  {
    nome: "Enrico Lizier Godinho",
    papel: "Gestor do projeto e back-end Java",
    descricao: "Lidera o grupo e o Trello, define a arquitetura Spring Boot, a segurança da API e o deploy.",
    foto: "/equipe/enrico.webp",
  },
  {
    nome: "Luan Gomes",
    papel: "Back-end Java",
    descricao: "Implementa controllers, services e regras de negócio da API.",
    foto: "/equipe/luan.webp",
  },
  {
    nome: "Nicolas Gomes",
    papel: "Banco de dados",
    descricao: "Responsável pelo schema MySQL, chaves estrangeiras e integridade dos dados.",
    foto: "/equipe/nicolas-gomes.webp",
  },
  {
    nome: "Kauã Zonta",
    papel: "Banco de dados",
    descricao: "Mantém o script SQL, a modelagem das certificações e o MER/DER.",
    foto: "/equipe/kaua.webp",
  },
  {
    nome: "Nicolas Augusto",
    papel: "Documentação, relatórios e front-end",
    descricao: "Conduz a documentação e os relatórios e apoia as telas em React.",
    foto: "/equipe/nicolas-augusto.webp",
  },
  {
    nome: "Nycolas Bertocco",
    papel: "Front-end React / HTML / CSS",
    descricao: "Desenvolve as telas, a timeline e a mensageria em React.",
    foto: "/equipe/nycolas-bertocco.webp",
  },
];
