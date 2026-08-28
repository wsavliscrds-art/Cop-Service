# Cop-Service

Portal interno de TI (**COP Serv**) para abertura, acompanhamento e aprovação de chamados de serviço.

## Como rodar

É um site estático (HTML/CSS/JS puro, sem build). Basta servir a pasta com qualquer servidor HTTP, por exemplo:

```bash
python3 -m http.server 8000
```

E acessar `http://localhost:8000`.

## Funcionalidades

- **Overview**: saudação, indicadores de chamados (abertos, em análise, resolvidos, aguardando aprovação), acesso rápido por categoria, serviços recomendados, chamados recentes e aprovações pendentes.
- **Catálogo de serviços** (aba "Serviços" na barra lateral): Hardware, Software, Acessos e Sistemas, Rede e Conectividade, Google Workspace, Hosting e Servidores, Serviços de RH, Outros Serviços e Segurança da Informação. Cada cartão abre um formulário de solicitação real.
- **Meus Chamados / Chamados Abertos**: listagem e acompanhamento de status.
- **Minhas Aprovações**: aprovar ou rejeitar chamados que exigem aprovação.
- **Observando**: marcar/desmarcar chamados para acompanhamento.
- **Meus Ativos**: equipamentos/licenças atribuídos, com opção de reportar problema (abre novo chamado vinculado).
- Busca global (cabeçalho) e busca dentro do catálogo, com filtro por categoria.
- Todo chamado tem histórico (linha do tempo) e permite comentários, cancelamento, reabertura e conclusão.

Os dados são mantidos no `localStorage` do navegador (não há backend). Isso torna todas as abas e ações totalmente funcionais para uso e demonstração; para produção, `app.js` está estruturado para trocar `loadState`/`saveState` por chamadas a uma API real.
