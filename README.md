# Markfy 📝

Uma plataforma moderna de blog/documentação com editor rico estilo Notion/Hashnode. Construída com Next.js, Fastify, GraphQL, Prisma e PostgreSQL.

![Markfy](https://img.shields.io/badge/Markfy-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)
![Fastify](https://img.shields.io/badge/Fastify-5.6.0-green)
![GraphQL](https://img.shields.io/badge/GraphQL-16.11.0-pink)
![Prisma](https://img.shields.io/badge/Prisma-6.16.1-purple)

## ✨ Recursos

- 🎨 **Editor Rico**: Interface estilo Notion com TipTap
- 🔐 **Autenticação JWT**: Sistema seguro com cookies HttpOnly
- 📝 **Sistema de Posts**: Criação, edição e publicação de conteúdo
- 💬 **Comentários**: Sistema interativo de comentários
- 🎯 **GraphQL API**: API moderna e eficiente
- 🐳 **Docker**: Orquestração completa com Docker Compose
- 🎨 **UI Moderna**: Interface responsiva com Tailwind CSS + shadcn/ui
- 📱 **Responsivo**: Funciona perfeitamente em todos os dispositivos

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **TipTap** - Editor rico
- **Apollo Client** - Cliente GraphQL

### Backend
- **Fastify** - Servidor web rápido
- **GraphQL** - API moderna
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **pnpm** - Gerenciador de pacotes

## 📁 Estrutura do Projeto

```
markfy/
├── frontend/                 # Aplicação Next.js
│   ├── src/
│   │   ├── app/             # App Router do Next.js
│   │   ├── components/      # Componentes React
│   │   ├── lib/            # Utilitários e editor
│   │   └── config/         # Configurações Apollo
│   └── package.json
├── backend/                 # API Fastify + GraphQL
│   ├── src/                # Código fonte
│   ├── modules/            # Módulos (user, post, comment)
│   ├── core/               # Configurações do banco
│   ├── prisma/             # Schema e migrations
│   └── package.json
├── docker-compose.yml       # Orquestração Docker
└── README.md
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js 20+
- pnpm
- Docker e Docker Compose

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd markfy
```

### 2. Configure as variáveis de ambiente

```bash
# Backend
cp backend/env.example backend/.env
# Edite o arquivo .env com suas configurações
```

### 3. Execute com Docker Compose

```bash
# Iniciar todos os serviços
docker compose up -d

# Ver logs
docker compose logs -f

# Parar serviços
docker compose down
```

### 4. Configure o banco de dados

```bash
# Executar migrations
docker compose exec backend pnpm db:migrate

# Popular com dados de exemplo
docker compose exec backend pnpm db:seed
```

### 5. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:4000/graphql
- **PgAdmin**: http://localhost:5050 (admin@markfy.com / admin123)

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Registro de usuários
- [x] Login com JWT
- [x] Middleware de autenticação
- [x] Cookies HttpOnly seguros

### ✅ Sistema de Posts
- [x] Criação de posts
- [x] Edição de posts
- [x] Exclusão de posts
- [x] Listagem de posts
- [x] Visualização por slug
- [x] Status de publicação

### ✅ Editor Rico
- [x] Formatação de texto (negrito, itálico)
- [x] Títulos (H1, H2, H3)
- [x] Listas ordenadas e não ordenadas
- [x] Citações
- [x] Código inline e blocos
- [x] Links
- [x] Imagens
- [x] Tabelas

### ✅ Sistema de Comentários
- [x] Criação de comentários
- [x] Listagem de comentários
- [x] Associação com posts

### ✅ Interface
- [x] Página inicial atrativa
- [x] Páginas de login/registro
- [x] Dashboard de posts
- [x] Editor de posts
- [x] Design responsivo

## 🔧 Scripts Disponíveis

### Backend
```bash
pnpm dev          # Executar em modo desenvolvimento
pnpm build        # Build para produção
pnpm start        # Executar build de produção
pnpm db:migrate   # Executar migrations
pnpm db:seed      # Popular banco com dados de exemplo
pnpm db:generate  # Gerar cliente Prisma
pnpm db:studio    # Abrir Prisma Studio
```

### Frontend
```bash
pnpm dev          # Executar em modo desenvolvimento
pnpm build        # Build para produção
pnpm start        # Executar build de produção
pnpm lint         # Executar ESLint
```

## 📊 API GraphQL

### Queries
```graphql
# Buscar posts públicos
query GetPosts {
  posts {
    id
    title
    slug
    excerpt
    publishedAt
    author {
      name
    }
  }
}

# Buscar post por slug
query GetPost($slug: String!) {
  post(slug: $slug) {
    id
    title
    content
    author {
      name
    }
    comments {
      content
      author {
        name
      }
    }
  }
}

# Buscar usuário logado
query Me {
  me {
    id
    name
    email
  }
}
```

### Mutations
```graphql
# Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    user {
      id
      name
      email
    }
    token
  }
}

# Criar post
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    slug
  }
}

# Criar comentário
mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    id
    content
  }
}
```

## 🚀 Deploy

### Frontend (Vercel)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Backend (Render/Railway)
1. Conecte o repositório
2. Configure as variáveis de ambiente
3. Configure o banco PostgreSQL
4. Deploy automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para a comunidade de desenvolvedores.

---

**Markfy** - Crie e compartilhe conteúdo incrível! 🚀
