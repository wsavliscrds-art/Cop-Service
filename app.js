/* ============================================================
   COP Serv - IT Center
   Aplicação client-side (localStorage) para abertura, acompanhamento
   e aprovação de chamados de TI. Todas as abas do menu e ações dos
   cartões de serviço são funcionais.
   ============================================================ */

const STORAGE_KEY = 'copserv_data_v2';

const CURRENT_USER = {
  id: 'u-weslley',
  name: 'Weslley Sardinha',
  initials: 'WS',
  role: 'Colaborador',
};

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

/* ---------------- Catálogo de serviços ---------------- */
const CATEGORIES = [
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

const SERVICES = {
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

function categoryLabel(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.label : id;
}

const CATEGORY_ICO = {
  hardware: ICO.laptop, software: ICO.grid, access: ICO.key, network: ICO.globe,
  google: ICO.cloud, hosting: ICO.server, hr: ICO.users, other: ICO.grid, security: ICO.shield,
};

/* ---------------- Montagem de header / sidebar / overview (usa ícones de icons.js) ---------------- */
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
      <button class="header-icon-btn" data-static title="Aplicativos">${ICO.grid}</button>
      <button class="header-icon-btn" id="btn-notifications" title="Notificações">
        ${ICO.bell}<span class="badge-count hidden" id="notif-badge">0</span>
      </button>
      <button class="header-icon-btn" data-static title="Ajuda">${ICO.help}</button>
      <button class="lang-select" data-static type="button"><span class="flag">🇧🇷</span> Português ${ICO.chevronDown}</button>
      <div class="user-profile" data-static>
        <div class="avatar" id="user-avatar-display">WS</div>
        <div class="user-meta">
          <div class="user-name" id="user-name-display">Weslley Sardinha</div>
          <div class="user-role" id="user-role-display">Colaborador</div>
        </div>
        <span class="uc-chevron">${ICO.chevronDown}</span>
      </div>
    </div>
    <div class="dropdown-panel" id="notif-panel">
      <div class="dropdown-header">Notificações</div>
      <div id="notif-list"></div>
    </div>
  `;
}

function buildSidebar() {
  const serviceItems = CATEGORIES.filter((c) => c.id !== 'other').map((c) => `
    <button class="menu-item" data-view="catalog" data-category="${c.id}">
      ${mi(CATEGORY_ICO[c.id], c.label)}
      <span class="mi-chevron">${ICO.chevronRight}</span>
    </button>`).join('');

  return `
    <div class="sidebar-scroll">
      <div class="menu-section">
        <button class="menu-item" data-view="overview">${mi(ICO.home, 'Overview')}</button>
        <button class="menu-item" data-view="tickets">${mi(ICO.inbox, 'Meus Chamados')}<span class="mi-count" data-count="tickets">0</span></button>
        <button class="menu-item" data-view="approvals">${mi(ICO.checkCircle, 'Minhas Aprovações')}<span class="mi-count" data-count="approvals">0</span></button>
        <button class="menu-item" data-view="watching">${mi(ICO.eye, 'Observando')}<span class="mi-count hidden" data-count="watching">0</span></button>
        <button class="menu-item" data-view="assets">${mi(ICO.device, 'Meus Ativos')}</button>
      </div>
      <div class="menu-section">
        <div class="menu-label">Serviços</div>
        ${serviceItems}
      </div>
      <div class="menu-section menu-section-footer">
        <button class="menu-item" data-static>${mi(ICO.help, 'Central de Ajuda')}</button>
        <button class="menu-item" data-static>${mi(ICO.settings, 'Configurações')}</button>
      </div>
    </div>
    <button class="sidebar-collapse" id="sidebar-collapse">${ICO.collapse}<span>Recolher menu</span></button>
  `;
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
        <div class="stat-card" data-stat-nav="tickets">
          <div class="stat-icon stat-icon-blue">${ICO.laptop}</div>
          <div class="stat-value" id="stat-abertos">0</div>
          <div class="stat-label">Abertos</div>
        </div>
        <div class="stat-card" data-stat-nav="tickets">
          <div class="stat-icon stat-icon-orange">${ICO.clock}</div>
          <div class="stat-value" id="stat-analise">0</div>
          <div class="stat-label">Em análise</div>
        </div>
        <div class="stat-card" data-stat-nav="tickets">
          <div class="stat-icon stat-icon-green">${ICO.checkCircle}</div>
          <div class="stat-value" id="stat-resolvidos">0</div>
          <div class="stat-label">Resolvidos</div>
        </div>
        <div class="stat-card" data-stat-nav="approvals">
          <div class="stat-icon stat-icon-purple">${ICO.users}</div>
          <div class="stat-value" id="stat-aguardando">0</div>
          <div class="stat-label">Aguardando<br>aprovação</div>
        </div>
      </div>
    </div>

    <div class="panel quick-access-panel">
      <div class="panel-header">
        <div class="panel-title">Acesso rápido</div>
        <button class="panel-link" data-view-nav="catalog">Ver todos os serviços</button>
      </div>
      <div class="quick-grid">
        <div class="quick-card" data-quick-category="hardware">
          <div class="qc-icon qc-icon-purple">${ICO.laptop}</div>
          <div class="qc-title">Hardware</div>
          <div class="qc-desc">Equipamentos e acessórios</div>
        </div>
        <div class="quick-card" data-quick-category="software">
          <div class="qc-icon qc-icon-green">${ICO.grid}</div>
          <div class="qc-title">Software</div>
          <div class="qc-desc">Aplicativos e licenças</div>
        </div>
        <div class="quick-card quick-card-accent" data-quick-category="access">
          <div class="qc-icon qc-icon-orange">${ICO.key}</div>
          <div class="qc-title">Acessos</div>
          <div class="qc-desc">Sistemas e permissões</div>
        </div>
        <div class="quick-card" data-quick-category="network">
          <div class="qc-icon qc-icon-blue">${ICO.globe}</div>
          <div class="qc-title">Rede</div>
          <div class="qc-desc">Conectividade e VPN</div>
        </div>
        <div class="quick-card" data-quick-category="google">
          <div class="qc-icon qc-icon-rainbow">${ICO.cloud}</div>
          <div class="qc-title">Google Workspace</div>
          <div class="qc-desc">Apps corporativos</div>
        </div>
      </div>
    </div>

    <div class="left-stack">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Serviços recomendados para você</div>
          <span class="panel-hint">Baseado no seu perfil e uso</span>
        </div>
        <div id="recommended-list"></div>
        <button class="panel-footer-link" data-view-nav="catalog">Ver todos os serviços recomendados</button>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Meus chamados recentes</div>
          <button class="panel-link" data-stat-nav="tickets">Ver todos</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Serviço</th><th>Status</th><th>Atualizado</th></tr></thead>
            <tbody id="recent-tickets-body"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="right-stack">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Aprovações pendentes</div>
          <button class="panel-link" data-stat-nav="approvals">Ver todas</button>
        </div>
        <div id="approvals-list"></div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Comunicados importantes</div>
          <button class="panel-link" data-static>Ver todos</button>
        </div>
        <div class="list-row list-row-static">
          <div class="lr-left">
            <div class="lr-icon lr-icon-red">${ICO.shield}</div>
            <div>
              <div class="lr-title">Manutenção programada</div>
              <div class="lr-meta">Sistema de chamados estará em manutenção</div>
              <div class="lr-date">25/06/2024 às 22:00</div>
            </div>
          </div>
        </div>
        <div class="list-row list-row-static">
          <div class="lr-left">
            <div class="lr-icon lr-icon-purple">${ICO.lock}</div>
            <div>
              <div class="lr-title">Lembrete de segurança</div>
              <div class="lr-meta">Atualize sua senha regularmente</div>
              <div class="lr-date">20/06/2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ---------------- Estado / Persistência ---------------- */
let state = null;

function seedState() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mk = (over) => ({
    id: nextTicketId(),
    category: 'hardware',
    service: '',
    title: '',
    description: '',
    priority: 'Média',
    requester: CURRENT_USER.name,
    status: STATUS.ANALISE,
    approvalNeeded: false,
    watchers: [],
    createdAt: now,
    updatedAt: now,
    history: [],
    ...over,
  });

  const tickets = [
    mk({
      id: 'IT-10291', category: 'hardware', service: 'Notebook', title: 'Solicitar Notebook',
      description: 'Preciso de um notebook corporativo para o novo colaborador da equipe.',
      priority: 'Média', status: STATUS.ANALISE, approvalNeeded: true,
      createdAt: now - 0.5 * day, updatedAt: now - 0.2 * day,
      history: [{ text: 'Chamado criado por Weslley Sardinha', at: now - 0.5 * day }],
    }),
    mk({
      id: 'IT-10288', category: 'software', service: 'Microsoft Power BI Pro', title: 'Licença Power BI Pro',
      description: 'Solicito licença do Power BI Pro para construção de dashboards financeiros.',
      priority: 'Baixa', status: STATUS.RESOLVIDO,
      createdAt: now - 3 * day, updatedAt: now - 2 * day,
      history: [
        { text: 'Chamado criado por Weslley Sardinha', at: now - 3 * day },
        { text: 'Chamado marcado como resolvido', at: now - 2 * day },
      ],
    }),
    mk({
      id: 'IT-10276', category: 'network', service: 'Acesso VPN', title: 'Acesso VPN', approval: true,
      description: 'Solicito acesso VPN para trabalho remoto.',
      priority: 'Alta', status: STATUS.ANDAMENTO, approvalNeeded: true,
      createdAt: now - 4 * day, updatedAt: now - 1 * day,
      history: [
        { text: 'Chamado criado por Weslley Sardinha', at: now - 4 * day },
        { text: 'Aprovado por Weslley Sardinha', at: now - 1 * day },
      ],
    }),
    mk({
      id: 'IT-10263', category: 'hardware', service: 'Impressora', title: 'Solicitação de Impressora',
      description: 'Impressora do setor com defeito, solicitando substituição.',
      priority: 'Média', status: STATUS.AGUARDANDO, approvalNeeded: true,
      createdAt: now - 6 * day, updatedAt: now - 6 * day,
      history: [{ text: 'Chamado criado por Weslley Sardinha', at: now - 6 * day }],
    }),
    mk({
      id: 'IT-10251', category: 'software', service: 'Adobe Acrobat Pro DC', title: 'Licença Adobe Acrobat',
      description: 'Necessário para assinatura digital de contratos.',
      priority: 'Baixa', status: STATUS.RESOLVIDO,
      createdAt: now - 8 * day, updatedAt: now - 7 * day,
      history: [
        { text: 'Chamado criado por Weslley Sardinha', at: now - 8 * day },
        { text: 'Chamado marcado como resolvido', at: now - 7 * day },
      ],
    }),
    mk({
      id: 'IT-10301', category: 'software', service: 'Adobe Creative Cloud', title: 'Licença Adobe Creative Cloud',
      description: 'Solicitado por João Silva para a equipe de design.',
      requester: 'João Silva', priority: 'Média', status: STATUS.AGUARDANDO, approvalNeeded: true,
      createdAt: now - 2 * 60 * 60 * 1000, updatedAt: now - 2 * 60 * 60 * 1000,
      history: [{ text: 'Chamado criado por João Silva', at: now - 2 * 60 * 60 * 1000 }],
    }),
    mk({
      id: 'IT-10302', category: 'access', service: 'Acesso ao Sistema Financeiro', title: 'Acesso ao Sistema Financeiro',
      description: 'Solicitado por Maria Santos, precisa de acesso para conciliação mensal.',
      requester: 'Maria Santos', priority: 'Alta', status: STATUS.AGUARDANDO, approvalNeeded: true,
      createdAt: now - 5 * 60 * 60 * 1000, updatedAt: now - 5 * 60 * 60 * 1000,
      history: [{ text: 'Chamado criado por Maria Santos', at: now - 5 * 60 * 60 * 1000 }],
    }),
    mk({
      id: 'IT-10303', category: 'hardware', service: 'Notebook', title: 'Notebook para Desenvolvedor',
      description: 'Solicitado por Carlos Lima, notebook com 32GB RAM para desenvolvimento.',
      requester: 'Carlos Lima', priority: 'Alta', status: STATUS.AGUARDANDO, approvalNeeded: true,
      createdAt: now - 1 * day, updatedAt: now - 1 * day,
      history: [{ text: 'Chamado criado por Carlos Lima', at: now - 1 * day }],
    }),
  ];

  return { tickets, watching: ['IT-10276'], seq: 10303 };
}

function nextTicketId() {
  state = state || {};
  const seq = (state.seq || 10290) + 1;
  state.seq = seq;
  return `IT-${seq}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw);
      return;
    }
  } catch (e) { /* ignore corrupted storage */ }
  state = seedState();
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- Utilidades ---------------- */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = 60 * 1000, hr = 60 * min, day = 24 * hr;
  if (diff < min) return 'agora mesmo';
  if (diff < hr) return `${Math.floor(diff / min)} min atrás`;
  if (diff < day) return `${Math.floor(diff / hr)} h atrás`;
  if (diff < 30 * day) return `${Math.floor(diff / day)} d atrás`;
  return new Date(ts).toLocaleDateString('pt-BR');
}

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  const cls = STATUS_BADGE_CLASS[status] || 'badge-aberto';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function priorityClass(p) {
  return 'priority-' + (p || 'média').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function myTickets() {
  return state.tickets.filter((t) => t.requester === CURRENT_USER.name);
}

function pendingApprovals() {
  return state.tickets.filter((t) => t.approvalNeeded && t.status === STATUS.AGUARDANDO);
}

function watchedTickets() {
  return state.tickets.filter((t) => (state.watching || []).includes(t.id));
}

function findTicket(id) {
  return state.tickets.find((t) => t.id === id);
}

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
  setTimeout(() => el.remove(), 3200);
}

/* ---------------- Navegação entre views ---------------- */
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

  document.querySelectorAll('.menu-item').forEach((mi) => {
    const mv = mi.getAttribute('data-view');
    const mc = mi.getAttribute('data-category');
    const isActive = mv === view && (view !== 'catalog' || mc === activeCategory);
    mi.classList.toggle('active', isActive);
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
    case 'watching': renderTicketTable('view-watching-body', watchedTickets(), 'Você não está observando nenhum chamado.'); break;
    case 'assets': renderAssets(); break;
  }
  updateBadges();
}

function updateBadges() {
  const pending = pendingApprovals().length;
  const openCount = myTickets().filter((t) => OPEN_STATUSES.includes(t.status)).length;

  document.querySelectorAll('[data-count="approvals"]').forEach((el) => { el.textContent = pending; el.classList.toggle('hidden', pending === 0); });
  document.querySelectorAll('[data-count="tickets"]').forEach((el) => { el.textContent = openCount; el.classList.toggle('hidden', openCount === 0); });
  document.querySelectorAll('[data-count="watching"]').forEach((el) => { el.textContent = watchedTickets().length; el.classList.toggle('hidden', watchedTickets().length === 0); });

  const bell = document.getElementById('notif-badge');
  bell.textContent = pending;
  bell.classList.toggle('hidden', pending === 0);
}

/* ---------------- Overview ---------------- */
function renderOverview() {
  document.getElementById('hero-greeting').textContent = `${greeting()}, ${CURRENT_USER.name.split(' ')[0]}!`;

  const mine = myTickets();
  const stats = {
    abertos: mine.filter((t) => OPEN_STATUSES.includes(t.status)).length,
    analise: mine.filter((t) => t.status === STATUS.ANALISE).length,
    resolvidos: mine.filter((t) => t.status === STATUS.RESOLVIDO).length,
    aguardando: pendingApprovals().length,
  };
  document.getElementById('stat-abertos').textContent = stats.abertos;
  document.getElementById('stat-analise').textContent = stats.analise;
  document.getElementById('stat-resolvidos').textContent = stats.resolvidos;
  document.getElementById('stat-aguardando').textContent = stats.aguardando;

  // Serviços recomendados (amostra fixa e útil)
  const recommended = [
    { category: 'hardware', title: 'Notebook', eta: '~2 min' },
    { category: 'access', title: 'Acesso ao Sistema Financeiro', eta: '~3 min' },
    { category: 'software', title: 'Microsoft Power BI Pro', eta: '~5 min' },
  ];
  const recEl = document.getElementById('recommended-list');
  recEl.innerHTML = recommended.map((r) => {
    return `<div class="list-row" data-open-service="${r.category}::${escapeHtml(r.title)}">
      <div class="lr-left">
        <div class="lr-icon">${CATEGORY_ICO[r.category] || ICO.ticket}</div>
        <div>
          <div class="lr-title">${escapeHtml(r.title)}</div>
          <div class="lr-meta">${categoryLabel(r.category)}</div>
        </div>
      </div>
      <div class="lr-right"><span class="lr-meta">${r.eta}</span> <button class="icon-btn" style="background:#eef2ff;color:var(--accent)">${ICO.arrowRight}</button></div>
    </div>`;
  }).join('');

  // Chamados recentes
  const recent = [...mine].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  const recentBody = document.getElementById('recent-tickets-body');
  recentBody.innerHTML = recent.length ? recent.map((t) => `
    <tr data-ticket="${t.id}">
      <td class="mono">${t.id}</td>
      <td>${escapeHtml(t.service || t.title)}</td>
      <td>${statusBadge(t.status)}</td>
      <td>${timeAgo(t.updatedAt)}</td>
    </tr>`).join('') : `<tr><td colspan="4" class="empty-state">Nenhum chamado ainda.</td></tr>`;

  // Aprovações pendentes
  const pend = pendingApprovals().slice(0, 5);
  const pendEl = document.getElementById('approvals-list');
  pendEl.innerHTML = pend.length ? pend.map((t) => `
    <div class="list-row" data-ticket="${t.id}">
      <div class="lr-left">
        <div class="lr-icon">${ICO.ticket}</div>
        <div>
          <div class="lr-title">${escapeHtml(t.service || t.title)}</div>
          <div class="lr-meta">Solicitado por: ${escapeHtml(t.requester)} · ${timeAgo(t.createdAt)}</div>
        </div>
      </div>
      <div class="lr-right">
        <button class="icon-btn approve" data-approve="${t.id}" title="Aprovar">✓</button>
        <button class="icon-btn reject" data-reject="${t.id}" title="Rejeitar">✕</button>
      </div>
    </div>`).join('') : `<div class="empty-state">Nenhuma aprovação pendente.</div>`;
}

function findServiceByTitle(category, title) {
  const groups = SERVICES[category] || [];
  for (const g of groups) {
    const item = g.items.find((i) => i.title === title);
    if (item) return item;
  }
  return null;
}

/* ---------------- Catálogo ---------------- */
function renderCategoryTabs() {
  const wrap = document.getElementById('category-tabs');
  wrap.innerHTML = `<button class="category-tab ${!activeCategory ? 'active' : ''}" data-cat-tab="">Todos</button>` +
    CATEGORIES.map((c) => `<button class="category-tab ${activeCategory === c.id ? 'active' : ''}" data-cat-tab="${c.id}">${c.icon} ${escapeHtml(c.label)}</button>`).join('');
}

function renderCatalog() {
  renderCategoryTabs();
  document.getElementById('catalog-search').value = catalogSearchTerm;

  const categoriesToShow = activeCategory ? [activeCategory] : CATEGORIES.map((c) => c.id);
  const term = catalogSearchTerm.trim().toLowerCase();

  let html = '';
  categoriesToShow.forEach((catId) => {
    const groups = SERVICES[catId] || [];
    const cat = CATEGORIES.find((c) => c.id === catId);
    let catHtml = '';

    groups.forEach((group) => {
      const items = group.items.filter((i) => !term || i.title.toLowerCase().includes(term) || i.desc.toLowerCase().includes(term));
      if (!items.length) return;
      catHtml += `
        <div class="section-subtitle">${escapeHtml(group.sub)}</div>
        <div class="card-grid">
          ${items.map((i) => `
            <button class="service-card" data-open-service="${catId}::${escapeHtml(i.title)}">
              <div class="card-icon">${i.icon}</div>
              <div class="card-title">${escapeHtml(i.title)}</div>
              <div class="card-description">${escapeHtml(i.desc)}</div>
              ${i.approval ? `<div class="card-approval-tag">Requer aprovação</div>` : ''}
            </button>`).join('')}
        </div>`;
    });

    if (catHtml) {
      html += `<div class="section">
        <div class="section-title"><div class="section-accent"></div>${cat.icon} ${escapeHtml(cat.label)}</div>
        ${catHtml}
      </div>`;
    }
  });

  document.getElementById('catalog-content').innerHTML = html || `<div class="empty-state">Nenhum serviço encontrado para "${escapeHtml(catalogSearchTerm)}".</div>`;
}

/* ---------------- Tabelas de chamados ---------------- */
function renderTicketTable(bodyId, tickets, emptyMsg) {
  const sorted = [...tickets].sort((a, b) => b.updatedAt - a.updatedAt);
  const body = document.getElementById(bodyId);
  body.innerHTML = sorted.length ? sorted.map((t) => `
    <tr data-ticket="${t.id}">
      <td class="mono">${t.id}</td>
      <td>${escapeHtml(t.service || t.title)}</td>
      <td>${categoryLabel(t.category)}</td>
      <td>${escapeHtml(t.requester)}</td>
      <td class="${priorityClass(t.priority)}">${escapeHtml(t.priority)}</td>
      <td>${statusBadge(t.status)}</td>
      <td>${timeAgo(t.updatedAt)}</td>
    </tr>`).join('') : `<tr><td colspan="7" class="empty-state">${emptyMsg}</td></tr>`;
}

function renderApprovals() {
  const pend = pendingApprovals();
  const el = document.getElementById('approvals-full-list');
  el.innerHTML = pend.length ? pend.map((t) => `
    <div class="panel" style="margin-bottom:10px;">
      <div class="list-row" data-ticket="${t.id}" style="padding:0;">
        <div class="lr-left">
          <div class="lr-icon">${ICO.ticket}</div>
          <div>
            <div class="lr-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span></div>
            <div class="lr-meta">Solicitado por ${escapeHtml(t.requester)} · ${categoryLabel(t.category)} · ${timeAgo(t.createdAt)}</div>
          </div>
        </div>
        <div class="lr-right">
          <button class="btn btn-secondary btn-sm" data-ticket="${t.id}">Ver detalhes</button>
          <button class="icon-btn approve" data-approve="${t.id}" title="Aprovar">✓</button>
          <button class="icon-btn reject" data-reject="${t.id}" title="Rejeitar">✕</button>
        </div>
      </div>
    </div>`).join('') : `<div class="empty-state">Nenhuma aprovação pendente. 🎉</div>`;
}

function renderAssets() {
  const assets = state.tickets.filter((t) => t.requester === CURRENT_USER.name && t.status === STATUS.RESOLVIDO && (t.category === 'hardware' || t.category === 'software'));
  const el = document.getElementById('assets-list');
  el.innerHTML = assets.length ? assets.map((t) => `
    <div class="list-row" data-ticket="${t.id}">
      <div class="lr-left">
        <div class="lr-icon">${t.category === 'hardware' ? '💻' : '🧩'}</div>
        <div>
          <div class="lr-title">${escapeHtml(t.service || t.title)}</div>
          <div class="lr-meta">Atribuído em ${formatDateTime(t.updatedAt)} · ${t.id}</div>
        </div>
      </div>
      <div class="lr-right">
        <button class="btn btn-secondary btn-sm" data-report-asset="${t.id}">Reportar problema</button>
      </div>
    </div>`).join('') : `<div class="empty-state">Nenhum ativo atribuído ainda. Ativos aparecem aqui quando um chamado de hardware/software é resolvido.</div>`;
}

/* ---------------- Modal: Novo chamado ---------------- */
const ticketModal = document.getElementById('ticket-modal');
const ticketForm = document.getElementById('ticket-form');

function openNewTicketModal(category, serviceTitle) {
  ticketForm.reset();
  const catSelect = document.getElementById('field-category');
  catSelect.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.icon} ${escapeHtml(c.label)}</option>`).join('');
  catSelect.value = category || 'other';

  document.getElementById('field-service').value = serviceTitle || '';
  document.getElementById('field-title').value = serviceTitle || '';
  document.getElementById('field-description').value = '';
  document.getElementById('field-priority').value = 'Média';

  const svc = category && serviceTitle ? findServiceByTitle(category, serviceTitle) : null;
  document.getElementById('new-ticket-approval-note').style.display = svc && svc.approval ? 'block' : 'none';
  ticketForm.dataset.approval = svc && svc.approval ? '1' : '0';

  document.getElementById('ticket-modal-title').textContent = serviceTitle ? `Solicitar: ${serviceTitle}` : 'Abrir novo chamado';
  ticketModal.classList.add('open');
  document.getElementById('field-title').focus();
}

function closeNewTicketModal() {
  ticketModal.classList.remove('open');
}

ticketForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const category = document.getElementById('field-category').value;
  const service = document.getElementById('field-service').value.trim();
  const title = document.getElementById('field-title').value.trim();
  const description = document.getElementById('field-description').value.trim();
  const priority = document.getElementById('field-priority').value;

  if (!title || !description) {
    toast('Preencha título e descrição do chamado.', 'error');
    return;
  }

  const approvalNeeded = ticketForm.dataset.approval === '1';
  const id = nextTicketId();
  const now = Date.now();
  const ticket = {
    id, category, service: service || title, title, description, priority,
    requester: CURRENT_USER.name,
    status: approvalNeeded ? STATUS.AGUARDANDO : STATUS.ANALISE,
    approvalNeeded,
    watchers: [],
    createdAt: now, updatedAt: now,
    history: [{ text: `Chamado criado por ${CURRENT_USER.name}`, at: now }],
  };
  state.tickets.unshift(ticket);
  saveState();
  closeNewTicketModal();
  toast(`Chamado ${id} criado com sucesso!`);
  switchView('tickets');
});

/* ---------------- Modal: Detalhe do chamado ---------------- */
const detailModal = document.getElementById('detail-modal');

function openTicketDetail(id) {
  const t = findTicket(id);
  if (!t) return;
  renderTicketDetail(t);
  detailModal.classList.add('open');
}

function closeTicketDetail() {
  detailModal.classList.remove('open');
}

function renderTicketDetail(t) {
  document.getElementById('detail-modal-title').textContent = `${t.service || t.title} · ${t.id}`;

  document.getElementById('detail-meta').innerHTML = `
    <div class="detail-meta-item"><div class="detail-meta-label">Status</div><div class="detail-meta-value">${statusBadge(t.status)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Categoria</div><div class="detail-meta-value">${categoryLabel(t.category)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Solicitante</div><div class="detail-meta-value">${escapeHtml(t.requester)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Prioridade</div><div class="detail-meta-value ${priorityClass(t.priority)}">${escapeHtml(t.priority)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Criado em</div><div class="detail-meta-value">${formatDateTime(t.createdAt)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Atualizado em</div><div class="detail-meta-value">${formatDateTime(t.updatedAt)}</div></div>
  `;
  document.getElementById('detail-desc').textContent = t.description;

  const hist = [...(t.history || [])].sort((a, b) => b.at - a.at);
  document.getElementById('detail-timeline').innerHTML = hist.map((h) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-text">${escapeHtml(h.text)}</div>
        <div class="timeline-time">${formatDateTime(h.at)}</div>
      </div>
    </div>`).join('');

  const isWatching = (state.watching || []).includes(t.id);
  const isCancellable = ![STATUS.RESOLVIDO, STATUS.CANCELADO, STATUS.REJEITADO].includes(t.status);
  const isReopenable = [STATUS.RESOLVIDO, STATUS.CANCELADO].includes(t.status);
  const canResolve = ![STATUS.RESOLVIDO, STATUS.CANCELADO, STATUS.REJEITADO].includes(t.status) && !(t.approvalNeeded && t.status === STATUS.AGUARDANDO);
  const canApprove = t.approvalNeeded && t.status === STATUS.AGUARDANDO;

  document.getElementById('detail-actions').innerHTML = `
    <button class="btn btn-secondary btn-sm" data-detail-watch="${t.id}">${isWatching ? '★ Deixar de observar' : '☆ Observar'}</button>
    ${canApprove ? `<button class="btn btn-primary btn-sm" data-detail-approve="${t.id}">Aprovar</button>
                     <button class="btn btn-danger btn-sm" data-detail-reject="${t.id}">Rejeitar</button>` : ''}
    ${canResolve ? `<button class="btn btn-secondary btn-sm" data-detail-resolve="${t.id}">Marcar como resolvido</button>` : ''}
    ${isReopenable ? `<button class="btn btn-secondary btn-sm" data-detail-reopen="${t.id}">Reabrir chamado</button>` : ''}
    ${isCancellable ? `<button class="btn btn-danger btn-sm" data-detail-cancel="${t.id}">Cancelar chamado</button>` : ''}
  `;

  document.getElementById('detail-comment-form').dataset.ticket = t.id;
}

document.getElementById('detail-comment-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = e.currentTarget.dataset.ticket;
  const input = document.getElementById('detail-comment-input');
  const text = input.value.trim();
  if (!text) return;
  const t = findTicket(id);
  addHistory(t, `Comentário de ${CURRENT_USER.name}: "${text}"`);
  saveState();
  input.value = '';
  renderTicketDetail(t);
  renderCurrentView();
});

/* ---------------- Ações de chamado ---------------- */
function approveTicket(id) {
  const t = findTicket(id);
  if (!t) return;
  t.status = STATUS.ANDAMENTO;
  addHistory(t, `Aprovado por ${CURRENT_USER.name}`);
  saveState();
  toast(`Chamado ${id} aprovado.`);
  renderCurrentView();
}

function rejectTicket(id) {
  const t = findTicket(id);
  if (!t) return;
  t.status = STATUS.REJEITADO;
  addHistory(t, `Rejeitado por ${CURRENT_USER.name}`);
  saveState();
  toast(`Chamado ${id} rejeitado.`, 'error');
  renderCurrentView();
}

function resolveTicket(id) {
  const t = findTicket(id);
  if (!t) return;
  t.status = STATUS.RESOLVIDO;
  addHistory(t, `Chamado marcado como resolvido por ${CURRENT_USER.name}`);
  saveState();
  toast(`Chamado ${id} marcado como resolvido.`);
  renderCurrentView();
}

function cancelTicket(id) {
  const t = findTicket(id);
  if (!t) return;
  t.status = STATUS.CANCELADO;
  addHistory(t, `Chamado cancelado por ${CURRENT_USER.name}`);
  saveState();
  toast(`Chamado ${id} cancelado.`);
  renderCurrentView();
}

function reopenTicket(id) {
  const t = findTicket(id);
  if (!t) return;
  t.status = STATUS.ABERTO;
  addHistory(t, `Chamado reaberto por ${CURRENT_USER.name}`);
  saveState();
  toast(`Chamado ${id} reaberto.`);
  renderCurrentView();
}

function toggleWatch(id) {
  state.watching = state.watching || [];
  const idx = state.watching.indexOf(id);
  if (idx === -1) {
    state.watching.push(id);
    toast('Você está observando este chamado.');
  } else {
    state.watching.splice(idx, 1);
    toast('Você deixou de observar este chamado.');
  }
  saveState();
  renderCurrentView();
}

/* ---------------- Notificações ---------------- */
function renderNotifications() {
  const list = [...state.tickets]
    .filter((t) => t.requester === CURRENT_USER.name)
    .map((t) => ({ t, last: t.history[t.history.length - 1] }))
    .filter((x) => x.last)
    .sort((a, b) => b.last.at - a.last.at)
    .slice(0, 8);

  const el = document.getElementById('notif-list');
  el.innerHTML = list.length ? list.map(({ t, last }) => `
    <div class="dropdown-item" data-ticket="${t.id}">
      <div class="di-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span></div>
      <div class="di-meta">${escapeHtml(last.text)} · ${timeAgo(last.at)}</div>
    </div>`).join('') : `<div class="dropdown-empty">Sem notificações recentes.</div>`;
}

/* ---------------- Ligações de eventos (delegação) ---------------- */
document.addEventListener('click', (e) => {
  // sidebar / menu
  const menuItem = e.target.closest('.menu-item');
  if (menuItem && !menuItem.hasAttribute('data-static')) {
    const view = menuItem.getAttribute('data-view');
    const category = menuItem.getAttribute('data-category');
    switchView(view, { category: category || null, search: '' });
    return;
  }

  // category tab pills inside catalog
  const catTab = e.target.closest('[data-cat-tab]');
  if (catTab) {
    activeCategory = catTab.getAttribute('data-cat-tab') || null;
    renderCatalog();
    document.querySelectorAll('.menu-item[data-view="catalog"]').forEach((mi) => {
      mi.classList.toggle('active', mi.getAttribute('data-category') === activeCategory);
    });
    return;
  }

  // quick access cards on overview
  const quickCard = e.target.closest('[data-quick-category]');
  if (quickCard) {
    switchView('catalog', { category: quickCard.getAttribute('data-quick-category'), search: '' });
    return;
  }

  // stat cards on overview
  const statCard = e.target.closest('[data-stat-nav]');
  if (statCard) {
    switchView(statCard.getAttribute('data-stat-nav'));
    return;
  }

  // generic "ver todos" style links that just jump to a view
  const viewNav = e.target.closest('[data-view-nav]');
  if (viewNav) {
    switchView(viewNav.getAttribute('data-view-nav'));
    return;
  }

  // decorative / not-yet-implemented chrome (help, settings, language, avatar menu...)
  const staticEl = e.target.closest('[data-static]');
  if (staticEl) {
    toast('Funcionalidade em desenvolvimento.');
    return;
  }

  // open a service request modal (from catalog cards or recommended list)
  const openService = e.target.closest('[data-open-service]');
  if (openService) {
    const [cat, title] = openService.getAttribute('data-open-service').split('::');
    openNewTicketModal(cat, title);
    return;
  }

  // header / page "+ Novo chamado"
  if (e.target.closest('#btn-new-ticket') || e.target.closest('[data-open-new-ticket]')) {
    openNewTicketModal(null, '');
    return;
  }

  // approve / reject inline buttons (overview + approvals list)
  const approveBtn = e.target.closest('[data-approve]');
  if (approveBtn) { e.stopPropagation(); approveTicket(approveBtn.getAttribute('data-approve')); return; }
  const rejectBtn = e.target.closest('[data-reject]');
  if (rejectBtn) { e.stopPropagation(); rejectTicket(rejectBtn.getAttribute('data-reject')); return; }

  // report asset problem
  const reportBtn = e.target.closest('[data-report-asset]');
  if (reportBtn) {
    e.stopPropagation();
    const t = findTicket(reportBtn.getAttribute('data-report-asset'));
    if (t) {
      openNewTicketModal(t.category, t.service || t.title);
      document.getElementById('field-title').value = `Problema com ${t.service || t.title}`;
    }
    return;
  }

  // open ticket detail (row/list click)
  const ticketRow = e.target.closest('[data-ticket]');
  if (ticketRow && !e.target.closest('[data-approve],[data-reject]')) {
    openTicketDetail(ticketRow.getAttribute('data-ticket'));
    return;
  }

  // modal close buttons / overlay
  if (e.target.closest('[data-close-modal="ticket"]') || e.target === ticketModal) { closeNewTicketModal(); return; }
  if (e.target.closest('[data-close-modal="detail"]') || e.target === detailModal) { closeTicketDetail(); return; }

  // detail modal actions
  const dApprove = e.target.closest('[data-detail-approve]');
  if (dApprove) { approveTicket(dApprove.getAttribute('data-detail-approve')); renderTicketDetail(findTicket(dApprove.getAttribute('data-detail-approve'))); return; }
  const dReject = e.target.closest('[data-detail-reject]');
  if (dReject) { rejectTicket(dReject.getAttribute('data-detail-reject')); renderTicketDetail(findTicket(dReject.getAttribute('data-detail-reject'))); return; }
  const dResolve = e.target.closest('[data-detail-resolve]');
  if (dResolve) { resolveTicket(dResolve.getAttribute('data-detail-resolve')); renderTicketDetail(findTicket(dResolve.getAttribute('data-detail-resolve'))); return; }
  const dCancel = e.target.closest('[data-detail-cancel]');
  if (dCancel) { cancelTicket(dCancel.getAttribute('data-detail-cancel')); renderTicketDetail(findTicket(dCancel.getAttribute('data-detail-cancel'))); return; }
  const dReopen = e.target.closest('[data-detail-reopen]');
  if (dReopen) { reopenTicket(dReopen.getAttribute('data-detail-reopen')); renderTicketDetail(findTicket(dReopen.getAttribute('data-detail-reopen'))); return; }
  const dWatch = e.target.closest('[data-detail-watch]');
  if (dWatch) { toggleWatch(dWatch.getAttribute('data-detail-watch')); renderTicketDetail(findTicket(dWatch.getAttribute('data-detail-watch'))); return; }

  // header notification bell
  const bellBtn = e.target.closest('#btn-notifications');
  const notifPanel = document.getElementById('notif-panel');
  if (bellBtn) {
    renderNotifications();
    notifPanel.classList.toggle('open');
    return;
  }
  if (!e.target.closest('#notif-panel')) notifPanel.classList.remove('open');

  // popular chips on overview hero
  const chip = e.target.closest('[data-chip]');
  if (chip) {
    switchView('catalog', { category: null, search: chip.getAttribute('data-chip') });
    return;
  }
});

// global + hero search
function wireSearchInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      switchView('catalog', { category: null, search: input.value });
    }
  });
}
document.getElementById('catalog-search').addEventListener('input', (e) => {
  catalogSearchTerm = e.target.value;
  renderCatalog();
});

/* ---------------- Inicialização ---------------- */
function init() {
  document.getElementById('header').innerHTML = buildHeader();
  document.getElementById('sidebar').innerHTML = buildSidebar();
  document.getElementById('overview-grid').innerHTML = buildOverviewSkeleton();

  document.getElementById('user-name-display').textContent = CURRENT_USER.name;
  document.getElementById('user-role-display').textContent = CURRENT_USER.role;
  document.getElementById('user-avatar-display').textContent = CURRENT_USER.initials;

  wireSearchInput('global-search-input');
  wireSearchInput('hero-search-input');
  document.getElementById('hero-search-btn').addEventListener('click', () => {
    switchView('catalog', { category: null, search: document.getElementById('hero-search-input').value });
  });
  document.getElementById('sidebar-collapse').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  loadState();
  switchView('overview');
}

document.addEventListener('DOMContentLoaded', init);
