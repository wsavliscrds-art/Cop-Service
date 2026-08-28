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
- **Meus Chamados**: listagem e acompanhamento de status de tudo que o usuário solicitou.
- **Minhas Aprovações**: aprovar ou rejeitar chamados de terceiros que exigem aprovação (não é possível autoaprovar o próprio chamado).
- **Observando**: marcar/desmarcar chamados para acompanhamento.
- **Meus Ativos**: equipamentos/licenças atribuídos, com opção de reportar problema (abre novo chamado vinculado).
- Busca global (cabeçalho) e busca dentro do catálogo, com filtro por categoria.
- Todo chamado tem histórico (linha do tempo) e permite comentários, cancelamento, reabertura e conclusão.

Os dados são mantidos no `localStorage` do navegador (não há backend). Isso torna todas as abas e ações totalmente funcionais para uso e demonstração; para produção, `app.js` está estruturado para trocar `loadState`/`saveState` por chamadas a uma API real.

## Deploy (GitHub Pages)

O repositório já inclui `.github/workflows/deploy-pages.yml`, que publica o site automaticamente a cada push na branch `main`. Como o site é 100% estático, não há passo de build.

Para ativar (uma única vez, feito manualmente nas configurações do repositório — não é possível automatizar isso por aqui):

1. O repositório precisa estar **público** (no plano GitHub Free, Pages só publica repositórios públicos) ou a conta precisa ter GitHub Pro/Team/Enterprise.
2. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
3. Faça um push (ou rode o workflow manualmente em Actions → "Deploy to GitHub Pages" → Run workflow). O site fica disponível em `https://<usuário>.github.io/Cop-Service/`.
