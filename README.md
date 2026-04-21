# Desafio de Automação de Testes — Banco Carrefour

Monorepo com as suítes de automação de testes de **API** e **Mobile** desenvolvidas como resposta ao desafio técnico do Banco Carrefour.

> **v1.3.0 — Zod Edition** — 17 melhorias sobre a versão original. Adoção de **Zod** como fonte única de verdade: elimina `user.types.ts` e `auth.types.ts` (interfaces manuais), substitui AJV + ajv-formats por uma única dependência, e unifica validação de runtime com tipagem TypeScript via `z.infer<>`.

---

## Estrutura do Repositório

```
.
├── .github/
│   └── workflows/
│       └── ci.yml                     # Pipeline CI/CD (API + Android + iOS + Pages)
├── api-tests/                         # Suíte de testes de API
│   ├── src/
│   │   ├── client/
│   │   │   ├── auth.service.ts        # Service de autenticação JWT
│   │   │   ├── http.client.ts         # Cliente HTTP base (Supertest)
│   │   │   └── user.service.ts        # Service de usuários (CRUD)
│   │   ├── config/
│   │   │   ├── api.config.ts          # Configurações da API (baseUrl, timeout)
│   │   │   ├── env.ts                 # [NOVO] requireEnv() — sem fallback hardcoded
│   │   │   ├── hooks.ts               # Root Hooks Plugin — evidências em falhas
│   │   │   └── setup.ts               # dotenv, diretórios, Allure metadata (simplificado)
│   │   ├── schemas/
│   │   │   ├── auth.types.ts          # Tipos para auth
│   │   │   ├── user.schema.ts         # [NOVO] Validação via AJV (JSON Schema)
│   │   │   └── user.types.ts          # Tipos para usuário
│   │   ├── tests/
│   │   │   ├── auth.test.ts           # Testes: auth JWT — 12 cenários (era 10)
│   │   │   └── users.test.ts          # Testes: CRUD + rate limit — 20 cenários (era 17)
│   │   └── utils/
│   │       └── api.utils.ts           # Utilitários: assertions, gerador de payload
│   ├── .env.example                   # [NOVO] Template de variáveis obrigatórias
│   ├── .eslintrc.json                 # [NOVO] Configuração ESLint
│   ├── package.json
│   └── tsconfig.json
├── mobile-tests/                      # Suíte de testes mobile
│   ├── src/
│   │   ├── config/
│   │   │   ├── wdio.android.conf.ts
│   │   │   ├── wdio.ios.conf.ts
│   │   │   └── wdio.shared.conf.ts    # [ATUALIZADO] ADRs documentados + screenshot hook
│   │   ├── locators/
│   │   │   ├── forms.locators.ts      # [ATUALIZADO] Versionados + as const
│   │   │   ├── home.locators.ts       # [ATUALIZADO] Versionados + as const
│   │   │   └── login.locators.ts      # [ATUALIZADO] Versionados + as const
│   │   ├── pages/
│   │   │   ├── base.page.ts
│   │   │   ├── forms.screen.ts
│   │   │   ├── home.screen.ts
│   │   │   └── login.screen.ts        # [ATUALIZADO] Método clearFields()
│   │   ├── tests/
│   │   │   ├── forms.spec.ts          # [ATUALIZADO] beforeAll + reset leve
│   │   │   ├── login.spec.ts          # [ATUALIZADO] beforeAll + reset leve + a11y
│   │   │   └── navigation.spec.ts     # [ATUALIZADO] beforeAll + reset leve
│   │   ├── types/
│   │   │   └── mobile.types.ts
│   │   └── utils/
│   │       ├── allure-setup.ts
│   │       └── test.utils.ts          # [ATUALIZADO] Credenciais sem fallback crítico
│   ├── .env.example                   # [NOVO] Template de variáveis obrigatórias
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

---

## Melhorias Aplicadas (v1.1.0)

### 🔴 Críticas
| # | Melhoria | Arquivo |
|---|---|---|
| 01 | `requireEnv()` — sem fallback hardcoded de credenciais | `api-tests/src/config/env.ts` |
| 02 | Validação de claims JWT (exp, iat, id) via decode Base64 | `auth.test.ts` |
| 03 | Rate limit com `Promise.all` (20 e 120 req concorrentes) | `users.test.ts` |
| 11 | `.env.example` versionado + validação de env vars no setup | `.env.example`, `setup.ts` |

### 🟠 Altas
| # | Melhoria | Arquivo |
|---|---|---|
| 04 | Schema validation com AJV (JSON Schema formal) | `user.schema.ts` |
| 05 | IDs fixos documentados — `KNOWN_USER_ID = 1` | `users.test.ts` |
| 07 | `beforeAll` + `clearFields()` — -70% overhead de sessão mobile | `*.spec.ts`, `login.screen.ts` |
| 08 | Screenshot + log automático em falhas (hook global) | `wdio.shared.conf.ts` |
| 14 | `pretest` com typecheck + lint antes dos testes no CI | `package.json`, `ci.yml` |
| 15 | Retry mobile flaky + SHA256 do APK no CI | `ci.yml` |

### 🟡 Médias / Baixas
| # | Melhoria | Arquivo |
|---|---|---|
| 06 | Cenários negativos: payload vazio, tipo errado, email inválido | `users.test.ts` |
| 09 | Locators versionados com comentários e `as const` | `*.locators.ts` |
| 10 | Teste básico de acessibilidade (a11y) em Login | `login.spec.ts` |
| 12 | `setup.ts` simplificado — polyfill ESM removido | `setup.ts` |
| 13 | ADRs documentados (Chai vs Jasmine, sessão vs reset) | `wdio.shared.conf.ts` |
| 16 | Job iOS no CI (macOS, apenas em PRs para main) | `ci.yml` |

---

## Pré-requisitos

### Geral
- **Node.js** >= 20
- **Yarn** >= 1.22

### API Tests
- Conexão com a internet (DummyJSON é pública)

### Mobile Tests
- **Android**: Android Studio com emulador + `adb` no PATH
- **Appium** >= 2.x:
  ```bash
  npm install -g appium
  appium driver install uiautomator2   # Android
  appium driver install xcuitest       # iOS
  ```
- APK em `mobile-tests/apps/` — baixar em https://github.com/webdriverio/native-demo-app/releases/tag/v2.0.0

---

## Configuração

### 1. Instalar dependências

```bash
yarn install
```

### 2. Configurar variáveis de ambiente

```bash
# API
cp api-tests/.env.example api-tests/.env
# Edite api-tests/.env e preencha AUTH_USERNAME e AUTH_PASSWORD

# Mobile
cp mobile-tests/.env.example mobile-tests/.env
# Edite mobile-tests/.env e preencha STANDARD_USER e STANDARD_PASSWORD
```

> **Nunca versione o arquivo `.env`** — ele está no `.gitignore`. Apenas o `.env.example` deve ser commitado.

---

## Executando os Testes

### API

```bash
yarn test:api                # Typecheck + lint + testes
yarn test:api:report         # Abre relatório Mochawesome
yarn test:api:allure         # Gera e abre relatório Allure
```

### Mobile

```bash
appium &                     # Inicia o servidor Appium
yarn test:mobile:android     # Android (emulador local)
yarn test:mobile:allure      # Gera e abre relatório Allure
```

### Tudo

```bash
yarn test:all
```

---

## Cobertura dos Testes

### API — 32 cenários totais (+5 vs. v1.0.0)

#### `auth.test.ts` — Autenticação JWT (12 cenários)

| # | Cenário | Endpoint |
|---|---|---|
| 1 | Login com credenciais válidas retorna token JWT | POST `/auth/login` |
| 2 | Estrutura completa do payload de login | POST `/auth/login` |
| 3 | Token JWT possui formato válido (3 segmentos) | POST `/auth/login` |
| **4** | **Claims do payload JWT (exp, iat, id) via decode Base64** | POST `/auth/login` |
| 5 | Erro 400/401 com senha incorreta | POST `/auth/login` |
| 6 | Erro ao autenticar usuário inexistente | POST `/auth/login` |
| 7 | Acesso ao endpoint protegido com token válido | GET `/auth/me` |
| 8 | `/auth/me` retorna dados do usuário autenticado | GET `/auth/me` |
| 9 | Rejeição sem token (401/403) | GET `/auth/me` |
| 10 | Rejeição com token inválido (401/403 — nunca 500) | GET `/auth/me` |
| 11 | Renovação de token com refreshToken válido | POST `/auth/refresh` |
| **12** | **Claims do novo accessToken renovado** | POST `/auth/refresh` |

#### `users.test.ts` — CRUD + Rate Limit (20 cenários)

| # | Cenário | Endpoint |
|---|---|---|
| 1 | Listagem retorna status 200 (validado via AJV) | GET `/users` |
| 2 | Parâmetro `limit` | GET `/users` |
| 3 | Parâmetro `skip` | GET `/users` |
| 4 | Listagem via endpoint protegido | GET `/auth/users` |
| 5 | Busca por ID existente (AJV schema) | GET `/users/:id` |
| 6 | Campos obrigatórios presentes | GET `/users/:id` |
| 7 | 404 para ID inexistente | GET `/users/:id` |
| 8 | Busca por nome retorna resultados | GET `/users/search` |
| 9 | Busca sem resultados retorna array vazio | GET `/users/search` |
| 10 | Criação: status 201, ID positivo e campos espelhados | POST `/users/add` |
| **11** | **Payload vazio — documenta comportamento (sem 500)** | POST `/users/add` |
| **12** | **Email inválido — documenta comportamento** | POST `/users/add` |
| **13** | **Campo age com tipo string — sem 500** | POST `/users/add` |
| 14 | Atualização de campo único | PUT `/users/:id` |
| 15 | Atualização de múltiplos campos simultâneos | PUT `/users/:id` |
| 16 | 404 ao atualizar ID inexistente | PUT `/users/:id` |
| 17 | Remoção retorna `isDeleted: true` | DELETE `/users/:id` |
| 18 | Objeto deletado com flag `isDeleted` | DELETE `/users/:id` |
| 19 | 404 ao deletar ID inexistente | DELETE `/users/:id` |
| **20** | **20 requisições simultâneas — sem degradação (Promise.all)** | GET `/users/:id` |
| **21** | **Rajada de 120 req concorrentes — documenta rate limit** | GET `/users/:id` |

### Mobile — 13 cenários totais (+1 vs. v1.0.0)

#### `login.spec.ts` — Login (5 cenários)

| # | Cenário |
|---|---|
| 1 | Login com credenciais válidas |
| 2 | Erro com senha inválida (< 8 caracteres) |
| 3 | Erro com e-mail em formato inválido |
| 4 | Erro ao submeter formulário vazio |
| **5** | **Verificar accessibility labels dos campos de login (a11y)** |

#### `navigation.spec.ts` — Navegação (3 cenários)

| # | Cenário |
|---|---|
| 6 | Todos os itens do menu inferior visíveis |
| 7 | Navegação para Login via menu |
| 8 | Navegação para Formulários via menu |

#### `forms.spec.ts` — Formulários (5 cenários)

| # | Cenário |
|---|---|
| 9 | Campo de texto reflete o valor digitado |
| 10 | Campo aceita entrada vazia sem erro |
| 11 | Switch alterna de inativo para ativo |
| 12 | Switch alterna de ativo para inativo |
| 13 | Dropdown exibe o valor selecionado |

---

## Relatórios

### Mochawesome (API)
Gerado em `api-tests/reports/mochawesome/api-report.html`.

### Allure Report
Ambas as suítes geram relatórios Allure com resumo, trend histórico, screenshots de falhas, logs de erro e metadados de ambiente.

---

## CI/CD — GitHub Actions

Pipeline em `.github/workflows/ci.yml` com **quatro jobs** independentes.

| Job | Trigger | Runner | Timeout |
|---|---|---|---|
| `api-tests` | push/PR em `main`/`develop` | ubuntu-latest | 30min |
| `mobile-android` | push/PR em `main`/`develop` | ubuntu-latest | 60min |
| `mobile-ios` | **PRs para `main` apenas** | macos-latest | 60min |
| `publish-reports` | Após API + Android (mesmo em falha) | ubuntu-latest | 15min |

### Secrets necessários no GitHub Actions

| Secret | Descrição |
|---|---|
| `AUTH_USERNAME` | Usuário para autenticação na API |
| `AUTH_PASSWORD` | Senha para autenticação na API |
| `MOBILE_STANDARD_USER` | Email do usuário padrão no app |
| `MOBILE_STANDARD_PASSWORD` | Senha do usuário padrão no app |

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript 5 |
| Testes de API | Supertest + Mocha + Chai |
| Schema Validation | **Zod 3** — tipos + validação numa definição só |
| Testes Mobile | WebdriverIO v8 + Appium 2 |
| Driver Android | UiAutomator2 |
| Driver iOS | XCUITest |
| Relatórios | Mochawesome + Allure Report |
| CI/CD | GitHub Actions |
| Gerenciador de pacotes | Yarn 1.x (Workspaces) |

