# Desafio de Automação de Testes — Banco Carrefour

Monorepo com as suítes de automação de testes de **API** e **Mobile** desenvolvidas como resposta ao desafio técnico do Banco Carrefour.

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
│   │   │   ├── env.ts                 # requireEnv() — sem fallback hardcoded
│   │   │   ├── hooks.ts               # Root Hooks Plugin — evidências em falhas
│   │   │   └── setup.ts               # dotenv, diretórios, Allure metadata
│   │   ├── schemas/
│   │   │   ├── auth.types.ts          # Tipos para auth
│   │   │   ├── user.schema.ts         # Validação via AJV (JSON Schema)
│   │   │   └── user.types.ts          # Tipos para usuário
│   │   ├── tests/
│   │   │   ├── auth.test.ts           # Testes: auth JWT — 12 cenários (era 10)
│   │   │   └── users.test.ts          # Testes: CRUD + rate limit — 20 cenários (era 17)
│   │   └── utils/
│   │       └── api.utils.ts           # Utilitários: assertions, gerador de payload
│   ├── .eslintrc.json                 # Configuração ESLint
│   ├── package.json
│   └── tsconfig.json
├── mobile-tests/                      # Suíte de testes mobile
│   ├── src/
│   │   ├── config/
│   │   │   ├── wdio.android.conf.ts
│   │   │   ├── wdio.ios.conf.ts
│   │   │   └── wdio.shared.conf.ts    # Configuração compartilhada (imports de topo)
│   │   ├── locators/
│   │   │   ├── forms.locators.ts      # Locators dos campos da tela de forms
│   │   │   ├── home.locators.ts       # Locators dos campos da tela home
│   │   │   └── login.locators.ts      # Locators dos campos da tela de login
│   │   ├── pages/
│   │   │   ├── base.page.ts
│   │   │   ├── forms.screen.ts
│   │   │   ├── home.screen.ts
│   │   │   └── login.screen.ts        
│   │   ├── tests/
│   │   │   ├── forms.spec.ts          # Testes: formulários (5 cenários)
│   │   │   ├── login.spec.ts          # Testes: login (4 cenários)
│   │   │   └── navigation.spec.ts     # Testes: navegação (3 cenários)
│   │   ├── types/
│   │   │   └── mobile.types.ts        # Tipos compartilhados (UserCredentials)
│   │   └── utils/
│   │       ├── allure-setup.ts
│   │       └── test.utils.ts          
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

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

---

## Executando os Testes

### API

```bash
yarn test:api                # Executa os testes
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
| 4 | Claims do payload JWT (exp, iat, id) via decode Base64 | POST `/auth/login` |
| 5 | Erro 400/401 com senha incorreta | POST `/auth/login` |
| 6 | Erro ao autenticar usuário inexistente | POST `/auth/login` |
| 7 | Acesso ao endpoint protegido com token válido | GET `/auth/me` |
| 8 | `/auth/me` retorna dados do usuário autenticado | GET `/auth/me` |
| 9 | Rejeição sem token (401/403) | GET `/auth/me` |
| 10 | Rejeição com token inválido (401/403 — nunca 500) | GET `/auth/me` |
| 11 | Renovação de token com refreshToken válido | POST `/auth/refresh` |
| 12 | Claims do novo accessToken renovado | POST `/auth/refresh` |

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
| 11 | Payload vazio — documenta comportamento (sem 500) | POST `/users/add` |
| 12 | Email inválido — documenta comportamento | POST `/users/add` |
| 13 | Campo age com tipo string — sem 500 | POST `/users/add` |
| 14 | Atualização de campo único | PUT `/users/:id` |
| 15 | Atualização de múltiplos campos simultâneos | PUT `/users/:id` |
| 16 | 404 ao atualizar ID inexistente | PUT `/users/:id` |
| 17 | Remoção retorna `isDeleted: true` | DELETE `/users/:id` |
| 18 | Objeto deletado com flag `isDeleted` | DELETE `/users/:id` |
| 19 | 404 ao deletar ID inexistente | DELETE `/users/:id` |
| 20 | 20 requisições simultâneas — sem degradação (Promise.all) | GET `/users/:id` |
| 21 | Rajada de 120 req concorrentes — documenta rate limit | GET `/users/:id` |

### Mobile — 13 cenários totais (+1 vs. v1.0.0)

#### `login.spec.ts` — Login (5 cenários)

| # | Cenário |
|---|---|
| 1 | Login com credenciais válidas |
| 2 | Erro com senha inválida (< 8 caracteres) |
| 3 | Erro com e-mail em formato inválido |
| 4 | Erro ao submeter formulário vazio |
| 5 | Verificar accessibility labels dos campos de login (a11y) |

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

Ambas as suítes geram relatórios Allure com:

- **Resumo** — total de testes, taxa de sucesso, duração
- **Trend** — histórico de execuções (persistido via GitHub Actions artifacts)
- **Suítes** — agrupamento por describe/it
- **Screenshots de falhas** — capturadas automaticamente no `afterTest`
- **Logs de erro** — stack trace anexado como attachment
- **Ambiente** — plataforma, versão Node, tipo de execução (CI/Local)
- **Executor** — link para a run do GitHub Actions
---

## CI/CD — GitHub Actions

O pipeline está consolidado em um único arquivo `.github/workflows/ci.yml` com três jobs independentes.

### Jobs

**`api-tests`** — Trigger: push/PR em `main` ou `develop`
1. Instalar dependências (cache por `yarn.lock`)
2. Executar todos os testes de API
3. Publicar resultados Allure como artifact (retidos 7 dias)

**`mobile-android`** — Trigger: push/PR em `main` ou `develop`
1. Instalar dependências (cache por `yarn.lock`)
2. Baixar APK (cache por versão)
3. Habilitar KVM + instalar `adb`
4. Subir `docker-compose` com emulador Android
5. Aguardar boot do emulador e disponibilidade do Appium
6. Executar testes Android
7. Publicar resultados Allure como artifact (retidos 7 dias)

**`publish-reports`** — Executa após ambos os jobs (mesmo em falha)
1. Restaurar histórico Allure de execuções anteriores (branch `gh-pages`)
2. Gerar relatórios Allure para API e Android
3. Gerar página index com status de cada suite e links para os reports
4. Deploy no GitHub Pages

### Relatórios no GitHub Pages

```
https://<usuario>.github.io/<repositorio>/api/report/
https://<usuario>.github.io/<repositorio>/android/report/
```

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript 5 |
| Testes de API | Supertest + Mocha + Chai |
| Schema Validation | Zod 3 — tipos + validação numa definição só |
| Testes Mobile | WebdriverIO v8 + Appium 2 |
| Driver Android | UiAutomator2 |
| Driver iOS | XCUITest |
| Relatórios | Mochawesome + Allure Report |
| CI/CD | GitHub Actions |
| Gerenciador de pacotes | Yarn 1.x (Workspaces) |

