import {
  IconBell,
  IconBolt,
  IconBriefcase,
  IconCertificate,
  IconChartLine,
  IconHome,
  IconLayoutDashboard,
  IconMessageCircle,
  IconPlugConnected,
  IconSettings,
  IconShieldLock,
  IconSolarPanel,
  IconSearch,
  IconStar,
  IconUser,
} from "@tabler/icons-react";

/**
 * Menu da barra lateral da área logada — a única lista de destinos.
 *
 * `principais` ficam sempre visíveis no topo. `grupos` são seções que
 * abrem e fecham; cada módulo da área logada aparece em exatamente uma.
 *  - fim: o link só fica "ativo" na rota exata (senão /menu-user acenderia
 *    em todas as telas);
 *  - selo: mostra o contador de notificações não lidas;
 *  - soAdmin: some para quem não é admin. Esconder é conveniência — quem
 *    autoriza é o backend.
 */
export const DESTINOS_PRINCIPAIS = [
  { to: "/menu-user", rotulo: "Comunidade", Icone: IconHome, fim: true },
  { to: "/menu-user/messages", rotulo: "Mensagens", Icone: IconMessageCircle },
  { to: "/menu-user/notifications", rotulo: "Notificações", Icone: IconBell, selo: true },
];

export const GRUPOS_DO_MENU = [
  {
    id: "energia",
    rotulo: "Energia",
    itens: [
      { to: "/analisar", rotulo: "Analisar conta", Icone: IconBolt },
      { to: "/perfil", rotulo: "Minhas análises", Icone: IconChartLine },
      { to: "/menu-user/pontos-recarga", rotulo: "Recarga EV", Icone: IconPlugConnected },
    ],
  },
  {
    id: "profissionais",
    rotulo: "Profissionais",
    itens: [
      { to: "/menu-user/buscar", rotulo: "Buscar", Icone: IconSearch },
      { to: "/menu-user/projects", rotulo: "Projetos", Icone: IconSolarPanel },
      { to: "/menu-user/portfolio", rotulo: "Portfólio", Icone: IconBriefcase },
    ],
  },
  {
    id: "confianca",
    rotulo: "Confiança",
    itens: [
      { to: "/menu-user/validacao", rotulo: "Validação", Icone: IconCertificate },
      { to: "/menu-user/reputacao", rotulo: "Reputação", Icone: IconStar },
    ],
  },
  {
    id: "conta",
    rotulo: "Conta",
    itens: [
      { to: "/menu-user/profile", rotulo: "Perfil profissional", Icone: IconUser },
      { to: "/menu-user/painel", rotulo: "Painel profissional", Icone: IconLayoutDashboard },
      { to: "/menu-user/settings", rotulo: "Configurações", Icone: IconSettings },
      { to: "/menu-user/administration", rotulo: "Administração", Icone: IconShieldLock, soAdmin: true },
    ],
  },
];
