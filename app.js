/* ============================================================
   COP Serv - IT Center  (backend: Supabase)
   Login real + base de usuários + hierarquia de atendimento +
   catálogo editável (admin) + modo escuro. Os dados ficam em um
   banco na nuvem, compartilhados entre todos os usuários/dispositivos.
   ============================================================ */

const CFG = window.COPSERV_CONFIG;
const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
const THEME_KEY = 'copserv_theme';

/* ---------------- Papéis / hierarquia ---------------- */
const ROLE = {
  ADMIN: 'Administrador', COORDENADOR: 'Coordenador', SUPERVISOR: 'Supervisor',
  ANALISTA: 'Analista', ASSOCIADO: 'Associado', ASSISTENTE: 'Assistente',
  APRENDIZ: 'Jovem Aprendiz', COLABORADOR: 'Colaborador',
};
const ALL_ROLES = [ROLE.ADMIN, ROLE.COORDENADOR, ROLE.SUPERVISOR, ROLE.ANALISTA, ROLE.ASSOCIADO, ROLE.ASSISTENTE, ROLE.APRENDIZ, ROLE.COLABORADOR];
const HANDLER_LEVEL = { [ROLE.COORDENADOR]: 0, [ROLE.SUPERVISOR]: 1, [ROLE.ANALISTA]: 2, [ROLE.ASSOCIADO]: 2, [ROLE.ASSISTENTE]: 3, [ROLE.APRENDIZ]: 4 };
const HANDLER_ROLES = [ROLE.COORDENADOR, ROLE.SUPERVISOR, ROLE.ANALISTA, ROLE.ASSOCIADO, ROLE.ASSISTENTE, ROLE.APRENDIZ];

function isAdmin() { return currentUser && currentUser.role === ROLE.ADMIN; }
function isHandler() { return currentUser && (isAdmin() || HANDLER_ROLES.includes(currentUser.role)); }
function rolesBelow(role) {
  const myLevel = role === ROLE.ADMIN ? -1 : (HANDLER_LEVEL[role] ?? 99);
  return HANDLER_ROLES.filter((r) => HANDLER_LEVEL[r] > myLevel);
}

/* ---------------- Status ---------------- */
const STATUS = {
  ANALISE: 'Em análise', ABERTO: 'Aberto', ANDAMENTO: 'Em andamento', AGUARDANDO: 'Aguardando aprovação',
  APROVADO: 'Aprovado', REJEITADO: 'Rejeitado', RESOLVIDO: 'Resolvido', CANCELADO: 'Cancelado',
};
const STATUS_BADGE_CLASS = {
  [STATUS.ANALISE]: 'badge-analise', [STATUS.ABERTO]: 'badge-aberto', [STATUS.ANDAMENTO]: 'badge-andamento',
  [STATUS.AGUARDANDO]: 'badge-aguardando', [STATUS.APROVADO]: 'badge-aprovado', [STATUS.REJEITADO]: 'badge-rejeitado',
  [STATUS.RESOLVIDO]: 'badge-resolvido', [STATUS.CANCELADO]: 'badge-cancelado',
};
const OPEN_STATUSES = [STATUS.ANALISE, STATUS.ABERTO, STATUS.ANDAMENTO, STATUS.AGUARDANDO, STATUS.APROVADO];
const CLOSED_STATUSES = [STATUS.RESOLVIDO, STATUS.CANCELADO, STATUS.REJEITADO];

/* ---------------- Ícones de categoria ---------------- */
const CATEGORY_ICO = {
  hardware: 'laptop', software: 'grid', access: 'key', network: 'globe',
  google: 'cloud', hosting: 'server', hr: 'users', other: 'grid', security: 'shield',
};
function catIconHtml(cat) {
  const key = CATEGORY_ICO[cat.id];
  if (key && ICO[key]) return ICO[key];
  return `<span class="emoji-ico">${escapeHtml(cat.icon || '📁')}</span>`;
}
function categoryLabel(id) { const c = CATEGORIES.find((c) => c.id === id); return c ? c.label : (id || '—'); }
function catIconOr(catId) { const c = CATEGORIES.find((x) => x.id === catId); return c ? catIconHtml(c) : ICO.ticket; }

/* Cor própria por categoria (chip do ícone) */
const CAT_PALETTE = [
  { c: '#2563EB', bg: '#E5EDFF' }, { c: '#7C3AED', bg: '#EDE7FE' },
  { c: '#0891B2', bg: '#D7F1F6' }, { c: '#EA580C', bg: '#FCE7D8' },
  { c: '#16A34A', bg: '#D9F5E4' }, { c: '#DB2777', bg: '#FBE1ED' },
  { c: '#CA8A04', bg: '#FBF0CD' }, { c: '#4F46E5', bg: '#E6E6FB' },
];
function hashStr(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
function catColor(catId) {
  const idx = CATEGORIES.findIndex((c) => c.id === catId);
  const i = idx >= 0 ? idx : Math.abs(hashStr(catId)) % CAT_PALETTE.length;
  return CAT_PALETTE[i % CAT_PALETTE.length];
}
function catChipStyle(catId) { const k = catColor(catId); return `color:${k.c};background:${k.bg}`; }

/* ============================================================
   Estado (cache em memória, alimentado pelo Supabase)
   ============================================================ */
let state = { users: [], categories: [], services: {}, tickets: [], pages: [], settings: {} };
let CATEGORIES = [];
let SERVICES = {};
let currentUser = null;

function syncCatalogRefs() { CATEGORIES = state.categories; SERVICES = state.services; }

function initialsOf(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---------------- Mapeamento DB → cache ---------------- */
function mapTicket(row) {
  return {
    id: row.id, category: row.category, service: row.service, title: row.title, description: row.description,
    priority: row.priority, requester: row.requester_name, requesterId: row.requester_id, status: row.status,
    approvalNeeded: row.approval_needed, assignedRole: row.assigned_role, assignedTo: row.assigned_to,
    watchers: row.watchers || [], participants: row.participants || [], history: row.history || [],
    createdAt: new Date(row.created_at).getTime(), updatedAt: new Date(row.updated_at).getTime(),
  };
}
function groupServices(rows) {
  const out = {};
  for (const r of rows) {
    if (!out[r.category_id]) out[r.category_id] = [];
    let g = out[r.category_id].find((x) => x.sub === r.sub);
    if (!g) { g = { sub: r.sub, items: [] }; out[r.category_id].push(g); }
    g.items.push({ id: r.id, title: r.title, desc: r.description || '', icon: r.icon || '📄', approval: !!r.approval });
  }
  return out;
}

/* ---------------- Carregamento ---------------- */
async function loadCatalog() {
  const [{ data: cats, error: e1 }, { data: svcs, error: e2 }] = await Promise.all([
    sb.from('categories').select('*').order('position'),
    sb.from('services').select('*').order('position'),
  ]);
  if (e1 || e2) throw (e1 || e2);
  state.categories = cats || [];
  state.services = groupServices(svcs || []);
  syncCatalogRefs();
}
async function loadUsers() {
  // Admin lê o perfil completo (inclui e-mail, para gerenciar contas).
  // Os demais recebem apenas o diretório (nome/papel), sem e-mail, via função.
  if (isAdmin()) {
    const { data, error } = await sb.from('profiles').select('*').order('name');
    if (error) throw error;
    state.users = data || [];
  } else {
    const { data, error } = await sb.rpc('list_people');
    if (error) throw error;
    state.users = data || [];
  }
}
async function loadTickets() {
  const { data, error } = await sb.from('tickets').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  state.tickets = (data || []).map(mapTicket);
}
async function loadPages() {
  const { data, error } = await sb.from('pages').select('*').order('position');
  if (error) throw error;
  state.pages = data || [];
}
async function loadSettings() {
  const { data, error } = await sb.from('settings').select('*');
  if (error) throw error;
  state.settings = {};
  for (const r of (data || [])) state.settings[r.key] = r.value;
}
async function loadAll() { await Promise.all([loadCatalog(), loadUsers(), loadTickets(), loadPages(), loadSettings()]); }

function visiblePages() { return isAdmin() ? state.pages : state.pages.filter((p) => p.visible); }
function findPage(id) { return state.pages.find((p) => p.id === id); }
let activePageId = null;

/* ============================================================
   Utilidades
   ============================================================ */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = 60000, hr = 60 * min, day = 24 * hr;
  if (diff < min) return 'agora mesmo';
  if (diff < hr) { const m = Math.floor(diff / min); return `Há ${m} minuto${m > 1 ? 's' : ''}`; }
  if (diff < day) { const h = Math.floor(diff / hr); return `Há ${h} hora${h > 1 ? 's' : ''}`; }
  if (diff < 30 * day) { const d = Math.floor(diff / day); return `Há ${d} dia${d > 1 ? 's' : ''}`; }
  return new Date(ts).toLocaleDateString('pt-BR');
}
function formatDateTime(ts) { return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
/* ---------------- Aging do chamado (tempo em aberto) ---------------- */
function ticketClosedAt(t) {
  if (!CLOSED_STATUSES.includes(t.status)) return null;
  const hist = [...(t.history || [])].sort((a, b) => a.at - b.at);
  return hist.length ? hist[hist.length - 1].at : t.updatedAt;
}
function agingMs(t) { const end = ticketClosedAt(t); return Math.max(0, (end ?? Date.now()) - t.createdAt); }
function formatDuration(ms) {
  const min = 60000, hr = 60 * min, day = 24 * hr;
  if (ms < min) return 'menos de 1 min';
  if (ms < hr) { const m = Math.floor(ms / min); return `${m} min`; }
  if (ms < day) { const h = Math.floor(ms / hr), m = Math.floor((ms % hr) / min); return m ? `${h}h ${m}min` : `${h}h`; }
  const d = Math.floor(ms / day), h = Math.floor((ms % day) / hr);
  return h ? `${d}d ${h}h` : `${d} dia${d > 1 ? 's' : ''}`;
}
function agingLevel(t) {
  if (CLOSED_STATUSES.includes(t.status)) return 'done';
  const days = agingMs(t) / 86400000;
  return days < 1 ? 'ok' : days < 3 ? 'warn' : 'late';
}
function agingBadge(t) {
  const closed = CLOSED_STATUSES.includes(t.status);
  const title = closed ? 'Tempo até a conclusão' : 'Tempo em aberto';
  return `<span class="aging aging-${agingLevel(t)}" title="${title}">${ICO.clock}${formatDuration(agingMs(t))}</span>`;
}
/** Quem está com o chamado no fluxo agora. */
function currentHandler(t) {
  if (t.assignedTo) { const u = findUser(t.assignedTo); return u ? `${u.name} (${u.role})` : '—'; }
  if (t.status === STATUS.AGUARDANDO) return 'Aguardando aprovação';
  if (t.assignedRole) return `Fila: ${t.assignedRole}`;
  return 'Aguardando triagem';
}
function formatSmartDate(ts) {
  const d = new Date(ts), now = new Date();
  const sod = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dd = Math.round((sod(now) - sod(d)) / 86400000);
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (dd === 0) return `Hoje, ${time}`;
  if (dd === 1) return `Ontem, ${time}`;
  return d.toLocaleDateString('pt-BR');
}
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
/** Renderiza texto do usuário com segurança: escapa HTML, transforma URLs em links e preserva quebras de linha. */
function renderRichText(text) {
  const esc = escapeHtml(text || '');
  return esc.replace(/(https?:\/\/[^\s<]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`).replace(/\n/g, '<br>');
}
function statusBadge(s) { return `<span class="badge ${STATUS_BADGE_CLASS[s] || 'badge-aberto'}">${escapeHtml(s)}</span>`; }
function priorityClass(p) { return 'priority-' + (p || 'média').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function priorityBadge(p) { return `<span class="prio ${priorityClass(p)}">${escapeHtml(p || 'Média')}</span>`; }

function myTickets() { return state.tickets.filter((t) => t.requesterId === currentUser.id); }
function pendingApprovals() { return state.tickets.filter((t) => t.approvalNeeded && t.status === STATUS.AGUARDANDO && t.requesterId !== currentUser.id); }
/** Chamados em que o usuário está envolvido (solicitante, responsável atual ou participante do histórico). */
function isInvolved(t) {
  return t.requesterId === currentUser.id || t.assignedTo === currentUser.id || (t.participants || []).includes(currentUser.id);
}
function involvedTickets() { return state.tickets.filter(isInvolved); }
/** Mescla o usuário atual (e ids extras) na lista de participantes do chamado. */
function mergeParticipants(t, extra = []) {
  return [...new Set([...(t.participants || []), currentUser.id, ...extra.filter(Boolean)])];
}
function watchedTickets() { return state.tickets.filter((t) => (t.watchers || []).includes(currentUser.id)); }
function findTicket(id) { return state.tickets.find((t) => t.id === id); }
function findUser(id) { return state.users.find((u) => u.id === id); }
function usersByRole(role) { return state.users.filter((u) => u.role === role && u.active); }
function isMyQueue(t) {
  if (CLOSED_STATUSES.includes(t.status) || !t.assignedRole) return false;
  if (isAdmin()) return true;
  if (t.assignedTo) return t.assignedTo === currentUser.id;
  return t.assignedRole === currentUser.role;
}
function queueTickets() { return state.tickets.filter(isMyQueue); }
/** Escopo de "Meus Atendimentos": tudo que participo + a minha fila (atendentes/admin). */
function scopeTickets() {
  const map = new Map();
  for (const t of involvedTickets()) map.set(t.id, t);
  if (isHandler()) for (const t of queueTickets()) map.set(t.id, t);
  return [...map.values()];
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

/* ---------------- Tema ---------------- */
function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }
function currentTheme() {
  try { const t = localStorage.getItem(THEME_KEY); if (t) return t; } catch (e) {}
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function toggleTheme() {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  const menu = document.getElementById('user-menu');
  if (menu && menu.classList.contains('open')) renderUserMenu();
}

/* ============================================================
   Persistência (escritas no Supabase)
   ============================================================ */
async function patchTicket(t, patch, historyText) {
  const now = Date.now();
  const history = [...(t.history || [])];
  if (historyText) history.push({ text: historyText, at: now });
  const dbPatch = {};
  if ('status' in patch) dbPatch.status = patch.status;
  if ('assignedRole' in patch) dbPatch.assigned_role = patch.assignedRole;
  if ('assignedTo' in patch) dbPatch.assigned_to = patch.assignedTo;
  if ('watchers' in patch) dbPatch.watchers = patch.watchers;
  if ('participants' in patch) dbPatch.participants = patch.participants;
  const { error } = await sb.rpc('update_ticket', {
    p_ticket_id: t.id,
    p_patch: dbPatch,
    p_history_text: historyText || null,
  });
  if (error) { toast('Erro ao salvar: ' + error.message, 'error'); return false; }
  Object.assign(t, patch, { history, updatedAt: now });
  return true;
}

/* ============================================================
   Header / sidebar / overview
   ============================================================ */
function mi(icon, text) { return `<span class="mi-label"><span class="mi-icon">${icon}</span><span class="mi-text">${text}</span></span>`; }

function buildHeader() {
  return `
    <div class="logo"><span class="logo-text"><strong>COP</strong> <em>SERV</em></span></div>
    <div class="global-search">
      <span class="gs-icon">${ICO.search}</span>
      <input type="text" id="global-search-input" placeholder="O que você precisa? Pesquise serviços, chamados, sistemas...">
      <span class="kbd">Ctrl + K</span>
    </div>
    <div class="header-right">
      <button class="btn btn-header-new" id="btn-new-ticket">${ICO.plus}<span>Novo chamado</span></button>
      <button class="header-icon-btn" id="btn-theme" title="Alternar tema">${ICO.moon}</button>
      <button class="header-icon-btn" id="btn-notifications" title="Notificações">${ICO.bell}<span class="badge-count hidden" id="notif-badge">0</span></button>
      <button class="header-icon-btn" data-static title="Ajuda">${ICO.help}</button>
      <button class="user-profile" id="btn-user-menu" type="button">
        <div class="avatar" id="user-avatar-display">--</div>
        <div class="user-meta"><div class="user-name" id="user-name-display">—</div><div class="user-role" id="user-role-display">—</div></div>
        <span class="uc-chevron">${ICO.chevronDown}</span>
      </button>
    </div>
    <div class="dropdown-panel" id="notif-panel"><div class="dropdown-header">Notificações</div><div id="notif-list"></div></div>
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
      <div class="um-id"><div class="um-name">${escapeHtml(currentUser.name)}</div><div class="um-email">${escapeHtml(currentUser.email)}</div><div class="um-role-tag">${escapeHtml(currentUser.role)}</div></div>
    </div>
    <button class="um-item" id="um-theme"><span class="um-item-ico">${dark ? ICO.sun : ICO.moon}</span><span>${dark ? 'Modo claro' : 'Modo escuro'}</span></button>
    ${isAdmin() ? `<button class="um-item" data-view-nav="users"><span class="um-item-ico">${ICO.users}</span><span>Gerenciar usuários</span></button>` : ''}
    <button class="um-item um-item-danger" id="um-logout"><span class="um-item-ico">${ICO.logout}</span><span>Sair</span></button>
  `;
}
function buildSidebar() {
  const serviceItems = CATEGORIES.filter((c) => c.id !== 'other').map((c) => `
    <button class="menu-item" data-view="catalog" data-category="${c.id}">${mi(catIconHtml(c), escapeHtml(c.label))}<span class="mi-chevron">${ICO.chevronRight}</span></button>`).join('');
  const pages = visiblePages();
  const pagesItems = pages.map((p) => `
    <button class="menu-item" data-view="page" data-page="${p.id}">${mi(`<span class="emoji-ico">${escapeHtml(p.icon || '📄')}</span>`, escapeHtml(p.title))}${!p.visible ? '<span class="mi-tag">oculta</span>' : ''}</button>`).join('');
  const pagesSection = pages.length ? `<div class="menu-section"><div class="menu-label">Páginas</div>${pagesItems}</div>` : '';
  const adminSection = isAdmin() ? `
    <div class="menu-section menu-section-footer">
      <div class="menu-label">Administração</div>
      <button class="menu-item" data-view="users">${mi(ICO.users, 'Usuários')}</button>
      <button class="menu-item" data-view="catalog" data-category="__admin__">${mi(ICO.settings, 'Editar catálogo')}</button>
      <button class="menu-item" data-view="pages">${mi(ICO.edit, 'Páginas')}</button>
    </div>` : '';
  return `
    <div class="sidebar-scroll">
      <div class="menu-section">
        <button class="menu-item" data-view="overview">${mi(ICO.home, 'Overview')}</button>
        <button class="menu-item" data-view="tickets">${mi(ICO.inbox, 'Meus Chamados')}<span class="mi-count" data-count="tickets">0</span></button>
        <button class="menu-item" data-view="atendimentos">${mi(ICO.briefcase, 'Meus Atendimentos')}<span class="mi-count hidden" data-count="atendimentos">0</span></button>
        <button class="menu-item" data-view="approvals">${mi(ICO.checkCircle, 'Minhas Aprovações')}<span class="mi-count" data-count="approvals">0</span></button>
        <button class="menu-item" data-view="assets">${mi(ICO.device, 'Meus Ativos')}</button>
      </div>
      <div class="menu-section"><div class="menu-label">Serviços</div>${serviceItems}</div>
      ${pagesSection}
      ${adminSection}
    </div>
    <button class="sidebar-collapse" id="sidebar-collapse">${ICO.collapse}<span>Recolher menu</span></button>
  `;
}
function renderSidebar() {
  const el = document.getElementById('sidebar');
  el.innerHTML = buildSidebar();
  const collapse = document.getElementById('sidebar-collapse');
  if (collapse) collapse.addEventListener('click', () => el.classList.toggle('collapsed'));
  document.querySelectorAll('.menu-item').forEach((m) => m.classList.toggle('active', isMenuActive(m)));
}
function isMenuActive(m) {
  const mv = m.getAttribute('data-view'), mc = m.getAttribute('data-category'), mp = m.getAttribute('data-page');
  if (mv !== activeView) return false;
  if (activeView === 'catalog') return mc === activeCategory;
  if (activeView === 'page') return mp === activePageId;
  return true;
}
function buildOverviewSkeleton() {
  return `
    <div class="hero">
      <div class="hero-dots"></div>
      <div class="hero-text">
        <h1 id="hero-greeting">Bom dia!</h1>
        <p>Como podemos ajudar você hoje?</p>
        <div class="hero-search"><span class="hs-icon">${ICO.search}</span><input type="text" id="hero-search-input" placeholder="Descreva o que você precisa ou pesquise um serviço..."><button id="hero-search-btn">${ICO.arrowRight}</button></div>
        <div class="chip-row"><span class="chip-label">Exemplos populares:</span>
          <button class="chip" data-chip="tabela">Criar tabela</button><button class="chip" data-chip="query">Criar Query</button>
          <button class="chip" data-chip="dashboard">Dashboard</button><button class="chip" data-chip="report">Report</button><button class="chip" data-chip="análise">Análises</button>
        </div>
      </div>
      <div class="hero-illustration" id="hero-illustration">
        <div id="hero-art">${ILLUSTRATION}</div>
        ${isAdmin() ? `<div class="hero-img-tools">
          <button class="hero-img-btn" id="hero-img-import" title="Importar imagem">${ICO.upload || ICO.edit} Importar imagem</button>
          <button class="hero-img-btn hero-img-reset" id="hero-img-reset" title="Restaurar ilustração padrão">${ICO.trash}</button>
        </div>` : ''}
      </div>
    </div>
    <div class="left-stack">
      <div class="panel"><div class="panel-header"><div class="panel-title">Chamados em aberto</div><span class="panel-hint" id="open-tickets-hint"></span></div><div id="open-tickets-list"></div><button class="panel-footer-link" id="open-tickets-more" data-view-nav="tickets">Ver todos os chamados</button></div>
      <div class="panel"><div class="panel-header"><div class="panel-title">Meus chamados recentes</div><button class="panel-link" data-stat-nav="tickets">Ver todos</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Serviço</th><th>Status</th><th>Atualizado</th></tr></thead><tbody id="recent-tickets-body"></tbody></table></div></div>
    </div>
  `;
}

/* ============================================================
   Navegação / render
   ============================================================ */
let activeView = 'overview';
let activeCategory = null;
let catalogSearchTerm = '';
let searchQuery = '';

function switchView(view, opts = {}) {
  activeView = view;
  if (opts.category !== undefined) activeCategory = opts.category;
  if (opts.search !== undefined) { catalogSearchTerm = opts.search; if (view === 'search') searchQuery = opts.search; }
  if (opts.page !== undefined) activePageId = opts.page;
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(`view-${view}`);
  if (target) target.classList.add('active');
  document.querySelectorAll('.menu-item').forEach((m) => m.classList.toggle('active', isMenuActive(m)));
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}
function renderCurrentView() {
  switch (activeView) {
    case 'overview': renderOverview(); break;
    case 'catalog': renderCatalog(); break;
    case 'tickets': renderTicketTable('view-tickets-body', myTickets(), 'Você ainda não abriu nenhum chamado.'); break;
    case 'approvals': renderApprovals(); break;
    case 'atendimentos': renderAtendimentos(); break;
    case 'search': renderSearch(); break;
    case 'watching': renderTicketTable('view-watching-body', watchedTickets(), 'Você não está observando nenhum chamado.'); break;
    case 'assets': renderAssets(); break;
    case 'users': renderUsers(); break;
    case 'page': renderPage(); break;
    case 'pages': renderPagesAdmin(); break;
  }
  updateBadges();
}
function updateBadges() {
  const pending = pendingApprovals().length;
  const openCount = myTickets().filter((t) => OPEN_STATUSES.includes(t.status)).length;
  const atendOpen = scopeTickets().filter((t) => OPEN_STATUSES.includes(t.status)).length;
  document.querySelectorAll('[data-count="approvals"]').forEach((el) => { el.textContent = pending; el.classList.toggle('hidden', pending === 0); });
  document.querySelectorAll('[data-count="tickets"]').forEach((el) => { el.textContent = openCount; el.classList.toggle('hidden', openCount === 0); });
  document.querySelectorAll('[data-count="atendimentos"]').forEach((el) => { el.textContent = atendOpen; el.classList.toggle('hidden', atendOpen === 0); });
  document.querySelectorAll('[data-count="watching"]').forEach((el) => { el.textContent = watchedTickets().length; el.classList.toggle('hidden', watchedTickets().length === 0); });
  const bell = document.getElementById('notif-badge');
  const n = notifUnreadCount();
  bell.textContent = n > 9 ? '9+' : n; bell.classList.toggle('hidden', n === 0);
}

/* ---------------- Imagem do topo (hero) ---------------- */
async function saveSetting(key, value) {
  const { error } = await sb.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  state.settings[key] = value; return true;
}
async function deleteSetting(key) {
  const { error } = await sb.from('settings').delete().eq('key', key);
  if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  delete state.settings[key]; return true;
}
function applyHeroImage() {
  const art = document.getElementById('hero-art');
  if (!art) return;
  const img = state.settings.hero_image;
  const sig = img || '__default__';
  if (art.dataset.sig !== sig) {
    art.innerHTML = img ? `<img src="${img}" alt="Ilustração do topo" class="hero-custom-img">` : ILLUSTRATION;
    art.dataset.sig = sig;
  }
  const reset = document.getElementById('hero-img-reset');
  if (reset) reset.classList.toggle('hidden', !img);
}
function handleHeroImageFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('Selecione um arquivo de imagem.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const im = new Image();
    im.onload = async () => {
      const maxW = 560;
      const scale = Math.min(1, maxW / im.width);
      const w = Math.max(1, Math.round(im.width * scale)), h = Math.max(1, Math.round(im.height * scale));
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(im, 0, 0, w, h);
      let dataUrl;
      try { dataUrl = canvas.toDataURL('image/png'); } catch (e) { dataUrl = reader.result; }
      if (dataUrl.length > 900000) dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (await saveSetting('hero_image', dataUrl)) { applyHeroImage(); toast('Imagem do topo atualizada.'); }
    };
    im.onerror = () => toast('Não foi possível ler a imagem.', 'error');
    im.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function renderOverview() {
  document.getElementById('hero-greeting').textContent = `${greeting()}, ${currentUser.name.split(' ')[0]}!`;
  applyHeroImage();
  const mine = myTickets();

  // Chamados em aberto: todos os abertos que o usuário enxerga, com quem estão no fluxo
  const open = state.tickets.filter((t) => OPEN_STATUSES.includes(t.status)).sort((a, b) => agingMs(b) - agingMs(a));
  const hint = document.getElementById('open-tickets-hint');
  if (hint) hint.textContent = open.length ? `${open.length} em aberto` : '';
  const moreBtn = document.getElementById('open-tickets-more');
  if (moreBtn) moreBtn.setAttribute('data-view-nav', 'atendimentos');
  document.getElementById('open-tickets-list').innerHTML = open.length ? open.slice(0, 8).map((t) => `
    <div class="list-row" data-ticket="${t.id}">
      <div class="lr-left"><div class="lr-icon" style="${catChipStyle(t.category)}">${catIconOr(t.category)}</div>
        <div><div class="lr-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span></div>
        <div class="lr-meta">Com: <strong>${escapeHtml(currentHandler(t))}</strong> · ${statusBadge(t.status)}</div></div></div>
      <div class="lr-right">${agingBadge(t)}</div>
    </div>`).join('') : `<div class="empty-state">Nenhum chamado em aberto no momento. 🎉</div>`;

  const recent = [...mine].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  document.getElementById('recent-tickets-body').innerHTML = recent.length ? recent.map((t) => `
    <tr data-ticket="${t.id}"><td class="mono">${t.id}</td><td>${escapeHtml(t.service || t.title)}</td><td>${statusBadge(t.status)}</td><td>${formatSmartDate(t.updatedAt)}</td></tr>`).join('')
    : `<tr><td colspan="4" class="empty-state">Nenhum chamado ainda.</td></tr>`;
}

function findServiceByTitle(category, title) {
  const groups = SERVICES[category] || [];
  for (const g of groups) { const it = g.items.find((i) => i.title === title); if (it) return it; }
  return null;
}
function findServiceById(id) {
  for (const catId of Object.keys(SERVICES)) for (const g of SERVICES[catId]) { const it = g.items.find((i) => i.id === id); if (it) return { item: it, group: g, catId }; }
  return null;
}

function renderCategoryTabs() {
  document.getElementById('category-tabs').innerHTML = `<button class="category-tab ${!activeCategory ? 'active' : ''}" data-cat-tab="">Todos</button>` +
    CATEGORIES.map((c) => `<button class="category-tab ${activeCategory === c.id ? 'active' : ''}" data-cat-tab="${c.id}" style="${activeCategory === c.id ? `background:${catColor(c.id).c};border-color:${catColor(c.id).c}` : ''}">${escapeHtml(c.icon || '')} ${escapeHtml(c.label)}</button>`).join('');
}
function renderCatalog() {
  const adminMode = isAdmin() && activeCategory === '__admin__';
  document.getElementById('catalog-admin-bar').innerHTML = isAdmin() ? `
    <div class="admin-bar">
      <div class="admin-bar-info">${adminMode ? '✎ Modo edição do catálogo ativo — inclua, edite ou exclua categorias e serviços.' : 'Você é administrador. Abra “Editar catálogo” no menu para gerenciar.'}</div>
      <div class="admin-bar-actions">${adminMode ? `<button class="btn btn-secondary btn-sm" data-new-category>${ICO.plus} Nova categoria</button>` : `<button class="btn btn-secondary btn-sm" data-view="catalog" data-category="__admin__">${ICO.edit} Editar catálogo</button>`}</div>
    </div>` : '';
  renderCategoryTabs();
  document.getElementById('catalog-search').value = catalogSearchTerm;

  const showAll = !activeCategory || activeCategory === '__admin__';
  const cats = showAll ? CATEGORIES.map((c) => c.id) : [activeCategory];
  const term = catalogSearchTerm.trim().toLowerCase();
  let html = '';
  cats.forEach((catId) => {
    const groups = SERVICES[catId] || [];
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;
    let catHtml = '';
    groups.forEach((group) => {
      const items = group.items.filter((i) => !term || i.title.toLowerCase().includes(term) || (i.desc || '').toLowerCase().includes(term));
      if (!items.length && !adminMode) return;
      catHtml += `<div class="section-subtitle">${escapeHtml(group.sub)}</div><div class="card-grid">
        ${items.map((i) => `
          <div class="service-card ${adminMode ? 'service-card-admin' : ''}" ${adminMode ? '' : `data-open-service="${catId}::${escapeHtml(i.title)}"`}>
            <div class="card-icon" style="${catChipStyle(catId)}">${escapeHtml(i.icon || '📄')}</div><div class="card-title">${escapeHtml(i.title)}</div><div class="card-description">${escapeHtml(i.desc || '')}</div>
            ${i.approval ? `<div class="card-approval-tag">Requer aprovação</div>` : ''}
            ${adminMode ? `<div class="card-admin-actions"><button class="icon-btn" data-edit-service="${i.id}" title="Editar">${ICO.edit}</button><button class="icon-btn icon-btn-danger" data-delete-service="${i.id}" title="Excluir">${ICO.trash}</button></div>` : ''}
          </div>`).join('')}
        ${adminMode ? `<button class="service-card service-card-add" data-new-service="${catId}::${escapeHtml(group.sub)}">${ICO.plus}<span>Novo serviço</span></button>` : ''}
      </div>`;
    });
    if (adminMode && !groups.length) catHtml += `<div class="card-grid"><button class="service-card service-card-add" data-new-service="${catId}::Serviços">${ICO.plus}<span>Novo serviço</span></button></div>`;
    if (catHtml || adminMode) {
      html += `<div class="section"><div class="section-title"><div class="section-accent"></div>${escapeHtml(cat.icon || '')} ${escapeHtml(cat.label)}
        ${adminMode ? `<div class="section-admin-actions"><button class="icon-btn" data-edit-category="${cat.id}" title="Renomear">${ICO.edit}</button><button class="icon-btn icon-btn-danger" data-delete-category="${cat.id}" title="Excluir">${ICO.trash}</button></div>` : ''}
      </div>${catHtml}</div>`;
    }
  });
  document.getElementById('catalog-content').innerHTML = html || `<div class="empty-state">Nenhum serviço encontrado para "${escapeHtml(catalogSearchTerm)}".</div>`;
}

function renderTicketTable(bodyId, tickets, emptyMsg) {
  const sorted = [...tickets].sort((a, b) => b.updatedAt - a.updatedAt);
  document.getElementById(bodyId).innerHTML = sorted.length ? sorted.map((t) => `
    <tr data-ticket="${t.id}"><td class="mono">${t.id}</td><td>${escapeHtml(t.service || t.title)}</td><td>${escapeHtml(categoryLabel(t.category))}</td><td>${escapeHtml(t.requester)}</td><td>${priorityBadge(t.priority)}</td><td>${statusBadge(t.status)}</td><td>${agingBadge(t)}</td><td>${timeAgo(t.updatedAt)}</td></tr>`).join('')
    : `<tr><td colspan="8" class="empty-state">${emptyMsg}</td></tr>`;
}
function renderApprovals() {
  const pend = pendingApprovals();
  document.getElementById('approvals-full-list').innerHTML = pend.length ? pend.map((t) => `
    <div class="panel" style="margin-bottom:10px;"><div class="list-row" data-ticket="${t.id}" style="padding:0;">
      <div class="lr-left"><div class="lr-icon">${ICO.ticket}</div><div><div class="lr-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span></div><div class="lr-meta">Solicitado por ${escapeHtml(t.requester)} · ${escapeHtml(categoryLabel(t.category))} · ${timeAgo(t.createdAt)}</div></div></div>
      <div class="lr-right"><button class="btn btn-secondary btn-sm" data-ticket="${t.id}">Ver detalhes</button><button class="icon-btn approve" data-approve="${t.id}" title="Aprovar">✓</button><button class="icon-btn reject" data-reject="${t.id}" title="Rejeitar">✕</button></div>
    </div></div>`).join('') : `<div class="empty-state">Nenhuma aprovação pendente. 🎉</div>`;
}
let atendFilter = 'abertos';
function renderAtendimentos() {
  let tickets = scopeTickets();
  if (atendFilter === 'abertos') tickets = tickets.filter((t) => OPEN_STATUSES.includes(t.status));
  tickets = tickets.sort((a, b) => agingMs(b) - agingMs(a));
  const openN = scopeTickets().filter((t) => OPEN_STATUSES.includes(t.status)).length;
  const allN = scopeTickets().length;
  const sub = document.getElementById('atend-subtitle');
  if (sub) sub.textContent = isHandler()
    ? 'Chamados sob sua responsabilidade (sua fila) e todos em que você participa — abrir, assumir, encaminhar, aprovar ou comentar.'
    : 'Chamados em que você participa — abertos por você ou onde atuou. Você mantém o histórico completo.';
  const seg = document.getElementById('atend-filter');
  if (seg) seg.innerHTML = `
    <button class="seg-btn ${atendFilter === 'abertos' ? 'active' : ''}" data-atend-filter="abertos">Abertos (${openN})</button>
    <button class="seg-btn ${atendFilter === 'todos' ? 'active' : ''}" data-atend-filter="todos">Todos (${allN})</button>`;
  const emptyMsg = atendFilter === 'abertos'
    ? 'Nenhum chamado em aberto para você no momento. 🎉'
    : 'Você ainda não participou de nenhum chamado.';
  document.getElementById('atend-list').innerHTML = tickets.length ? tickets.map((t) => {
    const actions = isMyQueue(t) ? queueActionButtons(t) : '';
    return `<div class="panel queue-card" style="margin-bottom:10px;"><div class="list-row" data-ticket="${t.id}" style="padding:0;">
      <div class="lr-left"><div class="lr-icon" style="${catChipStyle(t.category)}">${catIconOr(t.category)}</div><div>
        <div class="lr-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span> ${statusBadge(t.status)}</div>
        <div class="lr-meta">Solicitante: ${escapeHtml(t.requester)} · ${escapeHtml(categoryLabel(t.category))} · ${priorityBadge(t.priority)}</div>
        <div class="lr-meta">Com: <strong>${escapeHtml(currentHandler(t))}</strong> · ${timeAgo(t.updatedAt)} · ${agingBadge(t)}</div>
      </div></div>
      ${actions ? `<div class="lr-right">${actions}</div>` : ''}</div></div>`;
  }).join('') : `<div class="empty-state">${emptyMsg}</div>`;
}
function queueActionButtons(t) {
  const canForward = rolesBelow(currentUser.role).length > 0;
  const notMine = !t.assignedTo || t.assignedTo !== currentUser.id;
  return `${notMine && !isAdmin() ? `<button class="btn btn-secondary btn-sm" data-assume="${t.id}">Assumir</button>` : ''}
    ${canForward ? `<button class="btn btn-secondary btn-sm" data-forward="${t.id}">${ICO.forward} Encaminhar</button>` : ''}
    <button class="btn btn-primary btn-sm" data-resolve="${t.id}">Resolver</button>`;
}
function normStr(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function ticketMatches(t, q) {
  const who = t.assignedTo ? (findUser(t.assignedTo)?.name || '') : '';
  const parts = (t.participants || []).map((id) => findUser(id)?.name || '').join(' ');
  return normStr([t.id, t.title, t.description, t.service, categoryLabel(t.category), t.requester, t.priority, t.status, who, parts].join(' ')).includes(q);
}
function renderSearch() {
  const raw = (searchQuery || '').trim();
  const q = normStr(raw);
  const sub = document.getElementById('search-subtitle');
  if (sub) sub.textContent = raw ? `Resultados para "${raw}"` : 'Encontre chamados por número, solicitante, responsável ou palavra-chave';
  const el = document.getElementById('search-results');
  if (!q) { el.innerHTML = `<div class="empty-state">Digite na busca do topo para encontrar um chamado pelo número (ex.: IT-10319), solicitante, responsável ou palavra-chave.</div>`; return; }
  const tickets = state.tickets.filter((t) => ticketMatches(t, q)).sort((a, b) => b.updatedAt - a.updatedAt);
  const services = [];
  for (const c of CATEGORIES) for (const g of (SERVICES[c.id] || [])) for (const it of g.items) { if (normStr(it.title + ' ' + (it.desc || '')).includes(q)) services.push({ catId: c.id, it }); }
  let html = `<div class="panel" style="margin-bottom:14px;"><div class="panel-header"><div class="panel-title">Chamados (${tickets.length})</div></div>`;
  html += tickets.length ? tickets.map((t) => `
    <div class="list-row" data-ticket="${t.id}">
      <div class="lr-left"><div class="lr-icon" style="${catChipStyle(t.category)}">${catIconOr(t.category)}</div>
        <div><div class="lr-title">${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span> ${statusBadge(t.status)}</div>
        <div class="lr-meta">Solicitante: ${escapeHtml(t.requester)} · Com: <strong>${escapeHtml(currentHandler(t))}</strong> · ${escapeHtml(categoryLabel(t.category))}</div></div></div>
      <div class="lr-right">${agingBadge(t)}</div>
    </div>`).join('') : `<div class="empty-state">Nenhum chamado encontrado para "${escapeHtml(raw)}".</div>`;
  html += `</div>`;
  if (services.length) {
    html += `<div class="panel"><div class="panel-header"><div class="panel-title">Serviços (${services.length})</div></div><div class="card-grid" style="padding-top:6px;">`;
    html += services.map(({ catId, it }) => `
      <div class="service-card" data-open-service="${catId}::${escapeHtml(it.title)}">
        <div class="card-icon" style="${catChipStyle(catId)}">${escapeHtml(it.icon || '📄')}</div>
        <div class="card-title">${escapeHtml(it.title)}</div><div class="card-description">${escapeHtml(it.desc || '')}</div>
      </div>`).join('');
    html += `</div></div>`;
  }
  el.innerHTML = html;
}
function renderAssets() {
  const assets = state.tickets.filter((t) => t.requesterId === currentUser.id && t.status === STATUS.RESOLVIDO && (t.category === 'hardware' || t.category === 'software'));
  document.getElementById('assets-list').innerHTML = assets.length ? assets.map((t) => `
    <div class="list-row" data-ticket="${t.id}"><div class="lr-left"><div class="lr-icon">${t.category === 'hardware' ? ICO.laptop : ICO.grid}</div><div><div class="lr-title">${escapeHtml(t.service || t.title)}</div><div class="lr-meta">Atribuído em ${formatDateTime(t.updatedAt)} · ${t.id}</div></div></div>
      <div class="lr-right"><button class="btn btn-secondary btn-sm" data-report-asset="${t.id}">Reportar problema</button></div></div>`).join('')
    : `<div class="empty-state">Nenhum ativo atribuído ainda. Ativos aparecem aqui quando um chamado de hardware/software é resolvido.</div>`;
}
function renderUsers() {
  const rows = [...state.users].sort((a, b) => (a.role.localeCompare(b.role)) || a.name.localeCompare(b.name));
  document.getElementById('users-body').innerHTML = rows.map((u) => `
    <tr><td><div class="user-cell"><div class="avatar avatar-sm">${escapeHtml(initialsOf(u.name))}</div><div><div class="uc-name">${escapeHtml(u.name)}${u.id === currentUser.id ? ' <span class="mono">(você)</span>' : ''}</div><div class="uc-email">${escapeHtml(u.email)}</div></div></div></td>
      <td><span class="role-tag">${escapeHtml(u.role)}</span></td>
      <td>${u.active ? '<span class="badge badge-aprovado">Ativo</span>' : '<span class="badge badge-cancelado">Inativo</span>'}</td>
      <td class="ta-right"><button class="icon-btn" data-edit-user="${u.id}" title="Editar">${ICO.edit}</button><button class="icon-btn icon-btn-danger" data-delete-user="${u.id}" title="Excluir" ${u.id === currentUser.id ? 'disabled' : ''}>${ICO.trash}</button></td>
    </tr>`).join('');
}
function renderPage() {
  const p = findPage(activePageId) || visiblePages()[0];
  const head = document.getElementById('page-view-header');
  const body = document.getElementById('page-view-content');
  if (!p) {
    if (head) head.innerHTML = '';
    if (body) body.innerHTML = `<div class="empty-state">Esta página não está mais disponível.</div>`;
    return;
  }
  activePageId = p.id;
  if (head) head.innerHTML = `<div class="page-title"><span class="page-title-emoji">${escapeHtml(p.icon || '📄')}</span> ${escapeHtml(p.title)}</div>${p.visible ? '' : '<div class="page-subtitle">Página oculta — visível apenas para administradores.</div>'}`;
  const adminBar = isAdmin() ? `<div class="page-admin-bar"><button class="btn btn-secondary btn-sm" data-edit-page="${p.id}">${ICO.edit} Editar</button><button class="btn btn-secondary btn-sm" data-delete-page="${p.id}">${ICO.trash} Excluir</button></div>` : '';
  const content = (p.content || '').trim() ? `<div class="page-content">${renderRichText(p.content)}</div>` : `<div class="empty-state">Esta página ainda não tem conteúdo.</div>`;
  if (body) body.innerHTML = adminBar + content;
}
function renderPagesAdmin() {
  const rows = [...state.pages].sort((a, b) => (a.position - b.position) || a.title.localeCompare(b.title));
  document.getElementById('pages-admin-body').innerHTML = rows.length ? rows.map((p) => `
    <tr>
      <td><div class="user-cell"><div class="page-icon-cell">${escapeHtml(p.icon || '📄')}</div><div class="uc-name">${escapeHtml(p.title)}</div></div></td>
      <td>${p.visible ? '<span class="badge badge-aprovado">Visível</span>' : '<span class="badge badge-cancelado">Oculta</span>'}</td>
      <td class="ta-right"><button class="btn btn-secondary btn-sm" data-view-page-nav="${p.id}">Abrir</button><button class="icon-btn" data-edit-page="${p.id}" title="Editar">${ICO.edit}</button><button class="icon-btn icon-btn-danger" data-delete-page="${p.id}" title="Excluir">${ICO.trash}</button></td>
    </tr>`).join('') : `<tr><td colspan="3" class="empty-state">Nenhuma página personalizada ainda. Clique em "Nova página" para criar a primeira.</td></tr>`;
}
/* ---------------- Notificações (todos os envolvidos são avisados) ---------------- */
function notifSeenKey() { return 'copserv_notif_seen_' + (currentUser ? currentUser.id : ''); }
function getNotifLastSeen() { try { return parseInt(localStorage.getItem(notifSeenKey()) || '0', 10) || 0; } catch (e) { return 0; } }
function setNotifLastSeen(ts) { try { localStorage.setItem(notifSeenKey(), String(ts)); } catch (e) { /* ignore */ } }
/** Última movimentação de cada chamado em que o usuário está envolvido (ou na sua fila). */
function notifItems() {
  const map = new Map();
  const add = (t, queue) => {
    const last = (t.history || [])[t.history.length - 1];
    if (last) map.set(t.id, { t, last, queue: queue || map.get(t.id)?.queue });
  };
  for (const t of involvedTickets()) add(t, false);
  if (isHandler()) for (const t of queueTickets()) add(t, true);
  return [...map.values()].sort((a, b) => b.last.at - a.last.at);
}
function notifUnreadCount() { const seen = getNotifLastSeen(); return notifItems().filter((x) => x.last.at > seen).length; }
function renderNotifications() {
  const seen = getNotifLastSeen();
  const list = notifItems().slice(0, 15);
  document.getElementById('notif-list').innerHTML = list.length ? list.map(({ t, last, queue }) => {
    const unread = last.at > seen;
    return `<div class="dropdown-item ${unread ? 'unread' : ''}" data-ticket="${t.id}">
      <div class="di-title">${unread ? '<span class="di-dot"></span>' : ''}${queue ? '📥 ' : ''}${escapeHtml(t.service || t.title)} <span class="mono">(${t.id})</span></div>
      <div class="di-meta">${escapeHtml(last.text)} · ${timeAgo(last.at)}</div></div>`;
  }).join('') : `<div class="dropdown-empty">Sem notificações recentes.</div>`;
}
function markNotificationsSeen() {
  const items = notifItems();
  if (items.length) setNotifLastSeen(Math.max(getNotifLastSeen(), items[0].last.at));
  const bell = document.getElementById('notif-badge');
  if (bell) { bell.textContent = '0'; bell.classList.add('hidden'); }
}

/* ============================================================
   Modais
   ============================================================ */
function setModalOrigin(modalEl, ev) {
  if (!modalEl) return;
  if (ev && typeof ev.clientX === 'number' && window.innerWidth && window.innerHeight) {
    modalEl.style.setProperty('--origin-x', `${(ev.clientX / window.innerWidth) * 100}%`);
    modalEl.style.setProperty('--origin-y', `${(ev.clientY / window.innerHeight) * 100}%`);
  } else { modalEl.style.removeProperty('--origin-x'); modalEl.style.removeProperty('--origin-y'); }
}
function openModal(id, ev) { const o = document.getElementById(id); setModalOrigin(o.querySelector('.modal'), ev); o.classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openNewTicketModal(category, serviceTitle, ev) {
  const form = document.getElementById('ticket-form'); form.reset();
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
  openModal('ticket-modal', ev);
  document.getElementById('field-title').focus();
}
function openTicketDetail(id, ev) { const t = findTicket(id); if (!t) return; renderTicketDetail(t); openModal('detail-modal', ev); }
function renderTicketDetail(t) {
  document.getElementById('detail-modal-title').textContent = `${t.service || t.title} · ${t.id}`;
  const resp = t.assignedTo ? (findUser(t.assignedTo)?.name || '—') : (t.assignedRole ? `Fila: ${t.assignedRole}` : '—');
  document.getElementById('detail-meta').innerHTML = `
    <div class="detail-meta-item"><div class="detail-meta-label">Status</div><div class="detail-meta-value">${statusBadge(t.status)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Categoria</div><div class="detail-meta-value">${escapeHtml(categoryLabel(t.category))}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Solicitante</div><div class="detail-meta-value">${escapeHtml(t.requester)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Prioridade</div><div class="detail-meta-value">${priorityBadge(t.priority)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Responsável</div><div class="detail-meta-value">${escapeHtml(resp)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">Aberto em</div><div class="detail-meta-value">${formatDateTime(t.createdAt)}</div></div>
    <div class="detail-meta-item"><div class="detail-meta-label">${CLOSED_STATUSES.includes(t.status) ? 'Tempo até a conclusão' : 'Tempo em aberto'}</div><div class="detail-meta-value">${agingBadge(t)}</div></div>`;

  const partNames = (t.participants || []).map((pid) => findUser(pid)?.name).filter(Boolean);
  const partEl = document.getElementById('detail-participants');
  if (partEl) partEl.innerHTML = partNames.length
    ? `<div class="detail-meta-label">Participantes (${partNames.length})</div><div class="participants-chips">${partNames.map((n) => `<span class="participant-chip">${escapeHtml(n)}</span>`).join('')}</div>`
    : '';

  document.getElementById('detail-desc').textContent = t.description;
  const hist = [...(t.history || [])].sort((a, b) => b.at - a.at);
  document.getElementById('detail-timeline').innerHTML = hist.map((h) => `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-text">${escapeHtml(h.text)}</div><div class="timeline-time">${formatDateTime(h.at)}</div></div></div>`).join('');

  const isWatching = (t.watchers || []).includes(currentUser.id);
  const isCancellable = !CLOSED_STATUSES.includes(t.status) && t.requesterId === currentUser.id;
  const isReopenable = [STATUS.RESOLVIDO, STATUS.CANCELADO].includes(t.status) && t.requesterId === currentUser.id;
  const canApprove = t.approvalNeeded && t.status === STATUS.AGUARDANDO && t.requesterId !== currentUser.id && isHandler();
  const mine = isMyQueue(t);
  const canForward = mine && rolesBelow(currentUser.role).length > 0;
  document.getElementById('detail-actions').innerHTML = `
    <button class="btn btn-secondary btn-sm" data-detail-watch="${t.id}">${isWatching ? '★ Deixar de observar' : '☆ Observar'}</button>
    ${canApprove ? `<button class="btn btn-primary btn-sm" data-detail-approve="${t.id}">Aprovar</button><button class="btn btn-danger btn-sm" data-detail-reject="${t.id}">Rejeitar</button>` : ''}
    ${mine && (!t.assignedTo || t.assignedTo !== currentUser.id) && !isAdmin() ? `<button class="btn btn-secondary btn-sm" data-detail-assume="${t.id}">Assumir</button>` : ''}
    ${canForward ? `<button class="btn btn-secondary btn-sm" data-detail-forward="${t.id}">${ICO.forward} Encaminhar</button>` : ''}
    ${mine ? `<button class="btn btn-primary btn-sm" data-detail-resolve="${t.id}">Resolver</button>` : ''}
    ${isReopenable ? `<button class="btn btn-secondary btn-sm" data-detail-reopen="${t.id}">Reabrir chamado</button>` : ''}
    ${isCancellable ? `<button class="btn btn-danger btn-sm" data-detail-cancel="${t.id}">Cancelar chamado</button>` : ''}`;
  document.getElementById('detail-comment-form').dataset.ticket = t.id;
}

let forwardTicketId = null;
function openForwardModal(ticketId, ev) {
  const t = findTicket(ticketId); if (!t) return;
  forwardTicketId = ticketId;
  const roles = rolesBelow(currentUser.role);
  document.getElementById('forward-role').innerHTML = roles.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');
  document.getElementById('forward-ticket-label').textContent = `${t.service || t.title} · ${t.id}`;
  fillForwardPeople(roles[0]);
  document.getElementById('forward-note').value = '';
  openModal('forward-modal', ev);
}
function fillForwardPeople(role) {
  const people = usersByRole(role);
  document.getElementById('forward-user').innerHTML = people.length ? people.map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('') : `<option value="">— Nenhum usuário com esse papel —</option>`;
}

let editingUserId = null;
function openUserModal(userId, ev) {
  editingUserId = userId || null;
  const u = userId ? findUser(userId) : null;
  document.getElementById('user-modal-title').textContent = u ? 'Editar usuário' : 'Novo usuário';
  document.getElementById('u-name').value = u ? u.name : '';
  document.getElementById('u-email').value = u ? u.email : '';
  document.getElementById('u-password').value = '';
  document.getElementById('u-password').placeholder = u ? '(deixe em branco para manter)' : '';
  const roleSel = document.getElementById('u-role');
  roleSel.innerHTML = ALL_ROLES.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');
  roleSel.value = u ? u.role : ROLE.COLABORADOR;
  document.getElementById('u-active').checked = u ? !!u.active : true;
  openModal('user-modal', ev);
  document.getElementById('u-name').focus();
}

let editingCategoryId = null;
function openCategoryModal(catId, ev) {
  editingCategoryId = catId || null;
  const c = catId ? CATEGORIES.find((x) => x.id === catId) : null;
  document.getElementById('category-modal-title').textContent = c ? 'Renomear categoria' : 'Nova categoria';
  document.getElementById('cat-label').value = c ? c.label : '';
  document.getElementById('cat-icon').value = c ? (c.icon || '') : '📁';
  openModal('category-modal', ev);
  document.getElementById('cat-label').focus();
}

let editingServiceId = null, newServiceTarget = null;
function openServiceModal(opts, ev) {
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
  openModal('service-modal', ev);
  document.getElementById('svc-title').focus();
}

let editingPageId = null;
function openPageModal(pageId, ev) {
  editingPageId = pageId || null;
  const p = pageId ? findPage(pageId) : null;
  document.getElementById('page-modal-title').textContent = p ? 'Editar página' : 'Nova página';
  document.getElementById('pg-title').value = p ? p.title : '';
  document.getElementById('pg-icon').value = p ? (p.icon || '📄') : '📄';
  document.getElementById('pg-content').value = p ? (p.content || '') : '';
  document.getElementById('pg-visible').checked = p ? !!p.visible : true;
  openModal('page-modal', ev);
  document.getElementById('pg-title').focus();
}

/* ============================================================
   Ações de chamado (Supabase)
   ============================================================ */
async function approveTicket(id) {
  const t = findTicket(id); if (!t) return;
  if (await patchTicket(t, { status: STATUS.ANDAMENTO, assignedRole: t.assignedRole || ROLE.COORDENADOR, participants: mergeParticipants(t) }, `Aprovado por ${currentUser.name}`)) { toast(`Chamado ${id} aprovado.`); renderCurrentView(); }
}
async function rejectTicket(id) {
  const t = findTicket(id); if (!t) return;
  if (await patchTicket(t, { status: STATUS.REJEITADO, participants: mergeParticipants(t) }, `Rejeitado por ${currentUser.name}`)) { toast(`Chamado ${id} rejeitado.`, 'error'); renderCurrentView(); }
}
async function resolveTicket(id) {
  const t = findTicket(id); if (!t) return;
  if (await patchTicket(t, { status: STATUS.RESOLVIDO, participants: mergeParticipants(t) }, `Chamado marcado como resolvido por ${currentUser.name}`)) { toast(`Chamado ${id} resolvido.`); renderCurrentView(); }
}
async function cancelTicket(id) {
  const t = findTicket(id); if (!t) return;
  if (await patchTicket(t, { status: STATUS.CANCELADO, participants: mergeParticipants(t) }, `Chamado cancelado por ${currentUser.name}`)) { toast(`Chamado ${id} cancelado.`); renderCurrentView(); }
}
async function reopenTicket(id) {
  const t = findTicket(id); if (!t) return;
  if (await patchTicket(t, { status: STATUS.ABERTO, assignedRole: t.assignedRole || ROLE.COORDENADOR, participants: mergeParticipants(t) }, `Chamado reaberto por ${currentUser.name}`)) { toast(`Chamado ${id} reaberto.`); renderCurrentView(); }
}
async function assumeTicket(id) {
  const t = findTicket(id); if (!t) return;
  const patch = { assignedTo: currentUser.id, assignedRole: currentUser.role, participants: mergeParticipants(t) };
  if (t.status === STATUS.ANALISE) patch.status = STATUS.ANDAMENTO;
  if (await patchTicket(t, patch, `Assumido por ${currentUser.name} (${currentUser.role})`)) { toast(`Você assumiu o chamado ${id}.`); renderCurrentView(); }
}
async function forwardTicket(id, toUserId, role, note) {
  const t = findTicket(id); if (!t) return;
  const to = findUser(toUserId);
  if (await patchTicket(t, { assignedRole: role, assignedTo: toUserId || null, status: STATUS.ANDAMENTO, participants: mergeParticipants(t, [toUserId]) }, `Encaminhado para ${to ? to.name : role} (${role}) por ${currentUser.name}${note ? ` — "${note}"` : ''}`)) {
    toast(`Chamado ${id} encaminhado para ${to ? to.name : role}.`); renderCurrentView();
  }
}
async function toggleWatch(id) {
  const t = findTicket(id); if (!t) return;
  const w = [...(t.watchers || [])];
  const idx = w.indexOf(currentUser.id);
  if (idx === -1) w.push(currentUser.id); else w.splice(idx, 1);
  if (await patchTicket(t, { watchers: w }, null)) { toast(idx === -1 ? 'Você está observando este chamado.' : 'Você deixou de observar este chamado.'); renderCurrentView(); }
}

/* ============================================================
   CRUD do catálogo (admin, escreve direto nas tabelas)
   ============================================================ */
async function saveCategory(label, icon) {
  label = label.trim(); if (!label) { toast('Informe o nome da categoria.', 'error'); return false; }
  if (editingCategoryId) {
    const { error } = await sb.from('categories').update({ label, icon: icon || null }).eq('id', editingCategoryId);
    if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  } else {
    const id = 'cat-' + label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 5);
    const { error } = await sb.from('categories').insert({ id, label, icon: icon || '📁', position: CATEGORIES.length });
    if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  }
  await loadCatalog(); renderSidebar(); renderCatalog(); toast('Categoria salva.'); return true;
}
async function deleteCategory(catId) {
  const c = CATEGORIES.find((x) => x.id === catId); if (!c) return;
  if (!confirm(`Excluir a categoria "${c.label}" e todos os seus serviços?`)) return;
  const { error } = await sb.from('categories').delete().eq('id', catId);
  if (error) { toast('Erro: ' + error.message, 'error'); return; }
  await loadCatalog(); renderSidebar(); renderCatalog(); toast('Categoria excluída.');
}
async function saveService(data) {
  const title = data.title.trim(); if (!title) { toast('Informe o nome do serviço.', 'error'); return false; }
  const patch = { category_id: data.catId, sub: data.group || 'Serviços', title, description: data.desc.trim(), icon: data.icon || '📄', approval: !!data.approval };
  if (editingServiceId) {
    const { error } = await sb.from('services').update(patch).eq('id', editingServiceId);
    if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  } else {
    const { error } = await sb.from('services').insert({ ...patch, position: 999 });
    if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  }
  await loadCatalog(); renderCatalog(); toast('Serviço salvo.'); return true;
}
async function deleteService(id) {
  const found = findServiceById(id); if (!found) return;
  if (!confirm(`Excluir o serviço "${found.item.title}"?`)) return;
  const { error } = await sb.from('services').delete().eq('id', id);
  if (error) { toast('Erro: ' + error.message, 'error'); return; }
  await loadCatalog(); renderCatalog(); toast('Serviço excluído.');
}
async function savePage(data) {
  const title = data.title.trim(); if (!title) { toast('Informe o título da página.', 'error'); return false; }
  const patch = { title, icon: data.icon || '📄', content: data.content, visible: !!data.visible, updated_at: new Date().toISOString() };
  if (editingPageId) {
    const { error } = await sb.from('pages').update(patch).eq('id', editingPageId);
    if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  } else {
    const { error } = await sb.from('pages').insert({ ...patch, position: state.pages.length });
    if (error) { toast('Erro: ' + error.message, 'error'); return false; }
  }
  await loadPages(); renderSidebar();
  if (activeView === 'pages') renderPagesAdmin();
  if (activeView === 'page') renderPage();
  toast('Página salva.'); return true;
}
async function deletePage(id) {
  const p = findPage(id); if (!p) return;
  if (!confirm(`Excluir a página "${p.title}"?`)) return;
  const { error } = await sb.from('pages').delete().eq('id', id);
  if (error) { toast('Erro: ' + error.message, 'error'); return; }
  await loadPages(); renderSidebar();
  if (activeView === 'page' && activePageId === id) switchView('overview');
  else if (activeView === 'pages') renderPagesAdmin();
  toast('Página excluída.');
}

/* ============================================================
   CRUD de usuários (admin, via Edge Function)
   ============================================================ */
async function callAdmin(action, payload) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Sessão expirada.');
  const res = await fetch(`${CFG.SUPABASE_URL}/functions/v1/admin-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: CFG.SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, payload }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'Falha na operação.');
  return j;
}
async function saveUser(data) {
  const name = data.name.trim(), email = data.email.trim().toLowerCase();
  if (!name || !email) { toast('Nome e e-mail são obrigatórios.', 'error'); return false; }
  try {
    if (editingUserId) {
      const payload = { id: editingUserId, name, email, role: data.role, active: data.active };
      if (data.password) payload.password = data.password;
      await callAdmin('update', payload);
    } else {
      if (!data.password) { toast('Defina uma senha.', 'error'); return false; }
      await callAdmin('create', { name, email, password: data.password, role: data.role, active: data.active });
    }
  } catch (e) { toast(e.message, 'error'); return false; }
  await loadUsers();
  if (editingUserId === currentUser.id) { const me = findUser(currentUser.id); if (me) { currentUser = me; refreshUserChrome(); renderSidebar(); } }
  renderUsers(); toast('Usuário salvo.'); return true;
}
async function deleteUser(id) {
  if (id === currentUser.id) { toast('Você não pode excluir a própria conta.', 'error'); return; }
  const u = findUser(id); if (!u) return;
  if (!confirm(`Excluir o usuário "${u.name}"?`)) return;
  try { await callAdmin('delete', { id }); } catch (e) { toast(e.message, 'error'); return; }
  await loadUsers(); renderUsers(); toast('Usuário excluído.');
}

/* ============================================================
   Login / sessão
   ============================================================ */
function showLogin(msg) {
  document.body.classList.add('logged-out');
  const err = document.getElementById('login-error'); if (err) err.textContent = msg || '';
  const email = document.getElementById('login-email'); if (email) { email.value = ''; setTimeout(() => email.focus(), 50); }
  const pass = document.getElementById('login-password'); if (pass) pass.value = '';
}
function refreshUserChrome() {
  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('user-role-display').textContent = currentUser.role;
  document.getElementById('user-avatar-display').textContent = initialsOf(currentUser.name);
}
async function doLogout() { stopPolling(); await sb.auth.signOut(); currentUser = null; showLogin(); toast('Sessão encerrada.'); }

let appBuilt = false;
async function enterApp(profile) {
  currentUser = profile;
  document.body.classList.remove('logged-out');
  try { await loadAll(); } catch (e) { toast('Erro ao carregar dados: ' + e.message, 'error'); }
  if (!appBuilt) {
    document.getElementById('overview-grid').innerHTML = buildOverviewSkeleton();
    wireSearchInput('global-search-input');
    wireSearchInput('hero-search-input');
    document.getElementById('hero-search-btn').addEventListener('click', () => switchView('search', { search: document.getElementById('hero-search-input').value }));
    document.getElementById('catalog-search').addEventListener('input', (e) => { catalogSearchTerm = e.target.value; renderCatalog(); });
    appBuilt = true;
  }
  refreshUserChrome(); renderUserMenu(); renderSidebar(); switchView('overview');
  startPolling();
}
/* Atualização periódica dos chamados, para notificar todos os envolvidos (ex.: encaminhamentos) em tempo quase real. */
let pollTimer = null;
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (!currentUser) return;
    try {
      await loadTickets();
      updateBadges();
      if (document.getElementById('notif-panel')?.classList.contains('open')) renderNotifications();
      if (['overview', 'tickets', 'atendimentos', 'search', 'watching', 'assets', 'approvals'].includes(activeView)) renderCurrentView();
    } catch (e) { /* silencioso */ }
  }, 45000);
}
function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }
async function loadProfileAndEnter(userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) { await sb.auth.signOut(); showLogin('Perfil não encontrado. Contate o administrador.'); return; }
  if (!data.active) { await sb.auth.signOut(); showLogin('Usuário inativo. Contate o administrador.'); return; }
  await enterApp(data);
}
function wireSearchInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') switchView('search', { search: input.value }); });
}

/* ============================================================
   Formulários
   ============================================================ */
function wireForms() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    document.getElementById('login-error').textContent = '';
    btn.disabled = true; btn.textContent = 'Entrando...';
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false; btn.textContent = 'Entrar';
    if (error || !data.user) { document.getElementById('login-error').textContent = 'E-mail ou senha inválidos.'; return; }
    await loadProfileAndEnter(data.user.id);
  });

  document.getElementById('ticket-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('field-category').value;
    const service = document.getElementById('field-service').value.trim();
    const title = document.getElementById('field-title').value.trim();
    const description = document.getElementById('field-description').value.trim();
    const priority = document.getElementById('field-priority').value;
    if (!title || !description) { toast('Preencha título e descrição do chamado.', 'error'); return; }
    const approvalNeeded = document.getElementById('ticket-form').dataset.approval === '1';
    const now = Date.now();
    const history = [{ text: `Chamado criado por ${currentUser.name}`, at: now }];
    if (!approvalNeeded) history.push({ text: 'Encaminhado para triagem (Coordenador)', at: now });
    const row = {
      requester_id: currentUser.id, requester_name: currentUser.name, category, service: service || title, title, description, priority,
      status: approvalNeeded ? STATUS.AGUARDANDO : STATUS.ANALISE, approval_needed: approvalNeeded,
      assigned_role: approvalNeeded ? null : ROLE.COORDENADOR, participants: [currentUser.id], history,
    };
    const { data, error } = await sb.from('tickets').insert(row).select().single();
    if (error) { toast('Erro ao criar chamado: ' + error.message, 'error'); return; }
    state.tickets.unshift(mapTicket(data));
    closeModal('ticket-modal');
    toast(`Chamado ${data.id} criado com sucesso!`);
    switchView('tickets');
  });

  document.getElementById('detail-comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.ticket;
    const input = document.getElementById('detail-comment-input');
    const text = input.value.trim(); if (!text) return;
    const t = findTicket(id);
    if (await patchTicket(t, { participants: mergeParticipants(t) }, `Comentário de ${currentUser.name}: "${text}"`)) { input.value = ''; renderTicketDetail(t); renderCurrentView(); }
  });

  document.getElementById('forward-role').addEventListener('change', (e) => fillForwardPeople(e.target.value));
  document.getElementById('forward-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('forward-role').value;
    const userId = document.getElementById('forward-user').value;
    const note = document.getElementById('forward-note').value.trim();
    if (!userId) { toast('Selecione um responsável.', 'error'); return; }
    await forwardTicket(forwardTicketId, userId, role, note);
    closeModal('forward-modal'); closeModal('detail-modal');
  });

  document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
    const ok = await saveUser({
      name: document.getElementById('u-name').value, email: document.getElementById('u-email').value,
      password: document.getElementById('u-password').value, role: document.getElementById('u-role').value, active: document.getElementById('u-active').checked,
    });
    btn.disabled = false;
    if (ok) closeModal('user-modal');
  });

  document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (await saveCategory(document.getElementById('cat-label').value, document.getElementById('cat-icon').value)) closeModal('category-modal');
  });

  document.getElementById('service-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = await saveService({
      title: document.getElementById('svc-title').value, desc: document.getElementById('svc-desc').value, icon: document.getElementById('svc-icon').value,
      approval: document.getElementById('svc-approval').checked, catId: document.getElementById('svc-category').value, group: document.getElementById('svc-group').value.trim() || 'Serviços',
    });
    if (ok) closeModal('service-modal');
  });

  const heroInput = document.getElementById('hero-img-input');
  if (heroInput) heroInput.addEventListener('change', (e) => { handleHeroImageFile(e.target.files[0]); e.target.value = ''; });

  document.getElementById('page-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = await savePage({
      title: document.getElementById('pg-title').value, icon: document.getElementById('pg-icon').value,
      content: document.getElementById('pg-content').value, visible: document.getElementById('pg-visible').checked,
    });
    if (ok) closeModal('page-modal');
  });
}

/* ============================================================
   Delegação de cliques
   ============================================================ */
document.addEventListener('click', async (e) => {
  const closeBtn = e.target.closest('[data-close-modal]');
  if (closeBtn) { closeModal(closeBtn.getAttribute('data-close-modal') + '-modal'); return; }
  if (e.target.classList && e.target.classList.contains('modal-overlay')) { e.target.classList.remove('open'); return; }

  if (e.target.closest('#btn-user-menu')) { document.getElementById('notif-panel').classList.remove('open'); renderUserMenu(); document.getElementById('user-menu').classList.toggle('open'); return; }
  if (e.target.closest('#um-theme')) { toggleTheme(); return; }
  if (e.target.closest('#um-logout')) { document.getElementById('user-menu').classList.remove('open'); await doLogout(); return; }
  if (e.target.closest('#btn-theme')) { toggleTheme(); return; }

  const bellBtn = e.target.closest('#btn-notifications');
  const notifPanel = document.getElementById('notif-panel');
  if (bellBtn) {
    document.getElementById('user-menu').classList.remove('open');
    const opening = !notifPanel.classList.contains('open');
    renderNotifications(); notifPanel.classList.toggle('open');
    if (opening) setTimeout(markNotificationsSeen, 1200);
    return;
  }
  if (notifPanel && !e.target.closest('#notif-panel')) notifPanel.classList.remove('open');
  const userMenu = document.getElementById('user-menu');
  if (userMenu && !e.target.closest('#user-menu') && !e.target.closest('#btn-user-menu')) userMenu.classList.remove('open');

  const menuItem = e.target.closest('.menu-item');
  if (menuItem && !menuItem.hasAttribute('data-static')) { switchView(menuItem.getAttribute('data-view'), { category: menuItem.getAttribute('data-category') || null, page: menuItem.getAttribute('data-page') || null, search: '' }); return; }

  const atendSeg = e.target.closest('[data-atend-filter]');
  if (atendSeg) { atendFilter = atendSeg.getAttribute('data-atend-filter'); renderAtendimentos(); return; }

  const viewNav = e.target.closest('[data-view-nav]');
  if (viewNav) { document.getElementById('user-menu').classList.remove('open'); switchView(viewNav.getAttribute('data-view-nav')); return; }

  const catTab = e.target.closest('[data-cat-tab]');
  if (catTab) { activeCategory = catTab.getAttribute('data-cat-tab') || null; renderCatalog(); document.querySelectorAll('.menu-item[data-view="catalog"]').forEach((m) => m.classList.toggle('active', m.getAttribute('data-category') === activeCategory)); return; }

  const quickCard = e.target.closest('[data-quick-category]');
  if (quickCard) { switchView('catalog', { category: quickCard.getAttribute('data-quick-category'), search: '' }); return; }
  const statCard = e.target.closest('[data-stat-nav]');
  if (statCard) { switchView(statCard.getAttribute('data-stat-nav')); return; }

  if (e.target.closest('[data-new-category]')) { openCategoryModal(null, e); return; }
  const editCat = e.target.closest('[data-edit-category]');
  if (editCat) { e.stopPropagation(); openCategoryModal(editCat.getAttribute('data-edit-category'), e); return; }
  const delCat = e.target.closest('[data-delete-category]');
  if (delCat) { e.stopPropagation(); await deleteCategory(delCat.getAttribute('data-delete-category')); return; }
  const newSvc = e.target.closest('[data-new-service]');
  if (newSvc) { const [catId, sub] = newSvc.getAttribute('data-new-service').split('::'); openServiceModal({ target: { catId, sub } }, e); return; }
  const editSvc = e.target.closest('[data-edit-service]');
  if (editSvc) { e.stopPropagation(); openServiceModal({ serviceId: editSvc.getAttribute('data-edit-service') }, e); return; }
  const delSvc = e.target.closest('[data-delete-service]');
  if (delSvc) { e.stopPropagation(); await deleteService(delSvc.getAttribute('data-delete-service')); return; }

  if (e.target.closest('#hero-img-import')) { const inp = document.getElementById('hero-img-input'); if (inp) inp.click(); return; }
  if (e.target.closest('#hero-img-reset')) { if (state.settings.hero_image && confirm('Restaurar a ilustração padrão?')) { await deleteSetting('hero_image'); applyHeroImage(); toast('Ilustração padrão restaurada.'); } return; }

  if (e.target.closest('#btn-add-page')) { openPageModal(null, e); return; }
  const editPage = e.target.closest('[data-edit-page]');
  if (editPage) { e.stopPropagation(); openPageModal(editPage.getAttribute('data-edit-page'), e); return; }
  const delPage = e.target.closest('[data-delete-page]');
  if (delPage) { e.stopPropagation(); await deletePage(delPage.getAttribute('data-delete-page')); return; }
  const viewPageNav = e.target.closest('[data-view-page-nav]');
  if (viewPageNav) { switchView('page', { page: viewPageNav.getAttribute('data-view-page-nav') }); return; }

  if (e.target.closest('#btn-add-user')) { openUserModal(null, e); return; }
  const editUser = e.target.closest('[data-edit-user]');
  if (editUser) { openUserModal(editUser.getAttribute('data-edit-user'), e); return; }
  const delUser = e.target.closest('[data-delete-user]');
  if (delUser && !delUser.disabled) { await deleteUser(delUser.getAttribute('data-delete-user')); return; }

  const openService = e.target.closest('[data-open-service]');
  if (openService) { const [cat, title] = openService.getAttribute('data-open-service').split('::'); openNewTicketModal(cat, title, e); return; }
  if (e.target.closest('#btn-new-ticket') || e.target.closest('[data-open-new-ticket]')) { openNewTicketModal(null, '', e); return; }

  const approveBtn = e.target.closest('[data-approve]');
  if (approveBtn) { e.stopPropagation(); await approveTicket(approveBtn.getAttribute('data-approve')); return; }
  const rejectBtn = e.target.closest('[data-reject]');
  if (rejectBtn) { e.stopPropagation(); await rejectTicket(rejectBtn.getAttribute('data-reject')); return; }
  const assumeBtn = e.target.closest('[data-assume]');
  if (assumeBtn) { e.stopPropagation(); await assumeTicket(assumeBtn.getAttribute('data-assume')); return; }
  const forwardBtn = e.target.closest('[data-forward]');
  if (forwardBtn) { e.stopPropagation(); openForwardModal(forwardBtn.getAttribute('data-forward'), e); return; }
  const resolveBtn = e.target.closest('[data-resolve]');
  if (resolveBtn) { e.stopPropagation(); await resolveTicket(resolveBtn.getAttribute('data-resolve')); return; }

  const reportBtn = e.target.closest('[data-report-asset]');
  if (reportBtn) { e.stopPropagation(); const t = findTicket(reportBtn.getAttribute('data-report-asset')); if (t) { openNewTicketModal(t.category, t.service || t.title, e); document.getElementById('field-title').value = `Problema com ${t.service || t.title}`; } return; }

  const ticketRow = e.target.closest('[data-ticket]');
  if (ticketRow && !e.target.closest('[data-approve],[data-reject],[data-assume],[data-forward],[data-resolve]')) { openTicketDetail(ticketRow.getAttribute('data-ticket'), e); return; }

  const dApprove = e.target.closest('[data-detail-approve]');
  if (dApprove) { await approveTicket(dApprove.getAttribute('data-detail-approve')); const t = findTicket(dApprove.getAttribute('data-detail-approve')); if (t) renderTicketDetail(t); return; }
  const dReject = e.target.closest('[data-detail-reject]');
  if (dReject) { await rejectTicket(dReject.getAttribute('data-detail-reject')); const t = findTicket(dReject.getAttribute('data-detail-reject')); if (t) renderTicketDetail(t); return; }
  const dResolve = e.target.closest('[data-detail-resolve]');
  if (dResolve) { await resolveTicket(dResolve.getAttribute('data-detail-resolve')); closeModal('detail-modal'); return; }
  const dCancel = e.target.closest('[data-detail-cancel]');
  if (dCancel) { await cancelTicket(dCancel.getAttribute('data-detail-cancel')); const t = findTicket(dCancel.getAttribute('data-detail-cancel')); if (t) renderTicketDetail(t); return; }
  const dReopen = e.target.closest('[data-detail-reopen]');
  if (dReopen) { await reopenTicket(dReopen.getAttribute('data-detail-reopen')); const t = findTicket(dReopen.getAttribute('data-detail-reopen')); if (t) renderTicketDetail(t); return; }
  const dWatch = e.target.closest('[data-detail-watch]');
  if (dWatch) { await toggleWatch(dWatch.getAttribute('data-detail-watch')); const t = findTicket(dWatch.getAttribute('data-detail-watch')); if (t) renderTicketDetail(t); return; }
  const dAssume = e.target.closest('[data-detail-assume]');
  if (dAssume) { await assumeTicket(dAssume.getAttribute('data-detail-assume')); const t = findTicket(dAssume.getAttribute('data-detail-assume')); if (t) renderTicketDetail(t); return; }
  const dForward = e.target.closest('[data-detail-forward]');
  if (dForward) { openForwardModal(dForward.getAttribute('data-detail-forward'), e); return; }

  const chip = e.target.closest('[data-chip]');
  if (chip) { switchView('catalog', { category: null, search: chip.getAttribute('data-chip') }); return; }

  const staticEl = e.target.closest('[data-static]');
  if (staticEl) { toast('Funcionalidade em desenvolvimento.'); return; }
});

/* ============================================================
   Inicialização
   ============================================================ */
async function init() {
  applyTheme(currentTheme());
  document.getElementById('header').innerHTML = buildHeader();
  wireForms();
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session && session.user) { await loadProfileAndEnter(session.user.id); return; }
  } catch (e) { /* segue para login */ }
  showLogin();
}
document.addEventListener('DOMContentLoaded', init);
