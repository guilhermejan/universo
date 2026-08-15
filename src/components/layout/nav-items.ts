import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  FileSignature,
  UsersRound,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  // Itens com sub-páginas (ex: Documentos tem 3 abas) mostram um flyout na
  // sidebar compacta em vez de navegar direto ao clicar no ícone.
  children?: { label: string; href: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Empresas", href: "/empresas", icon: Building2, enabled: true },
  {
    label: "Documentos",
    href: "/documentos",
    icon: FileText,
    enabled: true,
    children: [
      { label: "Regularizar pendências", href: "/documentos" },
      { label: "Biblioteca de documentos", href: "/documentos/tipos" },
      { label: "Perfis de documento", href: "/documentos/perfis" },
    ],
  },
  { label: "Grupos", href: "/grupos", icon: UsersRound, enabled: true },
  { label: "Parametrizações", href: "/parametrizacoes", icon: SlidersHorizontal, enabled: true },
  { label: "Funcionários", href: "/funcionarios", icon: Users, enabled: true },
  { label: "Contratos", href: "/contratos", icon: FileSignature, enabled: true },
];
