# Realmate Challenge - Implementação

## 📋 Sobre o Projeto

Esta é uma implementação completa do desafio Realmate, consistindo em uma API que processa webhooks de um sistema de atendimento do WhatsApp. O sistema recebe eventos relacionados a conversas e mensagens, registrando-os no banco de dados e fornecendo endpoints para consulta.

## 🛠️ Tecnologias Utilizadas

- **Backend**: Django 4.x, Django Rest Framework
- **Banco de Dados**: SQLite
- **Gerenciador de Dependências**: Poetry
- **Frontend**: Next.js, React, Bootstrap
- **Ferramentas Auxiliares**: UUID para identificadores únicos

## 🏗️ Arquitetura do Sistema

### Modelos de Dados
- **Conversation**: Armazena informações das conversas com estados OPEN/CLOSED
- **Message**: Armazena mensagens relacionadas às conversas, com direção SENT/RECEIVED

### API Endpoints
- **POST `/webhook/`**: Processa os eventos de webhook (nova conversa, novas mensagens, fechamento de conversa)
- **GET `/conversations/{id}/`**: Retorna detalhes de uma conversa específica
- **GET `/conversations/`**: Lista todas as conversas disponíveis
- **GET `/stats/`**: Retorna estatísticas do sistema
- **GET `/analytics/`**: Fornece dados analíticos para diferentes períodos

## ⚙️ Como Executar o Projeto

### 1. Configuração do Backend

```bash
# Instalar o Poetry (caso não tenha)
pip install poetry

# Instalar dependências do projeto
cd realmate-challenge
poetry install

# Aplicar migrações
poetry run python manage.py migrate

# Iniciar o servidor de desenvolvimento Django
poetry run python manage.py runserver

O backend estará disponível em: http://localhost:8000/

2. Configuração do Frontend

# Navegar até a pasta do frontend
cd frontend

# Instalar dependências do Next.js
npm install
# ou
yarn install

# Caso haja problemas de cache, limpar o cache do Next.js
rm -rf .next
# ou no Windows:
rmdir /s /q .next

# Iniciar o servidor de desenvolvimento do frontend
npm run dev
# ou
yarn dev

O frontend estará disponível em: http://localhost:3000/

🧪 Como Testar
Usando o Frontend
Acesse http://localhost:3000/
Use a interface para:
Criar novas conversas usando o botão "Nova Conversa"
Visualizar conversas existentes na lista principal
Clicar em uma conversa para ver seus detalhes
Enviar mensagens no campo de texto na parte inferior
Fechar conversas usando o botão "Fechar Conversa"

