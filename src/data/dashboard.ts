export const dashboardStats = [
  {
    id: 1,
    title: "Clientes",
    value: 0,
    description: "Clientes cadastrados",
    color: "green",
  },
  {
    id: 2,
    title: "NFC Smart",
    value: 0,
    description: "Tags ativas",
    color: "blue",
  },
  {
    id: 3,
    title: "Reviews",
    value: 0,
    description: "Avaliações",
    color: "yellow",
  },
  {
    id: 4,
    title: "Wi-Fi",
    value: 0,
    description: "Conexões",
    color: "purple",
  },
];


export const quickActions = [
  {
    id: 1,
    title: "Clientes",
    icon: "users",
  },
  {
    id: 2,
    title: "NFC",
    icon: "smartphone",
  },
  {
    id: 3,
    title: "Reviews",
    icon: "star",
  },
  {
    id: 4,
    title: "WhatsApp",
    icon: "message",
  },
  {
    id: 5,
    title: "Wi-Fi",
    icon: "wifi",
  },
  {
    id: 6,
    title: "Relatórios",
    icon: "chart",
  },
];
export const businessHealth = {
  score: 78,

  level: "Muito Bom",

  recommendations: [
    "Ative o Smart Reviews para aumentar sua reputação.",
    "Configure o WhatsApp IA.",
    "Cadastre mais clientes para melhorar seus indicadores.",
  ],

  checklist: [
    {
      title: "Clientes cadastrados",
      active: true,
    },
    {
      title: "NFC configurado",
      active: true,
    },
    {
      title: "Wi-Fi Marketing",
      active: true,
    },
    {
      title: "Google Reviews",
      active: false,
    },
    {
      title: "WhatsApp IA",
      active: false,
    },
    {
      title: "IA Comercial",
      active: false,
    },
  ],
};