import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário de exemplo
  const hashedPassword = await bcrypt.hash('123456', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@markfy.com' },
    update: {},
    create: {
      email: 'admin@markfy.com',
      name: 'Administrador',
      password: hashedPassword,
    },
  })

  console.log('👤 Usuário criado:', user)

  // Criar posts de exemplo
  const post1 = await prisma.post.upsert({
    where: { slug: 'bem-vindo-ao-markfy' },
    update: {},
    create: {
      title: 'Bem-vindo ao Markfy!',
      slug: 'bem-vindo-ao-markfy',
      content: `# Bem-vindo ao Markfy! 🎉

Este é o seu primeiro post no **Markfy**, uma plataforma de blog moderna construída com:

- **Next.js** para o frontend
- **Fastify + GraphQL** para o backend
- **Prisma + PostgreSQL** para o banco de dados
- **Docker** para orquestração

## Recursos Principais

- ✨ Editor rico estilo Notion
- 🔐 Autenticação JWT
- 📝 Sistema de posts e comentários
- 🎨 Interface moderna com Tailwind CSS
- 🚀 Deploy fácil com Vercel + Render

## Próximos Passos

1. Explore o editor de posts
2. Personalize seu perfil
3. Comece a escrever!

---

*Divirta-se criando conteúdo incrível!* 🚀`,
      excerpt: 'Conheça o Markfy, uma plataforma de blog moderna e poderosa para criar e compartilhar conteúdo.',
      published: true,
      publishedAt: new Date(),
      authorId: user.id,
    },
  })

  const post2 = await prisma.post.upsert({
    where: { slug: 'como-usar-o-editor' },
    update: {},
    create: {
      title: 'Como usar o Editor',
      slug: 'como-usar-o-editor',
      content: `# Como usar o Editor do Markfy 📝

O editor do Markfy foi construído com **TipTap** e oferece uma experiência rica e intuitiva para criar conteúdo.

## Funcionalidades do Editor

### Formatação de Texto
- **Negrito** e *itálico*
- ~~Riscado~~ e ==destacado==
- \`Código inline\`

### Estrutura
- Títulos (H1, H2, H3)
- Listas ordenadas e não ordenadas
- Citações
- Linhas horizontais

### Elementos Especiais
- Links
- Imagens
- Blocos de código
- Tabelas

## Dicas de Uso

1. **Use títulos** para estruturar seu conteúdo
2. **Adicione imagens** para tornar os posts mais atrativos
3. **Use listas** para organizar informações
4. **Destaque código** com blocos de código

## Exemplo de Código

\`\`\`javascript
function saudacao(nome) {
  return \`Olá, \${nome}! Bem-vindo ao Markfy!\`;
}

console.log(saudacao('Desenvolvedor'));
\`\`\`

---

*Experimente todas as funcionalidades do editor!* ✨`,
      excerpt: 'Aprenda a usar todas as funcionalidades do editor rico do Markfy para criar conteúdo incrível.',
      published: true,
      publishedAt: new Date(),
      authorId: user.id,
    },
  })

  console.log('📝 Posts criados:', { post1: post1.title, post2: post2.title })

  // Criar comentários de exemplo
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Excelente plataforma! Muito fácil de usar. 👏',
      authorId: user.id,
      postId: post1.id,
    },
  })

  const comment2 = await prisma.comment.create({
    data: {
      content: 'O editor é realmente muito intuitivo. Parabéns pela iniciativa!',
      authorId: user.id,
      postId: post2.id,
    },
  })

  console.log('💬 Comentários criados:', { comment1: comment1.id, comment2: comment2.id })

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
