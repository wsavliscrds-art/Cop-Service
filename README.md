# Cop-Service

Protótipo frontend (HTML/CSS/JS puro) do portal de autoatendimento de TI **COP Serv**.

## Estrutura

- `cop-serv/index.html` — página inicial (Overview): saudação, busca, atividade do usuário, acesso rápido aos serviços, chamados recentes, aprovações pendentes e comunicados.
- `cop-serv/servicos.html` — catálogo de solicitação de serviços (Hardware, Software, etc.), com busca por nome/descrição.
- `cop-serv/style.css` — estilos compartilhados da página inicial.

## Como visualizar

Abra `cop-serv/index.html` diretamente no navegador, ou sirva a pasta com um servidor estático:

```
cd cop-serv && python3 -m http.server 8000
```

e acesse `http://localhost:8000`.

Não há dependências externas de build; os ícones usam emoji nativo para evitar dependência de CDN.