# Cop-Service

Portal interno de TI (**COP Serv**) para abertura, acompanhamento e aprovação de chamados de serviço.

## Como rodar

É um site estático (HTML/CSS/JS puro, sem build). Basta servir a pasta com qualquer servidor HTTP, por exemplo:

```bash
python3 -m http.server 8000
```

E acessar `http://localhost:8000`.

## Acesso / Login

O portal tem uma tela de login. Contas de demonstração já vêm cadastradas (visíveis em "Contas de demonstração" na própria tela de login):

| Papel | E-mail | Senha |
| --- | --- | --- |
| Administrador | wsavliscrds@gmail.com | `admin123` |
| Coordenador | coordenador@sea.com | `senha123` |
| Supervisor | supervisor@sea.com | `senha123` |
| Analista | analista@sea.com | `senha123` |
| Associado | associado@sea.com | `senha123` |
| Assistente | assistente@sea.com | `senha123` |
| Jovem Aprendiz | aprendiz@sea.com | `senha123` |
| Colaborador | colaborador@sea.com | `senha123` |

O login é **real** (autenticação Supabase). Os dados — usuários, chamados e catálogo — ficam em um **banco de dados na nuvem (Supabase)**, compartilhados entre todos os usuários e dispositivos: o que a Ana cadastra/vê é o mesmo que você vê. As senhas são armazenadas com hash pelo Supabase Auth (não em texto puro).

## Backend (Supabase)

- **Frontend**: site estático (HTML/CSS/JS) hospedado no GitHub Pages.
- **Backend**: projeto Supabase `cop-service` — Auth (login por e-mail/senha), Postgres com RLS (tabelas `profiles`, `categories`, `services`, `tickets`) e uma Edge Function `admin-users` que permite ao administrador criar/editar/excluir contas com senha (usa a chave de serviço, que fica só no servidor).
- A conexão fica em `config.js` (URL do projeto + chave *publishable*, que é feita para ficar no cliente — o acesso real é controlado pelas políticas RLS do banco). A biblioteca do Supabase é servida localmente em `vendor/supabase.min.js`.

## Papéis e hierarquia de atendimento

Ao ser aberto, todo chamado "cai" na fila do topo da hierarquia e desce nível a nível, cada responsável encaminhando ao próximo:

**Coordenador → Supervisor → Analista / Associado → Assistente → Jovem Aprendiz**

- Cada atendente vê os chamados sob sua responsabilidade em **Fila de Atendimento** e pode **Assumir**, **Encaminhar** (escolhendo a pessoa do próximo nível) ou **Resolver**.
- Todo encaminhamento fica registrado no histórico do chamado.
- O **Administrador** enxerga todas as filas.

## Administração (perfil Admin)

- **Usuários**: cadastrar, editar, ativar/inativar e excluir contas, definindo o papel de cada uma (o admin define a senha no cadastro).
- **Editar catálogo**: incluir, editar e excluir serviços; renomear/editar/excluir as abas (categorias); criar novas categorias. Tudo persistido no banco e visível para todos.

## Modo escuro

Alternância de tema (claro/escuro) pelo ícone no cabeçalho ou pelo menu do usuário. Respeita a preferência do sistema (`prefers-color-scheme`) na primeira visita e memoriza a escolha.

## Funcionalidades

- **Overview**: saudação, indicadores de chamados (abertos, em análise, resolvidos, aguardando aprovação), acesso rápido por categoria, serviços recomendados, chamados recentes e aprovações pendentes.
- **Catálogo de serviços** (aba "Serviços" na barra lateral): Hardware, Software, Acessos e Sistemas, Rede e Conectividade, Google Workspace, Hosting e Servidores, Serviços de RH, Outros Serviços e Segurança da Informação. Cada cartão abre um formulário de solicitação real.
- **Meus Chamados**: listagem e acompanhamento de status de tudo que o usuário solicitou.
- **Minhas Aprovações**: aprovar ou rejeitar chamados de terceiros que exigem aprovação (não é possível autoaprovar o próprio chamado).
- **Observando**: marcar/desmarcar chamados para acompanhamento.
- **Meus Ativos**: equipamentos/licenças atribuídos, com opção de reportar problema (abre novo chamado vinculado).
- Busca global (cabeçalho) e busca dentro do catálogo, com filtro por categoria.
- Todo chamado tem histórico (linha do tempo) e permite comentários, cancelamento, reabertura e conclusão.

Os dados ficam no banco Supabase e são compartilhados entre todos os usuários. Apenas a preferência de tema (claro/escuro) é guardada localmente no navegador.

## Deploy (GitHub Pages)

O repositório já inclui `.github/workflows/deploy-pages.yml`, que publica o site automaticamente a cada push na branch `main`. Como o site é 100% estático, não há passo de build.

Para ativar (uma única vez, feito manualmente nas configurações do repositório — não é possível automatizar isso por aqui):

1. O repositório precisa estar **público** (no plano GitHub Free, Pages só publica repositórios públicos) ou a conta precisa ter GitHub Pro/Team/Enterprise.
2. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
3. Faça um push (ou rode o workflow manualmente em Actions → "Deploy to GitHub Pages" → Run workflow). O site fica disponível em `https://<usuário>.github.io/Cop-Service/`.
