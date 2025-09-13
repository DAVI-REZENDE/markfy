#!/bin/bash

echo "🚀 Configurando o Markfy..."

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não está instalado. Instalando..."
    npm install -g pnpm
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
pnpm db:generate

# Iniciar Docker Compose
echo "🐳 Iniciando Docker Compose..."
docker compose up -d

# Aguardar o banco estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 10

# Executar migrations
echo "🗄️ Executando migrations..."
pnpm db:migrate

# Executar seed
echo "🌱 Populando banco com dados de exemplo..."
pnpm db:seed

echo "✅ Setup concluído!"
echo ""
echo "🎉 O Markfy está pronto para uso!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:4000/graphql"
echo "🗄️ PgAdmin: http://localhost:5050"
echo ""
echo "👤 Usuário demo: admin@markfy.com / 123456"
echo ""
echo "Para parar os serviços: docker-compose down"
echo "Para iniciar em desenvolvimento: pnpm dev"
