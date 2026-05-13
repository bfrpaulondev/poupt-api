# PoupPT API

Backend REST API para a aplicacao PoupPT de gestao financeira inteligente.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- OpenAI GPT-4o-mini (AI Coach)

## Setup

```bash
npm install
cp .env.example .env
# Editar .env com as tuas variaveis
npm run dev
```

## Scripts

- `npm start` - Iniciar producao
- `npm run dev` - Iniciar com nodemon
- `npm run seed` - Popular base de dados com dados de teste

## API Endpoints

| Recurso | Endpoint | Auth |
|---------|----------|------|
| Auth | `/api/auth/*` | Public |
| Users | `/api/auth/me` | JWT |
| Transactions | `/api/transactions/*` | JWT |
| Debts | `/api/debts/*` | JWT |
| Goals | `/api/goals/*` | JWT |
| Coach | `/api/coach/*` | JWT |
| Investments | `/api/investments/*` | JWT |
| PoupMoedas | `/api/moedas/*` | JWT |
| Notifications | `/api/notifications/*` | JWT |
| Reports | `/api/reports/*` | JWT |
