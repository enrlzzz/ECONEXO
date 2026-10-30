import {
  IconChartLine,
  IconHome,
  IconMessageCircle,
  IconSearch,
  IconSolarPanel,
} from "@tabler/icons-react";

/**
 * Os destinos de uso diário da área logada. Aparecem na barra superior no
 * computador e na barra inferior no celular — a lista é uma só para as duas
 * nunca ficarem diferentes.
 */
export const DESTINOS_PRINCIPAIS = [
  { to: "/menu-user", rotulo: "Início", Icone: IconHome, fim: true },
  { to: "/menu-user/buscar", rotulo: "Buscar", Icone: IconSearch },
  { to: "/menu-user/projects", rotulo: "Projetos", Icone: IconSolarPanel },
  { to: "/menu-user/messages", rotulo: "Mensagens", Icone: IconMessageCircle },
  { to: "/perfil", rotulo: "Análises", Icone: IconChartLine },
];
