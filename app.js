/* ============================================================
   COP Serv - IT Center
   Aplicação client-side (localStorage). Inclui:
   - Login e base de usuários (cadastro/edição/exclusão pelo admin)
   - Papéis e hierarquia de atendimento
     (Coordenador → Supervisor → Analista/Associado → Assistente → Jovem Aprendiz)
   - Modo administrador: CRUD do catálogo (categorias/abas e serviços)
   - Modo escuro
   AVISO: autenticação é apenas de protótipo (sem backend; credenciais no
   navegador). Não use como segurança real de produção.
   ============================================================ */

const STORAGE_KEY = 'copserv_data_v3';
const SESSION_KEY = 'copserv_session_v1';
const THEME_KEY = 'copserv_theme';

/* ---------------- Papéis / hierarquia ---------------- */
const ROLE = {
  ADMIN: 'Administrador',
  COORDENADOR: 'Coordenador',
  SUPERVISOR: 'Supervisor',
  ANALISTA: 'Analista',
  ASSOCIADO: 'Associado',
  ASSISTENTE: 'Assistente',
  APRENDIZ: 'Jovem Aprendiz',
  COLABORADOR: 'Colaborador',
};

const ALL_ROLES = [
  ROLE.ADMIN, ROLE.COORDENADOR, ROLE.SUPERVISOR, ROLE.ANALISTA, ROLE.ASSOCIADO,
  ROLE.ASSISTENTE, ROLE.APRENDIZ, ROLE.COLABORADOR,
];

/** Nível na cadeia de atendimento (menor = mais alto). Associado = mesmo nível de Analista. */
const HANDLER_LEVEL = {
  [ROLE.COORDENADOR]: 0,
  [ROLE.SUPERVISOR]: 1,
  [ROLE.ANALISTA]: 2,
  [ROLE.ASSOCIADO]: 2,
  [ROLE.ASSISTENTE]: 3,
  [ROLE.APRENDIZ]: 4,
};
/** Papéis que efetivamente atendem chamados (entram na fila). */
const HANDLER_ROLES = [ROLE.COORDENADOR, ROLE.SUPERVISOR, ROLE.ANALISTA, ROLE.ASSOCIADO, ROLE.ASSISTENTE, ROLE.APRENDIZ];

function isAdmin() { return currentUser && currentUser.role === ROLE.ADMIN; }
function isHandler() { return currentUser && (isAdmin() || HANDLER_ROLES.includes(currentUser.role)); }

/** Papéis abaixo do papel informado, na cadeia (para encaminhamento). */
function rolesBelow(role) {
  const myLevel = role === ROLE.ADMIN ? -1 : (HANDLER_LEVEL[role] ?? 99);
  return HANDLER_ROLES.filter((r) => HANDLER_LEVEL[r] > myLevel);
}

/* ---------------- Status ---------------- */
const STATUS = {
  ANALISE: 'Em análise',
  ABERTO: 'Aberto',
  ANDAMENTO: 'Em andamento',
  AGUARDANDO: 'Aguardando aprovação',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  RESOLVIDO: 'Resolvido',
  CANCELADO: 'Cancelado',
};

const STATUS_BADGE_CLASS = {
  [STATUS.ANALISE]: 'badge-analise',
  [STATUS.ABERTO]: 'badge-aberto',
  [STATUS.ANDAMENTO]: 'badge-andamento',
  [STATUS.AGUARDANDO]: 'badge-aguardando',
  [STATUS.APROVADO]: 'badge-aprovado',
  [STATUS.REJEITADO]: 'badge-rejeitado',
  [STATUS.RESOLVIDO]: 'badge-resolvido',
  [STATUS.CANCELADO]: 'badge-cancelado',
};

const OPEN_STATUSES = [STATUS.ANALISE, STATUS.ABERTO, STATUS.ANDAMENTO, STATUS.AGUARDANDO, STATUS.APROVADO];
const CLOSED_STATUSES = [STATUS.RESOLVIDO, STATUS.CANCELADO, STATUS.REJEITADO];

/* ---------------- Catálogo padrão (usado só na 1ª carga / reset) ---------------- */
const DEFAULT_CATEGORIES = [
  { id: 'hardware', label: 'Hardware', icon: '💻' },
  { id: 'software', label: 'Software', icon: '🧩' },
  { id: 'access', label: 'Acessos e Sistemas', icon: '🔐' },
  { id: 'network', label: 'Rede e Conectividade', icon: '🌐' },
  { id: 'google', label: 'Google Workspace', icon: '☁️' },
  { id: 'hosting', label: 'Hosting e Servidores', icon: '🖥️' },
  { id: 'hr', label: 'Serviços de RH', icon: '👥' },
  { id: 'other', label: 'Outros Serviços', icon: '🧰' },
  { id: 'security', label: 'Segurança da Informação', icon: '🛡️' },
];

const DEFAULT_SERVICES = {
  hardware: [
    { sub: 'Solicitar Hardware', items: [
      { icon: '📱', title: 'Smartphone', desc: 'Para solicitar smartphones corporativos' },
      { icon: '🖱️', title: 'Teclado/Mouse', desc: 'Para solicitar teclados e mouses' },
      { icon: '💻', title: 'Notebook', desc: 'Para solicitar notebooks', approval: true },
      { icon: '🖥️', title: 'Desktop PC', desc: 'Para solicitar desktops', approval: true },
      { icon: '🖥️', title: 'Monitor', desc: 'Para solicitar monitores' },
      { icon: '📱', title: 'Tablet', desc: 'Para solicitar tablets' },
      { icon: '🎧', title: 'Fone de Ouvido', desc: 'Para solicitar headsets' },
      { icon: '🔌', title: 'SIM Card', desc: 'Para solicitar chip corporativo' },
      { icon: '🖨️', title: 'Impressora', desc: 'Solicitar impressora para setor', approval: true },
      { icon: '⚙️', title: 'Outro Hardware', desc: 'Para solicitar outro equipamento' },
    ]},
    { sub: 'Gerenciar Hardware', items: [
      { icon: '🔄', title: 'Devolução de Equipamento', desc: 'Para devolução de equipamentos' },
      { icon: '🤝', title: 'Hardware de Empréstimo', desc: 'Alugar equipamento para uso temporário' },
      { icon: '➡️', title: 'Transferência de Equipamento', desc: 'Para transferência de equipamentos' },
      { icon: '📤', title: 'Reportar Perda de Equipamento', desc: 'Para relatar perda de ativos', approval: true },
    ]},
    { sub: 'Outros Serviços', items: [
      { icon: '🖨️', title: 'Substituição de Toner', desc: 'Para substituir o toner da impressora' },
    ]},
  ],
  software: [
    { sub: 'Solicitar Software', items: [
      { icon: '🔴', title: 'Adobe Acrobat Pro DC', desc: 'Para usuários jurídicos', approval: true },
      { icon: '🟠', title: 'Adobe Illustrator CC', desc: 'Licença de design', approval: true },
      { icon: '🔵', title: 'Adobe Photoshop CC', desc: 'Licença de edição de imagem', approval: true },
      { icon: '✓', title: 'ClickUp Business', desc: 'Gestão de projetos' },
      { icon: '🤖', title: 'ChatGPT/Codex Enterprise', desc: 'Licença de IA', approval: true },
      { icon: '↗️', title: 'Cursor Enterprise', desc: 'IDE com IA', approval: true },
      { icon: '🌟', title: 'Claude Enterprise', desc: 'Licença de IA', approval: true },
      { icon: '🎨', title: 'Figma Organization', desc: 'Verifique se o Figma Viewer é suficiente antes', approval: true },
      { icon: '📊', title: 'ThinkCell', desc: 'Add-in de apresentações' },
      { icon: '🐱', title: 'GitHub Copilot Business', desc: 'Licença de IA para código', approval: true },
      { icon: '🔴', title: 'Microsoft Office 365', desc: 'Pacote Office completo' },
      { icon: '📊', title: 'Microsoft Power BI Pro', desc: 'Licença de BI' },
      { icon: '📹', title: 'Zoom Pro', desc: 'Reuniões sem limite de duração' },
      { icon: '⚙️', title: 'Outro Software', desc: 'Para solicitar outras licenças' },
    ]},
    { sub: 'Gerenciar Software', items: [
      { icon: '🔄', title: 'Renovar Licença de Software', desc: 'Para renovar licenças/contas' },
      { icon: '✓', title: 'Permissão de Software (Whitelist)', desc: 'Para liberar software na lista de permitidos', approval: true },
      { icon: '↩️', title: 'Devolver Software', desc: 'Para devolver software que não está em uso' },
      { icon: '➡️', title: 'Transferência de Software', desc: 'Para transferir software para um colega' },
    ]},
    { sub: 'Ampliar Acesso a Software', items: [
      { icon: '🔑', title: 'AIS Switch: Ajustar Cota de Token', desc: 'Ajustar cota de tokens do AIS Switch', approval: true },
      { icon: '⚡', title: 'Cursor Enterprise: Fast Premium', desc: 'Assinar requisições premium', approval: true },
      { icon: '🤖', title: 'ChatGPT/Codex: Ajustar Limite', desc: 'Ajustar limite de gastos', approval: true },
      { icon: '🌟', title: 'Claude Enterprise: Ajustar Limite', desc: 'Ajustar limite de gastos', approval: true },
    ]},
  ],
  access: [
    { sub: 'Solicitar Acesso', items: [
      { icon: '🏦', title: 'Acesso ao Sistema Financeiro', desc: 'Acesso a sistemas financeiros internos', approval: true },
      { icon: '📁', title: 'Acesso a Pasta Compartilhada', desc: 'Solicitar acesso a diretórios de rede', approval: true },
      { icon: '🗄️', title: 'Acesso a Banco de Dados', desc: 'Solicitar acesso a base de dados', approval: true },
      { icon: '🔑', title: 'Redefinir Senha', desc: 'Solicitar redefinição de senha de sistema' },
      { icon: '👤', title: 'Criação de Usuário', desc: 'Solicitar criação de novo usuário/sistema', approval: true },
    ]},
    { sub: 'Gerenciar Acesso', items: [
      { icon: '🚫', title: 'Revogar Acesso', desc: 'Solicitar remoção de acesso de um sistema' },
      { icon: '➡️', title: 'Transferência de Acesso', desc: 'Transferir acessos entre colaboradores', approval: true },
    ]},
  ],
  network: [
    { sub: 'Conectividade', items: [
      { icon: '🔗', title: 'Acesso VPN', desc: 'Solicitar acesso à VPN corporativa', approval: true },
      { icon: '📶', title: 'Wi-Fi Corporativo', desc: 'Solicitar credenciais de Wi-Fi' },
      { icon: '🔌', title: 'Ponto de Rede', desc: 'Solicitar instalação de ponto de rede' },
      { icon: '🛰️', title: 'Firewall / Liberação de Porta', desc: 'Solicitar liberação de porta/host', approval: true },
    ]},
  ],
  google: [
    { sub: 'Google Workspace', items: [
      { icon: '📧', title: 'Nova Conta Google Workspace', desc: 'Solicitar criação de conta corporativa', approval: true },
      { icon: '👥', title: 'Grupo de Distribuição', desc: 'Criar ou editar grupo de e-mail' },
      { icon: '💾', title: 'Aumentar Cota de Drive', desc: 'Solicitar aumento de armazenamento', approval: true },
      { icon: '📅', title: 'Compartilhamento de Agenda', desc: 'Solicitar acesso a agenda de terceiros' },
    ]},
  ],
  hosting: [
    { sub: 'Hosting e Servidores', items: [
      { icon: '🖥️', title: 'Provisionar Servidor', desc: 'Solicitar novo servidor/VM', approval: true },
      { icon: '📈', title: 'Aumentar Recursos (CPU/RAM)', desc: 'Solicitar upgrade de servidor', approval: true },
      { icon: '🌐', title: 'Registro de Domínio', desc: 'Solicitar novo domínio', approval: true },
      { icon: '🔐', title: 'Certificado SSL', desc: 'Solicitar emissão/renovação de certificado' },
    ]},
  ],
  hr: [
    { sub: 'Serviços de RH', items: [
      { icon: '📄', title: 'Declaração Funcional', desc: 'Solicitar declaração de vínculo' },
      { icon: '🏖️', title: 'Solicitação de Férias', desc: 'Solicitar período de férias', approval: true },
      { icon: '💳', title: 'Benefícios', desc: 'Dúvidas ou alterações de benefícios' },
      { icon: '📋', title: 'Atualização Cadastral', desc: 'Atualizar dados pessoais' },
    ]},
  ],
  other: [
    { sub: 'Outros Serviços', items: [
      { icon: '❓', title: 'Dúvida Geral de TI', desc: 'Para outras dúvidas não listadas' },
      { icon: '🧰', title: 'Solicitação Personalizada', desc: 'Para pedidos que não se encaixam nas categorias' },
    ]},
  ],
  security: [
    { sub: 'Segurança da Informação', items: [
      { icon: '🛡️', title: 'Reportar Incidente de Segurança', desc: 'Reportar phishing, vazamento ou incidente', approval: true },
      { icon: '🔍', title: 'Solicitar Auditoria de Acesso', desc: 'Solicitar revisão de permissões', approval: true },
      { icon: '🔑', title: 'Autenticação Multifator (MFA)', desc: 'Ativar/reconfigurar MFA' },
      { icon: '🖥️', title: 'Análise de Dispositivo', desc: 'Solicitar verificação de segurança de um dispositivo' },
    ]},
  ],
};

/* Referências vivas ao catálogo (apontam para state.categories / state.services). */
let CATEGORIES = [];
let SERVICES = {};

const CATEGORY_ICO = {
  hardware: 'laptop', software: 'grid', access: 'key', network: 'globe',
  google: 'cloud', hosting: 'server', hr: 'users', other: 'grid', security: 'shield',
};
function catIconHtml(cat) {
  const key = CATEGORY_ICO[cat.id];
  if (key && ICO[key]) return ICO[key];
  return `<span class="emoji-ico">${escapeHtml(cat.icon || '📁')}</span>`;
}

function categoryLabel(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.label : id;
}

/* ============================================================
   Estado / Persistência
   ============================================================ */
let state = null;
let currentUser = null;

let idCounter = 0;
function uid(prefix) { return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`; }

function initialsOf(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Adiciona um id a cada item de serviço (para edição/exclusão). */
function withServiceIds(services) {
  const out = {};
  for (const catId of Object.keys(services)) {
    out[catId] = services[catId].map((group) => ({
      sub: group.sub,
      items: group.items.map((it) => ({ id: uid('svc'), approval: false, ...it })),
    }));
  }
  return out;
}

function seedUsers() {
  return [
    { id: 'u-admin', name: 'Weslley Sardinha', email: 'wsavliscrds@gmail.com', password: 'admin123', role: ROLE.ADMIN, active: true, createdAt: Date.now() },
    { id: 'u-coord', name: 'Camila Duarte', email: 'coordenador@sea.com', password: 'senha123', role: ROLE.COORDENADOR, active: true, createdAt: Date.now() },
    { id: 'u-sup', name: 'Rafael Nunes', email: 'supervisor@sea.com', password: 'senha123', role: ROLE.SUPERVISOR, active: true, createdAt: Date.now() },
    { id: 'u-ana', name: 'Beatriz Almeida', email: 'analista@sea.com', password: 'senha123', role: ROLE.ANALISTA, active: true, createdAt: Date.now() },
    { id: 'u-assoc', name: 'Diego Ferreira', email: 'associado@sea.com', password: 'senha123', role: ROLE.ASSOCIADO, active: true, createdAt: Date.now() },
    { id: 'u-assist', name: 'Larissa Gomes', email: 'assistente@sea.com', password: 'senha123', role: ROLE.ASSISTENTE, active: true, createdAt: Date.now() },
    { id: 'u-aprendiz', name: 'Pedro Henrique', email: 'aprendiz@sea.com', password: 'senha123', role: ROLE.APRENDIZ, active: true, createdAt: Date.now() },
    { id: 'u-colab', name: 'João Silva', email: 'colaborador@sea.com', password: 'senha123', role: ROLE.COLABORADOR, active: true, createdAt: Date.now() },
  ];
}

function seedState() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let seq = 10303;
  const nextId = () => `IT-${++seq}`;
  const todayAt = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); };
  const yesterdayAt = (h, m) => todayAt(h, m) - day;
  const fixedDate = (y, mo, d, h, m) => new Date(y, mo, d, h, m).getTime();

  const mk = (over) => ({
    category: 'hardware', service: '', title: '', description: '', priority: 'Média',
    requester: 'Weslley Sardinha', status: STATUS.ANALISE, approvalNeeded: false, watchers: [],
    assignedRole: null, assignedTo: null, assignmentChain: [],
    createdAt: now, updatedAt: now, history: [],
    ...over,
  });

  const tickets = [
    mk({ id: 'IT-10291', category: 'hardware', service: 'Notebook', title: 'Solicitar Notebook',
      description: 'Preciso de um notebook corporativo para o novo colaborador da equipe.',
      priority: 'Média', status: STATUS.ANALISE, approvalNeeded: true, assignedRole: ROLE.COORDENADOR,
      createdAt: todayAt(9, 15), updatedAt: todayAt(9, 15),
      history: [{ text: 'Chamado criado por Weslley Sardinha', at: todayAt(9, 15) }, { text: 'Encaminhado para triagem (Coordenador)', at: todayAt(9, 15) }] }),
    mk({ id: 'IT-10288', category: 'software', service: 'Microsoft Power BI Pro', title: 'Licença Power BI Pro',
      description: 'Solicito licença do Power BI Pro para construção de dashboards financeiros.',
      priority: 'Baixa', status: STATUS.RESOLVIDO, createdAt: yesterdayAt(9, 0), updatedAt: yesterdayAt(16, 40),
      history: [{ text: 'Chamado criado por Weslley Sardinha', at: yesterdayAt(9, 0) }, { text: 'Chamado marcado como resolvido', at: yesterdayAt(16, 40) }] }),
    mk({ id: 'IT-10276', category: 'network', service: 'Acesso VPN', title: 'Acesso VPN',
      description: 'Solicito acesso VPN para trabalho remoto.',
      priority: 'Alta', status: STATUS.ANDAMENTO, approvalNeeded: true, assignedRole: ROLE.SUPERVISOR,
      createdAt: yesterdayAt(8, 0), updatedAt: yesterdayAt(11, 20),
      history: [{ text: 'Chamado criado por Weslley Sardinha', at: yesterdayAt(8, 0) }, { text: 'Encaminhado para Rafael Nunes (Supervisor)', at: yesterdayAt(11, 20) }] }),
    mk({ id: 'IT-10263', category: 'hardware', service: 'Impressora', title: 'Solicitação de Impressora',
      description: 'Impressora do setor com defeito, solicitando substituição.',
      priority: 'Média', status: STATUS.AGUARDANDO, approvalNeeded: true,
      createdAt: fixedDate(2024, 5, 22, 10, 0), updatedAt: fixedDate(2024, 5, 22, 10, 0),
      history: [{ text: 'Chamado criado por Weslley Sardinha', at: fixedDate(2024, 5, 22, 10, 0) }] }),
    mk({ id: 'IT-10251', category: 'software', service: 'Adobe Acrobat Pro DC', title: 'Licença Adobe Acrobat',
      description: 'Necessário para assinatura digital de contratos.',
      priority: 'Baixa', status: STATUS.RESOLVIDO, createdAt: fixedDate(2024, 5, 20, 9, 0), updatedAt: fixedDate(2024, 5, 21, 9, 0),
      history: [{ text: 'Chamado criado por Weslley Sardinha', at: fixedDate(2024, 5, 20, 9, 0) }, { text: 'Chamado marcado como resolvido', at: fixedDate(2024, 5, 21, 9, 0) }] }),
    mk({ id: 'IT-10301', category: 'software', service: 'Adobe Creative Cloud', title: 'Licença Adobe Creative Cloud',
      description: 'Solicitado por João Silva para a equipe de design.',
      requester: 'João Silva', priority: 'Média', status: STATUS.AGUARDANDO, approvalNeeded: true, assignedRole: ROLE.COORDENADOR,
      createdAt: now - 2 * 60 * 60 * 1000, updatedAt: now - 2 * 60 * 60 * 1000,
      history: [{ text: 'Chamado criado por João Silva', at: now - 2 * 60 * 60 * 1000 }] }),
    mk({ id: 'IT-10302', category: 'access', service: 'Acesso ao Sistema Financeiro', title: 'Acesso ao Sistema Financeiro',
      description: 'Solicitado por Maria Santos, precisa de acesso para conciliação mensal.',
      requester: 'Maria Santos', priority: 'Alta', status: STATUS.AGUARDANDO, approvalNeeded: true, assignedRole: ROLE.COORDENADOR,
      createdAt: now - 5 * 60 * 60 * 1000, updatedAt: now - 5 * 60 * 60 * 1000,
      history: [{ text: 'Chamado criado por Maria Santos', at: now - 5 * 60 * 60 * 1000 }] }),
    mk({ id: 'IT-10303', category: 'hardware', service: 'Notebook', title: 'Notebook para Desenvolvedor',
      description: 'Solicitado por Carlos Lima, notebook com 32GB RAM para desenvolvimento.',
      requester: 'Carlos Lima', priority: 'Alta', status: STATUS.AGUARDANDO, approvalNeeded: true, assignedRole: ROLE.COORDENADOR,
      createdAt: now - 1 * day, updatedAt: now - 1 * day,
      history: [{ text: 'Chamado criado por Carlos Lima', at: now - 1 * day }] }),
  ];

  const filler = [
    { category: 'software', service: 'Microsoft Office 365', status: STATUS.ANALISE },
    { category: 'access', service: 'Redefinir Senha', status: STATUS.ANALISE },
    { category: 'hardware', service: 'Monitor', status: STATUS.AGUARDANDO, approvalNeeded: true },
    { category: 'hardware', service: 'Teclado/Mouse', status: STATUS.ABERTO },
    { category: 'software', service: 'Zoom Pro', status: STATUS.ANDAMENTO },
    { category: 'network', service: 'Wi-Fi Corporativo', status: STATUS.ABERTO },
    { category: 'google', service: 'Grupo de Distribuição', status: STATUS.ANDAMENTO },
    { category: 'hosting', service: 'Certificado SSL', status: STATUS.APROVADO },
    { category: 'security', service: 'Autenticação Multifator (MFA)', status: STATUS.ABERTO },
    { category: 'hr', service: 'Declaração Funcional', status: STATUS.RESOLVIDO },
    { category: 'software', service: 'ClickUp Business', status: STATUS.RESOLVIDO },
    { category: 'hardware', service: 'Fone de Ouvido', status: STATUS.RESOLVIDO },
    { category: 'access', service: 'Acesso a Pasta Compartilhada', status: STATUS.RESOLVIDO, approvalNeeded: true },
    { category: 'software', service: 'GitHub Copilot Business', status: STATUS.RESOLVIDO, approvalNeeded: true },
  ];
  filler.forEach((f, idx) => {
    const ts = fixedDate(2023, 10 - idx, 12, 9, 0);
    tickets.push(mk({ id: nextId(), category: f.category, service: f.service, title: f.service,
      description: `Chamado de ${f.service.toLowerCase()}.`, status: f.status, approvalNeeded: !!f.approvalNeeded,
      createdAt: ts, updatedAt: ts, history: [{ text: 'Chamado criado por Weslley Sardinha', at: ts }] }));
  });

  return {
    users: seedUsers(),
    categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    services: withServiceIds(DEFAULT_SERVICES),
    tickets, watching: [], seq,
  };
}

function nextTicketId() {
  state.seq = (state.seq || 10290) + 1;
  return `IT-${state.seq}`;
}

function syncCatalogRefs() {
  CATEGORIES = state.categories;
  SERVICES = state.services;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw);
      if (!state.users) state.users = seedUsers();
      if (!state.categories) state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      if (!state.services) state.services = withServiceIds(DEFAULT_SERVICES);
      syncCatalogRefs();
      return;
    }
  } catch (e) { /* storage corrompido → reseed */ }
  state = seedState();
  syncCatalogRefs();
  saveState();
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
}

/* ---------------- Sessão / Tema ---------------- */
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return state.users.find((u) => u.id === userId && u.active) || null;
  } catch (e) { return null; }
}
function saveSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id })); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
}
function currentTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t) return t;
  } catch (e) { /* ignore */ }
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  const menu = document.getElementById('user-menu');
  if (menu && menu.classList.contains('open')) renderUserMenu();
}

/* ============================================================
   Utilidades
   ============================================================ */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = 60 * 1000, hr = 60 * min, day = 24 * hr;
  if (diff < min) return 'agora mesmo';
  if (diff < hr) { const m = Math.floor(diff / min); return `Há ${m} minuto${m > 1 ? 's' : ''}`; }
  if (diff < day) { const h = Math.floor(diff / hr); return `Há ${h} hora${h > 1 ? 's' : ''}`; }
  if (diff < 30 * day) { const d = Math.floor(diff / day); return `Há ${d} dia${d > 1 ? 's' : ''}`; }
  return new Date(ts).toLocaleDateString('pt-BR');
}
function formatDateTime(ts) {
  return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatSmartDate(ts) {
  const d = new Date(ts), now = new Date();
  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / (24 * 60 * 60 * 1000));
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Ontem, ${time}`;
  return d.toLocaleDateString('pt-BR');
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function statusBadge(status) {
  return `<span class="badge ${STATUS_BADGE_CLASS[status] || 'badge-aberto'}">${escapeHtml(status)}</span>`;
}
function priorityClass(p) {
  return 'priority-' + (p || 'média').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/* ---------------- Consultas ---------------- */
function myTickets() { return state.tickets.filter((t) => t.requester === currentUser.name); }
function pendingApprovals() {
  return state.tickets.filter((t) => t.approvalNeeded && t.status === STATUS.AGUARDANDO && t.requester !== currentUser.name);
}
function watchedTickets() { return state.tickets.filter((t) => (state.watching || []).includes(t.id)); }
function findTicket(id) { return state.tickets.find((t) => t.id === id); }
function findUser(id) { return state.users.find((u) => u.id === id); }
function usersByRole(role) { return state.users.filter((u) => u.role === role && u.active); }

/** Chamado está sob responsabilidade do usuário atual (fila do papel ou atribuído a ele). */
function isMyQueue(t) {
  if (CLOSED_STATUSES.includes(t.status) || !t.assignedRole) return false;
  if (isAdmin()) return true;
  if (t.assignedTo) return t.assignedTo === currentUser.id;
  return t.assignedRole === currentUser.role;
}
function queueTickets() { return state.tickets.filter(isMyQueue); }

function addHistory(ticket, text) {
  ticket.history = ticket.history || [];
  ticket.history.push({ text, at: Date.now() });
  ticket.updatedAt = Date.now();
}

/* ---------------- Toasts ---------------- */
function toast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  }, 2800);
}

/* ============================================================
   Construção do header / sidebar / overview
   ============================================================ */
function mi(icon, text) {
  return `<span class="mi-label"><span class="mi-icon">${icon}</span><span class="mi-text">${text}</span></span>`;
}

function buildHeader() {
  return `
    <div class="logo">
      <div class="logo-icon"></div>
      <span class="logo-text"><strong>sea</strong> <em>IT Center</em></span>
    </div>
    <div class="global-search">
      <span class="gs-icon">${ICO.search}</span>
      <input type="text" id="global-search-input" placeholder="O que você precisa? Pesquise serviços, chamados, sistemas...">
      <span class="kbd">Ctrl + K</span>
    </div>
    <div class="header-right">
      <button class="btn btn-header-new" id="btn-new-ticket">${ICO.plus}<span>Novo chamado</span></button>
      <button class="header-icon-btn" id="btn-theme" title="Alternar tema">${ICO.moon}</button>
      <button class="header-icon-btn" id="btn-notifications" title="Notificações">
        ${ICO.bell}<span class="badge-count hidden" id="notif-badge">0</span>
      </button>
      <button class="header-icon-btn" data-static title="Ajuda">${ICO.help}</button>
      <button class="user-profile" id="btn-user-menu" type="button">
        <div class="avatar" id="user-avatar-display">WS</div>
        <div class="user-meta">
          <div class="user-name" id="user-name-display">—</div>
          <div class="user-role" id="user-role-display">—</div>
        </div>
        <span class="uc-chevron">${ICO.chevronDown}</span>
      </button>
    </div>
    <div class="dropdown-panel" id="notif-panel">
      <div class="dropdown-header">Notificações</div>
      <div id="notif-list"></div>
    </div>
    <div class="dropdown-panel dropdown-user" id="user-menu"></div>
  `;
}

function renderUserMenu() {
  const el = document.getElementById('user-menu');
  if (!el) return;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  el.innerHTML = `
    <div class="um-head">
      <div class="avatar avatar-lg">${escapeHtml(initialsOf(currentUser.name))}</div>
      <div class="um-id">
        <div class="um-name">${escapeHtml(currentUser.name)}</div>
        <div class="um-email">${escapeHtml(currentUser.email)}</div>
        <div class="um-role-tag">${escapeHtml(currentUser.role)}</div>
      </div>
    </div>
    <button class="um-item" id="um-theme">
      <span class="um-item-ico">${dark ? ICO.sun : ICO.moon}</span>
      <span>${dark ? 'Modo claro' : 'Modo escuro'}</span>
    </button>
    ${isAdmin() ? `<button class="um-item" data-view-nav="users"><span class="um-item-ico">${ICO.users}</span><span>Gerenciar usuários</span></button>` : ''}
    <button class="um-item um-item-danger" id="um-logout"><span class="um-item-ico">${ICO.logout}</span><span>Sair</span></button>
  `;
}

function buildSidebar() {
  const serviceItems = CATEGORIES.filter((c) => c.id !== 'other').map((c) => `
    <button class="menu-item" data-view="catalog" data-category="${c.id}">
      ${mi(catIconHtml(c), escapeHtml(c.label))}
      <span class="mi-chevron">${ICO.chevronRight}</span>
    </button>`).join('');

  const handlerItem = isHandler()
    ? `<button class="menu-item" data-view="queue">${mi(ICO.briefcase, 'Fila de Atendimento')}<span class="mi-count" data-count="queue">0</span></button>`
    : '';
  const adminSection = isAdmin()
    ? `<div class="menu-section menu-section-footer">
         <div class="menu-label">Administração</div>
         <button class="menu-item" data-view="users">${mi(ICO.users, 'Usuários')}</button>
         <button class="menu-item" data-view="catalog" data-category="__admin__">${mi(ICO.settings, 'Editar catálogo')}</button>
       </div>`
    : '';

  return `
    <div class="sidebar-scroll">
      <div class="menu-section">
        <button class="menu-item" data-view="overview">${mi(ICO.home, 'Overview')}</button>
        <button class="menu-item" data-view="tickets">${mi(ICO.inbox, 'Meus Chamados')}<span class="mi-count" data-count="tickets">0</span></button>
        ${handlerItem}
        <button class="menu-item" data-view="approvals">${mi(ICO.checkCircle, 'Minhas Aprovações')}<span class="mi-count" data-count="approvals">0</span></button>
        <button class="menu-item" data-view="watching">${mi(ICO.eye, 'Observando')}<span class="mi-count hidden" data-count="watching">0</span></button>
        <button class="menu-item" data-view="assets">${mi(ICO.device, 'Meus Ativos')}</button>
      </div>
      <div class="menu-section">
        <div class="menu-label">Serviços</div>
        ${serviceItems}
      </div>
      ${adminSection}
    </div>
    <button class="sidebar-collapse" id="sidebar-collapse">${ICO.collapse}<span>Recolher menu</span></button>
  `;
}

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = buildSidebar();
  const collapse = document.getElementById('sidebar-collapse');
  if (collapse) collapse.addEventListener('click', () => sb.classList.toggle('collapsed'));
  // marca item ativo
  document.querySelectorAll('.menu-item').forEach((m) => {
    const mv = m.getAttribute('data-view');
    const mc = m.getAttribute('data-category');
    m.classList.toggle('active', mv === activeView && (activeView !== 'catalog' || mc === activeCategory));
  });
}

function buildOverviewSkeleton() {
  return `
    <div class="hero">
      <div class="hero-dots"></div>
      <div class="hero-text">
        <h1 id="hero-greeting">Bom dia!</h1>
        <p>Como podemos ajudar você hoje?</p>
        <div class="hero-search">
          <span class="hs-icon">${ICO.search}</span>
          <input type="text" id="hero-search-input" placeholder="Descreva o que você precisa ou pesquise um serviço...">
          <button id="hero-search-btn">${ICO.arrowRight}</button>
        </div>
        <div class="chip-row">
          <span class="chip-label">Exemplos populares:</span>
          <button class="chip" data-chip="Notebook">Notebook</button>
          <button class="chip" data-chip="Acesso">Acesso ao sistema</button>
          <button class="chip" data-chip="Software">Instalar software</button>
          <button class="chip" data-chip="Senha">Recuperar senha</button>
          <button class="chip" data-chip="Impressora">Impressora</button>
        </div>
      </div>
      <div class="hero-illustration">${ILLUSTRATION}</div>
    </div>

    <div class="panel activity-panel">
      <div class="panel-header">
        <div class="panel-title">Minha atividade</div>
        <button class="panel-link" data-stat-nav="tickets">Ver relatório completo</button>
      </div>
      <div class="stat-grid">
        <div class="stat-card" data-stat-nav="tickets"><div class="stat-icon stat-icon-blue">${ICO.laptop}</div><div class="stat-value" id="stat-abertos">0</div><div class="stat-label">Abertos</div></div>
        <div class="stat-card" data-stat-nav="tickets"><div class="stat-icon stat-icon-orange">${ICO.clock}</div><div class="stat-value" id="stat-analise">0</div><div class="stat-label">Em análise</div></div>
        <div class="stat-card" data-stat-nav="tickets"><div class="stat-icon stat-icon-green">${ICO.checkCircle}</div><div class="stat-value" id="stat-resolvidos">0</div><div class="stat-label">Resolvidos</div></div>
        <div class="stat-card" data-stat-nav="approvals"><div class="stat-icon stat-icon-purple">${ICO.users}</div><div class="stat-value" id="stat-aguardando">0</div><div class="stat-label">Aguardando<br>aprovação</div></div>
      </div>
    </div>

    <div class="panel quick-access-panel">
      <div class="panel-header">
        <div class="panel-title">Acesso rápido</div>
        <button class="panel-link" data-view-nav="catalog">Ver todos os serviços</button>
      </div>
      <div class="quick-grid">
        <div class="quick-card" data-quick-category="hardware"><div class="qc-icon qc-icon-purple">${ICO.laptop}</div><div class="qc-title">Hardware</div><div class="qc-desc">Equipamentos e acessórios</div></div>
        <div class="quick-card" data-quick-category="software"><div class="qc-icon qc-icon-green">${ICO.grid}</div><div class="qc-title">Software</div><div class="qc-desc">Aplicativos e licenças</div></div>
        <div class="quick-card quick-card-accent" data-quick-category="access"><div class="qc-icon qc-icon-orange">${ICO.key}</div><div class="qc-title">Acessos</div><div class="qc-desc">Sistemas e permissões</div></div>
        <div class="quick-card" data-quick-category="network"><div class="qc-icon qc-icon-blue">${ICO.globe}</div><div class="qc-title">Rede</div><div class="qc-desc">Conectividade e VPN</div></div>
        <div class="quick-card" data-quick-category="google"><div class="qc-icon qc-icon-rainbow">${ICO.cloud}</div><div class="qc-title">Google Workspace</div><div class="qc-desc">Apps corporativos</div></div>
      </div>
    </div>

    <div class="left-stack">
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Serviços recomendados para você</div><span class="panel-hint">Baseado no seu perfil e uso</span></div>
        <div id="recommended-list"></div>
        <button class="panel-footer-link" data-view-nav="catalog">Ver todos os serviços recomendados</button>
      </div>
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Meus chamados recentes</div><button class="panel-link" data-stat-nav="tickets">Ver todos</button></div>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Serviço</th><th>Status</th><th>Atualizado</th></tr></thead><tbody id="recent-tickets-body"></tbody></table></div>
      </div>
    </div>

    <div class="right-stack">
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Aprovações pendentes</div><button class="panel-link" data-stat-nav="approvals">Ver todas</button></div>
        <div id="approvals-list"></div>
      </div>
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Comunicados importantes</div><button class="panel-link" data-static>Ver todos</button></div>
        <div class="list-row list-row-static"><div class="lr-left"><div class="lr-icon lr-icon-red">${ICO.shield}</div><div><div class="lr-title">Manutenção programada</div><div class="lr-meta">Sistema de chamados estará em manutenção</div><div class="lr-date">25/06/2024 às 22:00</div></div></div></div>
        <div class="list-row list-row-static"><div class="lr-left"><div class="lr-icon lr-icon-purple">${ICO.lock}</div><div><div class="lr-title">Lembrete de segurança</div><div class="lr-meta">Atualize sua senha regularmente</div><div class="lr-date">20/06/2024</div></div></div></div>
      </div>
    </div>
  `;
}

/* ============================================================
   Navegação entre views
   ============================================================ */
let activeView = 'overview';
let activeCategory = null;
let catalogSearchTerm = '';

function switchView(view, opts = {}) {
  activeView = view;
  if (opts.category !== undefined) activeCategory = opts.category;
  if (opts.search !== undefined) catalogSearchTerm = opts.search;

  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(`view-${view}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.menu-item').forEach((m) => {
    const mv = m.getAttribute('data-view');
    const mc = m.getAttribute('data-category');
    m.classList.toggle('active', mv === view && (view !== 'catalog' || mc === activeCategory));
  });

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function renderCurrentView() {
  switch (activeView) {
    case 'overview': renderOverview(); break;
    case 'catalog': renderCatalog(); break;
    case 'tickets': renderTicketTable('view-tickets-body', myTickets(), 'Você ainda não abriu nenhum chamado.'); break;
    case 'approvals': renderApprovals(); break;
    case 'queue': renderQueue(); break;
    case 'watching': renderTicketTable('view-watching-body', watchedTickets(), 'Você não está observando nenhum chamado.'); break;
    case 'assets': renderAssets(); break;
    case 'users': renderUsers(); break;
  }
  updateBadges();
}

function updateBadges() {
  const pending = pendingApprovals().length;
  const openCount = myTickets().filter((t) => OPEN_STATUSES.includes(t.status)).length;
  const queueCount = isHandler() ? queueTickets().length : 0;

  document.querySelectorAll('[data-count="approvals"]').forEach((el) => { el.textContent = pending; el.classList.toggle('hidden', pending === 0); });
  document.querySelectorAll('[data-count="tickets"]').forEach((el) => { el.textContent = openCount; el.classList.toggle('hidden', openCount === 0); });
  document.querySelectorAll('[data-count="queue"]').forEach((el) => { el.textContent = queueCount; el.classList.toggle('hidden', queueCount === 0); });
  document.querySelectorAll('[data-count="watching"]').forEach((el) => { el.textContent = watchedTickets().length; el.classList.toggle('hidden', watchedTickets().length === 0); });

  const bell = document.getElementById('notif-badge');
  const notifCount = pending + queueCount;
  bell.textContent = notifCount;
  bell.classList.toggle('hidden', notifCount === 0);
}

/* ---------------- Overview ---------------- */
function renderOverview() {
  document.getElementById('hero-greeting').textContent = `${greeting()}, ${currentUser.name.split(' ')[0]}!`;

  const mine = myTickets();
  document.getElementById('stat-abertos').textContent = mine.filter((t) => OPEN_STATUSES.includes(t.status)).length;
  document.getElementById('stat-analise').textContent = mine.filter((t) => t.status === STATUS.ANALISE).length;
  document.getElementById('stat-resolvidos').textContent = mine.filter((t) => t.status === STATUS.RESOLVIDO).length;
  document.getElementById('stat-aguardando').textContent = mine.filter((t) => t.status === STATUS.AGUARDANDO).length;

  const recommended = [
    { category: 'hardware', title: 'Notebook', eta: '~2 min' },
    { category: 'access', title: 'Acesso ao Sistema Financeiro', eta: '~3 min' },
    { category: 'software', title: 'Microsoft Power BI Pro', eta: '~5 min' },
  ];
  document.getElementById('recommended-list').innerHTML = recommended.map((r) => `
    <div class="list-row" data-open-service="${r.category}::${escapeHtml(r.title)}">
      <div class="lr-left"><div class="lr-icon">${catIconOr(r.category)}</div>
        <div><div class="lr-title">${escapeHtml(r.title)}</div><div class="lr-meta">${escapeHtml(categoryLabel(r.category))}</div></div></div>
      <div class="lr-right"><span class="lr-meta">${r.eta}</span> <button class="icon-btn icon-btn-accent">${ICO.arrowRight}</button></div>
    </div>`).join('');

  const recent = [...mine].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  document.getElementById('recent-tickets-body').innerHTML = recent.length ? recent.map((t) => `
    <tr data-ticket="${t.id}"><td class="mono">${t.id}</td><td>${escapeHtml(t.service || t.title)}</td><td>${statusBadge(t.status)}</td><td>${formatSmartDate(t.updatedAt)}</td></tr>`).join('')
    : `<tr><td colspan="4" class="empty-state">Nenhum chamado ainda.</td></tr>`;

  const pend = pendingApprovals().slice(0, 5);
  document.getElementById('approvals-list').innerHTML = pend.length ? pend.map((t) => `
    <div class="list-row" data-ticket="${t.id}">
      <div class="lr-left"><div class="lr-icon">${ICO.ticket}</div>
        <div><div class="lr-title">${escapeHtml(t.service || t.title)}</div><div class="lr-meta">Solicitado por: ${escapeHtml(t.requester)} · ${timeAgo(t.createdAt)}</div></div></div>
      <div class="lr-right"><button class="icon-btn approve" data-approve="${t.id}" title="Aprovar">✓</button><button class="icon-btn reject" data-reject="${t.id}" title="Rejeitar">✕</button></div>
    </div>`).join('') : `<div class="empty-state">Nenhuma aprovação pendente.</div>`;
}

function catIconOr(catId) {
  const c = CATEGORIES.find((x) => x.id === catId);
  return c ? catIconHtml(c) : ICO.ticket;
}

function findServiceByTitle(category, title) {
  const groups = SERVICES[category] || [];
  for (const g of groups) { const item = g.items.find((i) => i.title === title); if (item) return item; }
  return null;
}
function findServiceById(id) {
  for (const catId of Object.keys(SERVICES)) {
    for (const g of SERVICES[catId]) {
      const it = g.items.find((i) => i.id === id);
      if (it) return { item: it, group: g, catId };
    }
  }
  return null;
}

/* ---------------- Catálogo ---------------- */
function renderCategoryTabs() {
  const wrap = document.getElementById('category-tabs');
  wrap.innerHTML = `<button class="category-tab ${!activeCategory ? 'active' : ''}" data-cat-tab="">Todos</button>` +
    CATEGORIES.map((c) => `<button class="category-tab ${activeCategory === c.id ? 'active' : ''}" data-cat-tab="${c.id}">${escapeHtml(c.icon || '')} ${escapeHtml(c.label)}</button>`).join('');
}

function renderCatalog() {
  const adminMode = isAdmin() && activeCategory === '__admin__';
  document.getElementById('catalog-admin-bar').innerHTML = isAdmin() ? `
    <div class="admin-bar">
      <div class="admin-bar-info">${adminMode ? '✎ Modo edição do catálogo ativo — inclua, edite ou exclua categorias e serviços.' : 'Você é administrador. Abra “Editar catálogo” no menu para gerenciar.'}</div>
      <div class="admin-bar-actions">
        ${adminMode ? `<button class="btn btn-secondary btn-sm" data-new-category>${ICO.plus} Nova categoria</button>` : `<button class="btn btn-secondary btn-sm" data-view="catalog" data-category="__admin__">${ICO.edit} Editar catálogo</button>`}
      </div>
    </div>` : '';

  renderCategoryTabs();
  document.getElementById('catalog-search').value = catalogSearchTerm;

  const showAll = !activeCategory || activeCategory === '__admin__';
  const categoriesToShow = showAll ? CATEGORIES.map((c) => c.id) : [activeCategory];
  const term = catalogSearchTerm.trim().toLowerCase();

  let html = '';
  categoriesToShow.forEach((catId) => {
    const groups = SERVICES[catId] || [];
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;
    let catHtml = '';

    groups.forEach((group) => {
      const items = group.items.filter((i) => !term || i.title.toLowerCase().includes(term) || (i.desc || '').toLowerCase().includes(term));
      if (!items.length && !adminMode) return;
      catHtml += `<div class="section-subtitle">${escapeHtml(group.sub)}</div>
        <div class="card-grid">
          ${items.map((i) => `
            <div class="service-card ${adminMode ? 'service-card-admin' : ''}" ${adminMode ? '' : `data-open-service="${catId}::${escapeHtml(i.title)}"`}>
              <div class="card-icon">${escapeHtml(i.icon || '📄')}</div>
              <div class="card-title">${escapeHtml(i.title)}</div>
              <div class="card-description">${escapeHtml(i.desc || '')}</div>
              ${i.approval ? `<div class="card-approval-tag">Requer aprovação</div>` : ''}
              ${adminMode ? `<div class="card-admin-actions">
                <button class="icon-btn" data-edit-service="${i.id}" title="Editar">${ICO.edit}</button>
                <button class="icon-btn icon-btn-danger" data-delete-service="${i.id}" title="Excluir">${ICO.trash}</button>
              </div>` : ''}
            </div>`).join('')}
          ${adminMode ? `<button class="service-card service-card-add" data-new-service="${catId}::${escapeHtml(group.sub)}">${ICO.plus}<span>Novo serviço</span></button>` : ''}
        </div>`;
    });

    if (adminMode && !groups.length) {
      catHtml += `<div class="card-grid"><button class="service-card service-card-add" data-new-service="${catId}::Serviços">${ICO.plus}<span>Novo serviço</span></button></div>`;
    }

    if (catHtml || adminMode) {
      html += `<div class="section">
        <div class="section-title">
          <div class="section-accent"></div>${escapeHtml(cat.icon || '')} ${escapeHtml(cat.label)}
          ${adminMode ? `<div class="section-admin-actions">
            <button class="icon-btn" data-edit-category="${cat.id}" title="Renomear categoria">${ICO.edit}</button>
            <button class="icon-btn icon-btn-danger" data-delete-category="${cat.id}" title="Excluir categoria">${ICO.trash}</button>
          </div>` : ''}
        </div>
        ${catHtml}
      </div>`;
    }
  });

  document.getElementById('catalog-content').innerHTML = html || `<div class="empty-state">Nenhum serviço encontrado para "${escapeHtml(catalogSearchTerm)}".</div>`;
}

/* ---------------- Tabelas / listas de chamados ---------------- */
function renderTicketTable(bodyId, tickets, emptyMsg) {
  const sorted = [...tickets].sort((a, b) => b.updatedAt - a.updatedAt);
  document.getElementById(bodyId).innerHTML = sorted.length ? sorted.map((t) => `
    <tr data-ticket="${t.id}">
      <td class="mono">${t.id}</td>
      <td>${escapeHtml(t.service || t.title)}</td>
      <td>${escapeHtml(categoryLabel(t.category))}</td>
      <td>${escapeHtml(t.requester)}</td>
      <td class="${priorityClass(t.priority)}">${escapeHtml(t.priority)}</td>
      <td>${statusBadge(t.status)}</td>
      <td>${timeAgo(t.updatedAt)}</td>
    </tr>`).join('') : `<tr><td colspan="7" class="empty-state">${emptyMsg}</td></tr>`;
}

function renderApprovals() {
  const pend = pendingApprovals();
  document.getElementById('approvals-full-list').innerHTML = pend.length ? pend.map((t) => `
    <div class="panel" style="margin-bottom:10px;">
      <div class="list-row" data-ticket="${t.id}" style="padding:0;">
        <div class="lr-left"><div class="lr-icon">${ICO.ticket}</div>
          <div><div class="lr-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span></div>
          <div class="lr-meta">Solicitado por ${escapeHtml(t.requester)} · ${escapeHtml(categoryLabel(t.category))} · ${timeAgo(t.createdAt)}</div></div></div>
        <div class="lr-right">
          <button class="btn btn-secondary btn-sm" data-ticket="${t.id}">Ver detalhes</button>
          <button class="icon-btn approve" data-approve="${t.id}" title="Aprovar">✓</button>
          <button class="icon-btn reject" data-reject="${t.id}" title="Rejeitar">✕</button>
        </div>
      </div>
    </div>`).join('') : `<div class="empty-state">Nenhuma aprovação pendente. 🎉</div>`;
}

/* ---------------- Fila de atendimento (hierarquia) ---------------- */
function renderQueue() {
  const tickets = queueTickets().sort((a, b) => b.updatedAt - a.updatedAt);
  const sub = document.getElementById('queue-subtitle');
  if (sub) sub.textContent = isAdmin()
    ? 'Todos os chamados em atendimento na organização'
    : `Chamados na fila do seu papel (${currentUser.role}) e atribuídos a você`;

  document.getElementById('queue-list').innerHTML = tickets.length ? tickets.map((t) => {
    const who = t.assignedTo ? (findUser(t.assignedTo)?.name || '—') : `Fila: ${t.assignedRole}`;
    return `<div class="panel queue-card" style="margin-bottom:10px;">
      <div class="list-row" data-ticket="${t.id}" style="padding:0;">
        <div class="lr-left"><div class="lr-icon">${catIconOr(t.category)}</div>
          <div>
            <div class="lr-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span> ${statusBadge(t.status)}</div>
            <div class="lr-meta">Solicitante: ${escapeHtml(t.requester)} · ${escapeHtml(categoryLabel(t.category))} · <span class="${priorityClass(t.priority)}">${escapeHtml(t.priority)}</span></div>
            <div class="lr-meta">Responsável atual: <strong>${escapeHtml(who)}</strong> · ${timeAgo(t.updatedAt)}</div>
          </div></div>
        <div class="lr-right">${queueActionButtons(t)}</div>
      </div>
    </div>`;
  }).join('') : `<div class="empty-state">Nenhum chamado na sua fila de atendimento no momento. 🎉</div>`;
}

function queueActionButtons(t) {
  const canForward = rolesBelow(currentUser.role).length > 0;
  const notMine = !t.assignedTo || t.assignedTo !== currentUser.id;
  return `
    ${notMine && !isAdmin() ? `<button class="btn btn-secondary btn-sm" data-assume="${t.id}">Assumir</button>` : ''}
    ${canForward ? `<button class="btn btn-secondary btn-sm" data-forward="${t.id}">${ICO.forward} Encaminhar</button>` : ''}
    <button class="btn btn-primary btn-sm" data-resolve="${t.id}">Resolver</button>
  `;
}

/* ---------------- Meus ativos ---------------- */
function renderAssets() {
  const assets = state.tickets.filter((t) => t.requester === currentUser.name && t.status === STATUS.RESOLVIDO && (t.category === 'hardware' || t.category === 'software'));
  document.getElementById('assets-list').innerHTML = assets.length ? assets.map((t) => `
    <div class="list-row" data-ticket="${t.id}">
      <div class="lr-left"><div class="lr-icon">${t.category === 'hardware' ? ICO.laptop : ICO.grid}</div>
        <div><div class="lr-title">${escapeHtml(t.service || t.title)}</div><div class="lr-meta">Atribuído em ${formatDateTime(t.updatedAt)} · ${t.id}</div></div></div>
      <div class="lr-right"><button class="btn btn-secondary btn-sm" data-report-asset="${t.id}">Reportar problema</button></div>
    </div>`).join('') : `<div class="empty-state">Nenhum ativo atribuído ainda. Ativos aparecem aqui quando um chamado de hardware/software é resolvido.</div>`;
}

/* ---------------- Usuários (admin) ---------------- */
function renderUsers() {
  const rows = [...state.users].sort((a, b) => (a.role.localeCompare(b.role)) || a.name.localeCompare(b.name));
  document.getElementById('users-body').innerHTML = rows.map((u) => `
    <tr>
      <td><div class="user-cell"><div class="avatar avatar-sm">${escapeHtml(initialsOf(u.name))}</div><div><div class="uc-name">${escapeHtml(u.name)}${u.id === currentUser.id ? ' <span class="mono">(você)</span>' : ''}</div><div class="uc-email">${escapeHtml(u.email)}</div></div></div></td>
      <td><span class="role-tag">${escapeHtml(u.role)}</span></td>
      <td>${u.active ? '<span class="badge badge-aprovado">Ativo</span>' : '<span class="badge badge-cancelado">Inativo</span>'}</td>
      <td class="ta-right">
        <button class="icon-btn" data-edit-user="${u.id}" title="Editar">${ICO.edit}</button>
        <button class="icon-btn icon-btn-danger" data-delete-user="${u.id}" title="Excluir" ${u.id === currentUser.id ? 'disabled' : ''}>${ICO.trash}</button>
      </td>
    </tr>`).join('');
}

/* ============================================================
   Modais
   ============================================================ */
function setModalOrigin(modalEl, originEvent) {
  if (!modalEl) return;
  if (originEvent && typeof originEvent.clientX === 'number' && window.innerWidth && window.innerHeight) {
    modalEl.style.setProperty('--origin-x', `${(originEvent.clientX / window.innerWidth) * 100}%`);
    modalEl.style.setProperty('--origin-y', `${(originEvent.clientY / window.innerHeight) * 100}%`);
  } else {
    modalEl.style.removeProperty('--origin-x'); modalEl.style.removeProperty('--origin-y');
  }
}
function openModal(id, originEvent) {
  const overlay = document.getElementById(id);
  setModalOrigin(overlay.querySelector('.modal'), originEvent);
  overlay.classList.add('open');
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ----- Modal: Novo chamado ----- */
const ticketForm = () => document.getElementById('ticket-form');
function openNewTicketModal(category, serviceTitle, originEvent) {
  const form = ticketForm();
  form.reset();
  const catSelect = document.getElementById('field-category');
  catSelect.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${escapeHtml(c.icon || '')} ${escapeHtml(c.label)}</option>`).join('');
  catSelect.value = category || (CATEGORIES[0] && CATEGORIES[0].id) || '';
  document.getElementById('field-service').value = serviceTitle || '';
  document.getElementById('field-title').value = serviceTitle || '';
  document.getElementById('field-description').value = '';
  document.getElementById('field-priority').value = 'Média';
  const svc = category && serviceTitle ? findServiceByTitle(category, serviceTitle) : null;
  document.getElementById('new-ticket-approval-note').style.display = svc && svc.approval ? 'block' : 'none';
  form.dataset.approval = svc && svc.approval ? '1' : '0';
  document.getElementById('ticket-modal-title').textContent = serviceTitle ? `Solicitar: ${serviceTitle}` : 'Abrir novo chamado';
  openModal('ticket-modal', originEvent);
  document.getElementById('field-title').focus();
}

/* ----- Modal: Detalhe do chamado ----- */
function openTicketDetail(id, originEvent) {
  const t = findTicket(id);
  if (!t) return;
  renderTicketDetail(t);
  openModal('detail-modal', originEvent);
}
function renderTicketDetail(t) {
  document.getElementById('detail-modal-title').textContent = `${t.service || t.title} · ${t.id}`;
  const responsavel = t.assignedTo ? (findUser(t.assignedTo)?.name || '—') : (t.assignedRole ? `Fila: ${t.assignedRole}` : '—');
  document.getElementById('detail-meta').innerHTML = `
    <div class="detail-meta-item"><div class="detail-meta-label">Status</div><div class="detail-meta-value">${statusBadge(t.status)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Categoria</div><div class="detail-meta-value">${escapeHtml(categoryLabel(t.category))}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Solicitante</div><div class="detail-meta-value">${escapeHtml(t.requester)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Prioridade</div><div class="detail-meta-value ${priorityClass(t.priority)}">${escapeHtml(t.priority)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Responsável</div><div class="detail-meta-value">${escapeHtml(responsavel)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Atualizado em</div><div class="detail-meta-value">${formatDateTime(t.updatedAt)}</div></div>
  `;
  document.getElementById('detail-desc').textContent = t.description;

  const hist = [...(t.history || [])].sort((a, b) => b.at - a.at);
  document.getElementById('detail-timeline').innerHTML = hist.map((h) => `
    <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-text">${escapeHtml(h.text)}</div><div class="timeline-time">${formatDateTime(h.at)}</div></div></div>`).join('');

  const isWatching = (state.watching || []).includes(t.id);
  const isCancellable = !CLOSED_STATUSES.includes(t.status) && t.requester === currentUser.name;
  const isReopenable = [STATUS.RESOLVIDO, STATUS.CANCELADO].includes(t.status) && t.requester === currentUser.name;
  const canApprove = t.approvalNeeded && t.status === STATUS.AGUARDANDO && t.requester !== currentUser.name && (isHandler());
  const mine = isMyQueue(t);
  const canForward = mine && rolesBelow(currentUser.role).length > 0;

  document.getElementById('detail-actions').innerHTML = `
    <button class="btn btn-secondary btn-sm" data-detail-watch="${t.id}">${isWatching ? '★ Deixar de observar' : '☆ Observar'}</button>
    ${canApprove ? `<button class="btn btn-primary btn-sm" data-detail-approve="${t.id}">Aprovar</button><button class="btn btn-danger btn-sm" data-detail-reject="${t.id}">Rejeitar</button>` : ''}
    ${mine && (!t.assignedTo || t.assignedTo !== currentUser.id) && !isAdmin() ? `<button class="btn btn-secondary btn-sm" data-detail-assume="${t.id}">Assumir</button>` : ''}
    ${canForward ? `<button class="btn btn-secondary btn-sm" data-detail-forward="${t.id}">${ICO.forward} Encaminhar</button>` : ''}
    ${mine ? `<button class="btn btn-primary btn-sm" data-detail-resolve="${t.id}">Resolver</button>` : ''}
    ${isReopenable ? `<button class="btn btn-secondary btn-sm" data-detail-reopen="${t.id}">Reabrir chamado</button>` : ''}
    ${isCancellable ? `<button class="btn btn-danger btn-sm" data-detail-cancel="${t.id}">Cancelar chamado</button>` : ''}
  `;
  document.getElementById('detail-comment-form').dataset.ticket = t.id;
}

/* ----- Modal: Encaminhar (hierarquia) ----- */
let forwardTicketId = null;
function openForwardModal(ticketId, originEvent) {
  const t = findTicket(ticketId);
  if (!t) return;
  forwardTicketId = ticketId;
  const roles = rolesBelow(currentUser.role);
  const roleSel = document.getElementById('forward-role');
  roleSel.innerHTML = roles.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');
  document.getElementById('forward-ticket-label').textContent = `${t.service || t.title} · ${t.id}`;
  fillForwardPeople(roles[0]);
  document.getElementById('forward-note').value = '';
  openModal('forward-modal', originEvent);
}
function fillForwardPeople(role) {
  const people = usersByRole(role);
  const sel = document.getElementById('forward-user');
  sel.innerHTML = people.length
    ? people.map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('')
    : `<option value="">— Nenhum usuário com esse papel —</option>`;
}

/* ----- Modal: Usuário (admin) ----- */
let editingUserId = null;
function openUserModal(userId, originEvent) {
  editingUserId = userId || null;
  const u = userId ? findUser(userId) : null;
  document.getElementById('user-modal-title').textContent = u ? 'Editar usuário' : 'Novo usuário';
  document.getElementById('u-name').value = u ? u.name : '';
  document.getElementById('u-email').value = u ? u.email : '';
  document.getElementById('u-password').value = u ? u.password : '';
  const roleSel = document.getElementById('u-role');
  roleSel.innerHTML = ALL_ROLES.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');
  roleSel.value = u ? u.role : ROLE.COLABORADOR;
  document.getElementById('u-active').checked = u ? !!u.active : true;
  openModal('user-modal', originEvent);
  document.getElementById('u-name').focus();
}

/* ----- Modal: Categoria (admin) ----- */
let editingCategoryId = null;
function openCategoryModal(catId, originEvent) {
  editingCategoryId = catId || null;
  const c = catId ? CATEGORIES.find((x) => x.id === catId) : null;
  document.getElementById('category-modal-title').textContent = c ? 'Renomear categoria' : 'Nova categoria';
  document.getElementById('cat-label').value = c ? c.label : '';
  document.getElementById('cat-icon').value = c ? (c.icon || '') : '📁';
  openModal('category-modal', originEvent);
  document.getElementById('cat-label').focus();
}

/* ----- Modal: Serviço (admin) ----- */
let editingServiceId = null;
let newServiceTarget = null; // { catId, sub }
function openServiceModal(opts, originEvent) {
  editingServiceId = opts.serviceId || null;
  newServiceTarget = opts.target || null;
  const found = editingServiceId ? findServiceById(editingServiceId) : null;
  const it = found ? found.item : null;
  document.getElementById('service-modal-title').textContent = it ? 'Editar serviço' : 'Novo serviço';
  document.getElementById('svc-title').value = it ? it.title : '';
  document.getElementById('svc-desc').value = it ? (it.desc || '') : '';
  document.getElementById('svc-icon').value = it ? (it.icon || '📄') : '📄';
  document.getElementById('svc-approval').checked = it ? !!it.approval : false;
  const catSel = document.getElementById('svc-category');
  catSel.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${escapeHtml(c.label)}</option>`).join('');
  catSel.value = found ? found.catId : (newServiceTarget ? newServiceTarget.catId : CATEGORIES[0].id);
  document.getElementById('svc-group').value = found ? found.group.sub : (newServiceTarget ? newServiceTarget.sub : 'Serviços');
  openModal('service-modal', originEvent);
  document.getElementById('svc-title').focus();
}

/* ============================================================
   Ações de chamado
   ============================================================ */
function approveTicket(id) {
  const t = findTicket(id); if (!t) return;
  t.status = STATUS.ANDAMENTO;
  if (!t.assignedRole) t.assignedRole = ROLE.COORDENADOR;
  addHistory(t, `Aprovado por ${currentUser.name}`);
  saveState(); toast(`Chamado ${id} aprovado.`); renderCurrentView();
}
function rejectTicket(id) {
  const t = findTicket(id); if (!t) return;
  t.status = STATUS.REJEITADO; addHistory(t, `Rejeitado por ${currentUser.name}`);
  saveState(); toast(`Chamado ${id} rejeitado.`, 'error'); renderCurrentView();
}
function resolveTicket(id) {
  const t = findTicket(id); if (!t) return;
  t.status = STATUS.RESOLVIDO; addHistory(t, `Chamado marcado como resolvido por ${currentUser.name}`);
  saveState(); toast(`Chamado ${id} marcado como resolvido.`); renderCurrentView();
}
function cancelTicket(id) {
  const t = findTicket(id); if (!t) return;
  t.status = STATUS.CANCELADO; addHistory(t, `Chamado cancelado por ${currentUser.name}`);
  saveState(); toast(`Chamado ${id} cancelado.`); renderCurrentView();
}
function reopenTicket(id) {
  const t = findTicket(id); if (!t) return;
  t.status = STATUS.ABERTO; if (!t.assignedRole) t.assignedRole = ROLE.COORDENADOR;
  addHistory(t, `Chamado reaberto por ${currentUser.name}`);
  saveState(); toast(`Chamado ${id} reaberto.`); renderCurrentView();
}
function assumeTicket(id) {
  const t = findTicket(id); if (!t) return;
  t.assignedTo = currentUser.id; t.assignedRole = currentUser.role;
  if (t.status === STATUS.ANALISE) t.status = STATUS.ANDAMENTO;
  addHistory(t, `Assumido por ${currentUser.name} (${currentUser.role})`);
  saveState(); toast(`Você assumiu o chamado ${id}.`); renderCurrentView();
}
function forwardTicket(id, toUserId, role, note) {
  const t = findTicket(id); if (!t) return;
  const to = findUser(toUserId);
  t.assignedRole = role;
  t.assignedTo = toUserId || null;
  t.status = STATUS.ANDAMENTO;
  t.assignmentChain = t.assignmentChain || [];
  t.assignmentChain.push({ role, userId: toUserId, name: to ? to.name : null, by: currentUser.name, at: Date.now() });
  addHistory(t, `Encaminhado para ${to ? to.name : role} (${role}) por ${currentUser.name}${note ? ` — "${note}"` : ''}`);
  saveState();
  toast(`Chamado ${id} encaminhado para ${to ? to.name : role}.`);
  renderCurrentView();
}
function toggleWatch(id) {
  state.watching = state.watching || [];
  const idx = state.watching.indexOf(id);
  if (idx === -1) { state.watching.push(id); toast('Você está observando este chamado.'); }
  else { state.watching.splice(idx, 1); toast('Você deixou de observar este chamado.'); }
  saveState(); renderCurrentView();
}

/* ============================================================
   CRUD do catálogo (admin)
   ============================================================ */
function saveCategory(label, icon) {
  label = label.trim(); if (!label) { toast('Informe o nome da categoria.', 'error'); return false; }
  if (editingCategoryId) {
    const c = CATEGORIES.find((x) => x.id === editingCategoryId);
    if (c) { c.label = label; c.icon = icon || c.icon; }
  } else {
    const id = 'cat-' + label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 5);
    state.categories.push({ id, label, icon: icon || '📁' });
    state.services[id] = [];
  }
  saveState(); syncCatalogRefs(); renderSidebar(); renderCatalog();
  toast('Categoria salva.'); return true;
}
function deleteCategory(catId) {
  const c = CATEGORIES.find((x) => x.id === catId); if (!c) return;
  if (!confirm(`Excluir a categoria "${c.label}" e todos os seus serviços?`)) return;
  state.categories = state.categories.filter((x) => x.id !== catId);
  delete state.services[catId];
  saveState(); syncCatalogRefs(); renderSidebar(); renderCatalog();
  toast('Categoria excluída.');
}
function saveService(data) {
  const title = data.title.trim();
  if (!title) { toast('Informe o nome do serviço.', 'error'); return false; }
  if (editingServiceId) {
    const found = findServiceById(editingServiceId); if (!found) return false;
    // se mudou de categoria/grupo, mover
    if (found.catId !== data.catId || found.group.sub !== data.group) {
      found.group.items = found.group.items.filter((i) => i.id !== editingServiceId);
      insertServiceItem(data.catId, data.group, found.item);
    }
    Object.assign(found.item, { title, desc: data.desc.trim(), icon: data.icon || '📄', approval: !!data.approval });
  } else {
    insertServiceItem(data.catId, data.group, { id: uid('svc'), title, desc: data.desc.trim(), icon: data.icon || '📄', approval: !!data.approval });
  }
  saveState(); syncCatalogRefs(); renderCatalog();
  toast('Serviço salvo.'); return true;
}
function insertServiceItem(catId, sub, item) {
  if (!state.services[catId]) state.services[catId] = [];
  let group = state.services[catId].find((g) => g.sub === sub);
  if (!group) { group = { sub: sub || 'Serviços', items: [] }; state.services[catId].push(group); }
  group.items.push(item);
}
function deleteService(id) {
  const found = findServiceById(id); if (!found) return;
  if (!confirm(`Excluir o serviço "${found.item.title}"?`)) return;
  found.group.items = found.group.items.filter((i) => i.id !== id);
  saveState(); syncCatalogRefs(); renderCatalog();
  toast('Serviço excluído.');
}

/* ============================================================
   CRUD de usuários (admin)
   ============================================================ */
function saveUser(data) {
  const name = data.name.trim(), email = data.email.trim().toLowerCase();
  if (!name || !email) { toast('Nome e e-mail são obrigatórios.', 'error'); return false; }
  if (!data.password) { toast('Defina uma senha.', 'error'); return false; }
  const dup = state.users.find((u) => u.email.toLowerCase() === email && u.id !== editingUserId);
  if (dup) { toast('Já existe um usuário com esse e-mail.', 'error'); return false; }
  if (editingUserId) {
    const u = findUser(editingUserId);
    Object.assign(u, { name, email, password: data.password, role: data.role, active: data.active });
    if (u.id === currentUser.id) currentUser = u;
  } else {
    state.users.push({ id: uid('u'), name, email, password: data.password, role: data.role, active: data.active, createdAt: Date.now() });
  }
  saveState();
  renderUsers(); renderSidebar(); refreshUserChrome();
  toast('Usuário salvo.'); return true;
}
function deleteUser(id) {
  if (id === currentUser.id) { toast('Você não pode excluir a própria conta.', 'error'); return; }
  const u = findUser(id); if (!u) return;
  if (!confirm(`Excluir o usuário "${u.name}"?`)) return;
  state.users = state.users.filter((x) => x.id !== id);
  saveState(); renderUsers();
  toast('Usuário excluído.');
}

/* ---------------- Notificações ---------------- */
function renderNotifications() {
  const mine = state.tickets.filter((t) => t.requester === currentUser.name)
    .map((t) => ({ t, last: t.history[t.history.length - 1] })).filter((x) => x.last);
  const queue = isHandler() ? queueTickets().map((t) => ({ t, last: t.history[t.history.length - 1], queue: true })) : [];
  const list = [...queue, ...mine].filter((x) => x.last).sort((a, b) => b.last.at - a.last.at).slice(0, 10);
  document.getElementById('notif-list').innerHTML = list.length ? list.map(({ t, last, queue }) => `
    <div class="dropdown-item" data-ticket="${t.id}">
      <div class="di-title">${queue ? '📥 ' : ''}${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span></div>
      <div class="di-meta">${escapeHtml(last.text)} · ${timeAgo(last.at)}</div>
    </div>`).join('') : `<div class="dropdown-empty">Sem notificações recentes.</div>`;
}

/* ============================================================
   Login
   ============================================================ */
function showLogin() {
  document.body.classList.add('logged-out');
  const err = document.getElementById('login-error');
  if (err) err.textContent = '';
  const email = document.getElementById('login-email');
  if (email) { email.value = ''; setTimeout(() => email.focus(), 50); }
  const pass = document.getElementById('login-password');
  if (pass) pass.value = '';
}
function attemptLogin(email, password) {
  email = String(email || '').trim().toLowerCase();
  const user = state.users.find((u) => u.email.toLowerCase() === email);
  if (!user || user.password !== password) return { ok: false, msg: 'E-mail ou senha inválidos.' };
  if (!user.active) return { ok: false, msg: 'Usuário inativo. Contate o administrador.' };
  return { ok: true, user };
}
function doLogout() {
  clearSession();
  currentUser = null;
  showLogin();
  toast('Sessão encerrada.');
}

function refreshUserChrome() {
  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('user-role-display').textContent = currentUser.role;
  document.getElementById('user-avatar-display').textContent = initialsOf(currentUser.name);
}

/* ============================================================
   Entrada no app (após login)
   ============================================================ */
let appBuilt = false;
function enterApp(user) {
  currentUser = user;
  saveSession(user);
  document.body.classList.remove('logged-out');

  if (!appBuilt) {
    document.getElementById('overview-grid').innerHTML = buildOverviewSkeleton();
    // busca (hero + global)
    wireSearchInput('global-search-input');
    wireSearchInput('hero-search-input');
    document.getElementById('hero-search-btn').addEventListener('click', () => {
      switchView('catalog', { category: null, search: document.getElementById('hero-search-input').value });
    });
    document.getElementById('catalog-search').addEventListener('input', (e) => { catalogSearchTerm = e.target.value; renderCatalog(); });
    appBuilt = true;
  }

  refreshUserChrome();
  renderUserMenu();
  renderSidebar();
  switchView('overview');
}

function wireSearchInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') switchView('catalog', { category: null, search: input.value }); });
}

/* ============================================================
   Formulários (submit)
   ============================================================ */
function wireForms() {
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const res = attemptLogin(document.getElementById('login-email').value, document.getElementById('login-password').value);
    if (!res.ok) { document.getElementById('login-error').textContent = res.msg; return; }
    enterApp(res.user);
  });

  document.getElementById('ticket-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('field-category').value;
    const service = document.getElementById('field-service').value.trim();
    const title = document.getElementById('field-title').value.trim();
    const description = document.getElementById('field-description').value.trim();
    const priority = document.getElementById('field-priority').value;
    if (!title || !description) { toast('Preencha título e descrição do chamado.', 'error'); return; }
    const approvalNeeded = ticketForm().dataset.approval === '1';
    const id = nextTicketId(); const now = Date.now();
    state.tickets.unshift({
      id, category, service: service || title, title, description, priority,
      requester: currentUser.name,
      status: approvalNeeded ? STATUS.AGUARDANDO : STATUS.ANALISE,
      approvalNeeded, watchers: [],
      assignedRole: approvalNeeded ? null : ROLE.COORDENADOR, assignedTo: null, assignmentChain: [],
      createdAt: now, updatedAt: now,
      history: [{ text: `Chamado criado por ${currentUser.name}`, at: now },
        ...(approvalNeeded ? [] : [{ text: 'Encaminhado para triagem (Coordenador)', at: now }])],
    });
    saveState(); closeModal('ticket-modal');
    toast(`Chamado ${id} criado com sucesso!`);
    switchView('tickets');
  });

  document.getElementById('detail-comment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.ticket;
    const input = document.getElementById('detail-comment-input');
    const text = input.value.trim(); if (!text) return;
    const t = findTicket(id);
    addHistory(t, `Comentário de ${currentUser.name}: "${text}"`);
    saveState(); input.value = ''; renderTicketDetail(t); renderCurrentView();
  });

  document.getElementById('forward-role').addEventListener('change', (e) => fillForwardPeople(e.target.value));
  document.getElementById('forward-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.getElementById('forward-role').value;
    const userId = document.getElementById('forward-user').value;
    const note = document.getElementById('forward-note').value.trim();
    if (!userId) { toast('Selecione um responsável.', 'error'); return; }
    forwardTicket(forwardTicketId, userId, role, note);
    closeModal('forward-modal'); closeModal('detail-modal');
  });

  document.getElementById('user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = saveUser({
      name: document.getElementById('u-name').value,
      email: document.getElementById('u-email').value,
      password: document.getElementById('u-password').value,
      role: document.getElementById('u-role').value,
      active: document.getElementById('u-active').checked,
    });
    if (ok) closeModal('user-modal');
  });

  document.getElementById('category-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (saveCategory(document.getElementById('cat-label').value, document.getElementById('cat-icon').value)) closeModal('category-modal');
  });

  document.getElementById('service-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = saveService({
      title: document.getElementById('svc-title').value,
      desc: document.getElementById('svc-desc').value,
      icon: document.getElementById('svc-icon').value,
      approval: document.getElementById('svc-approval').checked,
      catId: document.getElementById('svc-category').value,
      group: document.getElementById('svc-group').value.trim() || 'Serviços',
    });
    if (ok) closeModal('service-modal');
  });
}

/* ============================================================
   Delegação de cliques
   ============================================================ */
document.addEventListener('click', (e) => {
  // ----- fecha modais (X / overlay) -----
  const closeBtn = e.target.closest('[data-close-modal]');
  if (closeBtn) { closeModal(closeBtn.getAttribute('data-close-modal') + '-modal'); return; }
  const overlay = e.target.classList && e.target.classList.contains('modal-overlay') ? e.target : null;
  if (overlay) { overlay.classList.remove('open'); return; }

  // ----- menu do usuário -----
  if (e.target.closest('#btn-user-menu')) {
    document.getElementById('notif-panel').classList.remove('open');
    renderUserMenu();
    document.getElementById('user-menu').classList.toggle('open');
    return;
  }
  if (e.target.closest('#um-theme')) { toggleTheme(); return; }
  if (e.target.closest('#um-logout')) { document.getElementById('user-menu').classList.remove('open'); doLogout(); return; }
  if (e.target.closest('#btn-theme')) { toggleTheme(); return; }

  // ----- notificações -----
  const bellBtn = e.target.closest('#btn-notifications');
  const notifPanel = document.getElementById('notif-panel');
  if (bellBtn) { document.getElementById('user-menu').classList.remove('open'); renderNotifications(); notifPanel.classList.toggle('open'); return; }
  if (notifPanel && !e.target.closest('#notif-panel')) notifPanel.classList.remove('open');
  const userMenu = document.getElementById('user-menu');
  if (userMenu && !e.target.closest('#user-menu') && !e.target.closest('#btn-user-menu')) userMenu.classList.remove('open');

  // ----- navegação por menu lateral -----
  const menuItem = e.target.closest('.menu-item');
  if (menuItem && !menuItem.hasAttribute('data-static')) {
    const view = menuItem.getAttribute('data-view');
    const category = menuItem.getAttribute('data-category');
    switchView(view, { category: category || null, search: '' });
    return;
  }

  // ----- navegação genérica (data-view-nav) -----
  const viewNav = e.target.closest('[data-view-nav]');
  if (viewNav) { document.getElementById('user-menu').classList.remove('open'); switchView(viewNav.getAttribute('data-view-nav')); return; }

  // ----- abas de categoria (catálogo) -----
  const catTab = e.target.closest('[data-cat-tab]');
  if (catTab) {
    activeCategory = catTab.getAttribute('data-cat-tab') || null;
    renderCatalog();
    document.querySelectorAll('.menu-item[data-view="catalog"]').forEach((m) => m.classList.toggle('active', m.getAttribute('data-category') === activeCategory));
    return;
  }

  // ----- quick cards / stat cards -----
  const quickCard = e.target.closest('[data-quick-category]');
  if (quickCard) { switchView('catalog', { category: quickCard.getAttribute('data-quick-category'), search: '' }); return; }
  const statCard = e.target.closest('[data-stat-nav]');
  if (statCard) { switchView(statCard.getAttribute('data-stat-nav')); return; }

  // ----- CRUD catálogo (admin) -----
  if (e.target.closest('[data-new-category]')) { openCategoryModal(null, e); return; }
  const editCat = e.target.closest('[data-edit-category]');
  if (editCat) { e.stopPropagation(); openCategoryModal(editCat.getAttribute('data-edit-category'), e); return; }
  const delCat = e.target.closest('[data-delete-category]');
  if (delCat) { e.stopPropagation(); deleteCategory(delCat.getAttribute('data-delete-category')); return; }
  const newSvc = e.target.closest('[data-new-service]');
  if (newSvc) { const [catId, sub] = newSvc.getAttribute('data-new-service').split('::'); openServiceModal({ target: { catId, sub } }, e); return; }
  const editSvc = e.target.closest('[data-edit-service]');
  if (editSvc) { e.stopPropagation(); openServiceModal({ serviceId: editSvc.getAttribute('data-edit-service') }, e); return; }
  const delSvc = e.target.closest('[data-delete-service]');
  if (delSvc) { e.stopPropagation(); deleteService(delSvc.getAttribute('data-delete-service')); return; }

  // ----- CRUD usuários (admin) -----
  if (e.target.closest('[data-new-user]')) { openUserModal(null, e); return; }
  const editUser = e.target.closest('[data-edit-user]');
  if (editUser) { openUserModal(editUser.getAttribute('data-edit-user'), e); return; }
  const delUser = e.target.closest('[data-delete-user]');
  if (delUser && !delUser.disabled) { deleteUser(delUser.getAttribute('data-delete-user')); return; }

  // ----- abrir modal de serviço (catálogo normal / recomendados) -----
  const openService = e.target.closest('[data-open-service]');
  if (openService) { const [cat, title] = openService.getAttribute('data-open-service').split('::'); openNewTicketModal(cat, title, e); return; }

  // ----- novo chamado -----
  if (e.target.closest('#btn-new-ticket') || e.target.closest('[data-open-new-ticket]')) { openNewTicketModal(null, '', e); return; }

  // ----- aprovar / rejeitar inline -----
  const approveBtn = e.target.closest('[data-approve]');
  if (approveBtn) { e.stopPropagation(); approveTicket(approveBtn.getAttribute('data-approve')); return; }
  const rejectBtn = e.target.closest('[data-reject]');
  if (rejectBtn) { e.stopPropagation(); rejectTicket(rejectBtn.getAttribute('data-reject')); return; }

  // ----- fila: assumir / encaminhar / resolver -----
  const assumeBtn = e.target.closest('[data-assume]');
  if (assumeBtn) { e.stopPropagation(); assumeTicket(assumeBtn.getAttribute('data-assume')); return; }
  const forwardBtn = e.target.closest('[data-forward]');
  if (forwardBtn) { e.stopPropagation(); openForwardModal(forwardBtn.getAttribute('data-forward'), e); return; }
  const resolveBtn = e.target.closest('[data-resolve]');
  if (resolveBtn) { e.stopPropagation(); resolveTicket(resolveBtn.getAttribute('data-resolve')); return; }

  // ----- reportar ativo -----
  const reportBtn = e.target.closest('[data-report-asset]');
  if (reportBtn) {
    e.stopPropagation();
    const t = findTicket(reportBtn.getAttribute('data-report-asset'));
    if (t) { openNewTicketModal(t.category, t.service || t.title, e); document.getElementById('field-title').value = `Problema com ${t.service || t.title}`; }
    return;
  }

  // ----- detalhe do chamado (clique na linha/card) -----
  const ticketRow = e.target.closest('[data-ticket]');
  if (ticketRow && !e.target.closest('[data-approve],[data-reject],[data-assume],[data-forward],[data-resolve]')) {
    openTicketDetail(ticketRow.getAttribute('data-ticket'), e); return;
  }

  // ----- ações dentro do detalhe -----
  const dApprove = e.target.closest('[data-detail-approve]');
  if (dApprove) { approveTicket(dApprove.getAttribute('data-detail-approve')); renderTicketDetail(findTicket(dApprove.getAttribute('data-detail-approve'))); return; }
  const dReject = e.target.closest('[data-detail-reject]');
  if (dReject) { rejectTicket(dReject.getAttribute('data-detail-reject')); renderTicketDetail(findTicket(dReject.getAttribute('data-detail-reject'))); return; }
  const dResolve = e.target.closest('[data-detail-resolve]');
  if (dResolve) { resolveTicket(dResolve.getAttribute('data-detail-resolve')); closeModal('detail-modal'); return; }
  const dCancel = e.target.closest('[data-detail-cancel]');
  if (dCancel) { cancelTicket(dCancel.getAttribute('data-detail-cancel')); renderTicketDetail(findTicket(dCancel.getAttribute('data-detail-cancel'))); return; }
  const dReopen = e.target.closest('[data-detail-reopen]');
  if (dReopen) { reopenTicket(dReopen.getAttribute('data-detail-reopen')); renderTicketDetail(findTicket(dReopen.getAttribute('data-detail-reopen'))); return; }
  const dWatch = e.target.closest('[data-detail-watch]');
  if (dWatch) { toggleWatch(dWatch.getAttribute('data-detail-watch')); renderTicketDetail(findTicket(dWatch.getAttribute('data-detail-watch'))); return; }
  const dAssume = e.target.closest('[data-detail-assume]');
  if (dAssume) { assumeTicket(dAssume.getAttribute('data-detail-assume')); renderTicketDetail(findTicket(dAssume.getAttribute('data-detail-assume'))); return; }
  const dForward = e.target.closest('[data-detail-forward]');
  if (dForward) { openForwardModal(dForward.getAttribute('data-detail-forward'), e); return; }

  // ----- chips do hero -----
  const chip = e.target.closest('[data-chip]');
  if (chip) { switchView('catalog', { category: null, search: chip.getAttribute('data-chip') }); return; }

  // ----- botão "Novo usuário" no cabeçalho da view de usuários -----
  if (e.target.closest('#btn-add-user')) { openUserModal(null, e); return; }

  // ----- decorativos -----
  const staticEl = e.target.closest('[data-static]');
  if (staticEl) { toast('Funcionalidade em desenvolvimento.'); return; }
});

/* ============================================================
   Inicialização
   ============================================================ */
function init() {
  applyTheme(currentTheme());
  document.getElementById('header').innerHTML = buildHeader();
  loadState();
  wireForms();

  const user = loadSession();
  if (user) enterApp(user);
  else showLogin();
}
document.addEventListener('DOMContentLoaded', init);
