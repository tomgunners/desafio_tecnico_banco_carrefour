# Desafio de Automação de Testes — Banco Carrefour

Monorepo com as suítes de automação de testes de **API** e **Mobile** desenvolvidas como resposta ao desafio técnico do Banco Carrefour.

---

## Estrutura do Repositório

```
.
├── .github/
│   └── workflows/
│       ├── api-tests.yml        # Pipeline CI/CD — testes de API
│       └── mobile-tests.yml     # Pipeline CI/CD — testes mobile (Android)
├── api-tests/                   # Suíte de testes de API
│   ├── src/
│   │   ├── client/
│   │   │   ├── auth.service.ts  # Service de autenticação JWT
│   │   │   ├── http.client.ts   # Cliente HTTP base (Supertest)
│   │   │   └── user.service.ts  # Service de usuários (CRUD)
│   │   ├── config/
│   │   │   ├── api.config.ts    # Configurações da API (baseUrl, timeout)
│   │   │   └── setup.ts         # Bootstrap: dotenv, diretórios, Allure metadata
│   │   ├── schemas/
│   │   │   ├── auth.types.ts    # Tipos TypeScript para auth
│   │   │   ├── user.schema.ts   # Validações de schema de usuário
│   │   │   └── user.types.ts    # Tipos TypeScript para usuário
│   │   ├── tests/
│   │   │   ├── auth.test.ts     # Testes: autenticação JWT (10 cenários)
│   │   │   └── users.test.ts    # Testes: CRUD + rate limit (19 cenários)
│   │   └── utils/
│   │       └── api.utils.ts     # Utilitários: assertions, gerador de payload
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── mobile-tests/                # Suíte de testes mobile
│   ├── apps/                    # APK / .app (não versionado)
│   ├── src/
│   │   ├── config/
│   │   │   ├── wdio.android.conf.ts
│   │   │   ├── wdio.ios.conf.ts
│   │   │   └── wdio.shared.conf.ts
│   │   ├── locators/
│   │   │   ├── forms.locators.ts
│   │   │   ├── home.locators.ts
│   │   │   └── login.locators.ts
│   │   ├── pages/
│   │   │   ├── base.page.ts
│   │   │   ├── forms.screen.ts
│   │   │   ├── home.screen.ts
│   │   │   └── login.screen.ts
│   │   ├── tests/
│   │   │   ├── forms.spec.ts        # Testes: formulários (5 cenários)
│   │   │   ├── login.spec.ts        # Testes: login (4 cenários)
│   │   │   └── navigation.spec.ts   # Testes: navegação (3 cenários)
│   │   ├── types/
│   │   │   └── mobile.types.ts
│   │   └── utils/
│   │       ├── allure-setup.ts
│   │       └── test.utils.ts
│   ├── .env
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
- **iOS**: Xcode com simuladores iOS *(macOS apenas)*
- **Appium** >= 2.x:
  ```bash
  npm install -g appium
  appium driver install uiautomator2   # Android
  appium driver install xcuitest       # iOS (macOS)
  ```
- APK em `mobile-tests/apps/` — baixar em https://github.com/webdriverio/native-demo-app/releases

---

## Configuração

### 1. Instalar dependências

```bash
yarn install
```

### 2. Variáveis de ambiente

#### API Tests (`api-tests/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `API_BASE_URL` | `https://dummyjson.com` | URL base da API |
| `REQUEST_TIMEOUT` | `10000` | Timeout (ms) |
| `AUTH_USERNAME` | `emilys` | Usuário JWT |
| `AUTH_PASSWORD` | `emilyspass` | Senha JWT |

#### Mobile Tests (`mobile-tests/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `ANDROID_PLATFORM_VERSION` | `15` | Versão Android |
| `ANDROID_DEVICE_NAME` | `emulator-5554` | Serial do emulador |
| `IOS_PLATFORM_VERSION` | `17.0` | Versão iOS |
| `IOS_DEVICE_NAME` | `iPhone 15` | Nome do simulador |
| `STANDARD_USER` | `bob@example.com` | Credencial válida |
| `STANDARD_PASSWORD` | `10203040` | Senha válida |

---

## Executando os Testes

### API

```bash
yarn test:api                # Executa + relatório Mochawesome
yarn test:api:report         # Abre relatório Mochawesome
yarn test:api:allure         # Gera e abre relatório Allure
```

### Mobile

```bash
appium &                     # Inicia o servidor Appium
yarn test:mobile:android     # Android
yarn test:mobile:ios         # iOS (macOS)
yarn test:mobile:allure      # Gera e abre relatório Allure
```

### Tudo

```bash
yarn test:all
```

---

## Cobertura dos Testes

### API — 29 cenários totais

#### `auth.test.ts` — Autenticação JWT (10 cenários)

| # | Cenário | Endpoint |
|---|---|---|
| 1 | Login com credenciais válidas retorna token JWT | POST `/auth/login` |
| 2 | Estrutura completa do payload de login | POST `/auth/login` |
| 3 | Token JWT possui formato válido (3 segmentos) | POST `/auth/login` |
| 4 | Erro 400/401 com senha incorreta | POST `/auth/login` |
| 5 | Erro ao autenticar usuário inexistente | POST `/auth/login` |
| 6 | Acesso ao endpoint protegido com token válido | GET `/auth/me` |
| 7 | `/auth/me` retorna dados do usuário autenticado | GET `/auth/me` |
| 8 | Rejeição sem token (401/403) | GET `/auth/me` |
| 9 | Rejeição com token inválido (401/403) | GET `/auth/me` |
| 10 | Renovação de token com refreshToken válido | POST `/auth/refresh` |

#### `users.test.ts` — CRUD + Rate Limit (19 cenários)

| # | Cenário | Endpoint |
|---|---|---|
| 1 | Listagem retorna status 200 | GET `/users` |
| 2 | Parâmetro `limit` | GET `/users` |
| 3 | Parâmetro `skip` | GET `/users` |
| 4 | Listagem via endpoint protegido | GET `/auth/users` |
| 5 | Busca por ID existente | GET `/users/:id` |
| 6 | Campos obrigatórios presentes | GET `/users/:id` |
| 7 | 404 para ID inexistente | GET `/users/:id` |
| 8 | Busca por nome retorna resultados | GET `/users/search` |
| 9 | Busca sem resultados retorna array vazio | GET `/users/search` |
| 10 | Criação com payload válido retorna 201 | POST `/users/add` |
| 11 | Criação gera ID positivo | POST `/users/add` |
| 12 | Campos do payload espelhados na resposta | POST `/users/add` |
| 13 | Atualização de campo único | PUT `/users/:id` |
| 14 | Atualização de múltiplos campos | PUT `/users/:id` |
| 15 | 404 ao atualizar ID inexistente | PUT `/users/:id` |
| 16 | Remoção retorna `isDeleted: true` | DELETE `/users/:id` |
| 17 | Objeto deletado com flag `isDeleted` | DELETE `/users/:id` |
| 18 | 404 ao deletar ID inexistente | DELETE `/users/:id` |
| 19 | 10 req sequenciais sem retornar 429 (rate limit) | GET `/users/:id` |

### Mobile — 12 cenários totais

#### `login.spec.ts` — Login (4 cenários)

| # | Cenário |
|---|---|
| 1 | Login com credenciais válidas |
| 2 | Erro com senha inválida (< 8 caracteres) |
| 3 | Erro com e-mail em formato inválido |
| 4 | Erro ao submeter formulário vazio |

#### `navigation.spec.ts` — Navegação (3 cenários)

| # | Cenário |
|---|---|
| 5 | Todos os itens do menu inferior visíveis |
| 6 | Navegação para Login via menu |
| 7 | Navegação para Formulários via menu |

#### `forms.spec.ts` — Formulários (5 cenários)

| # | Cenário |
|---|---|
| 8 | Campo de texto reflete o valor digitado |
| 9 | Campo aceita entrada vazia sem erro |
| 10 | Switch alterna de inativo para ativo |
| 11 | Switch alterna de ativo para inativo |
| 12 | Dropdown exibe o valor selecionado |

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

### Secrets necessários

| Secret | Descrição |
|---|---|
| `AUTH_USERNAME` | Usuário da API |
| `AUTH_PASSWORD` | Senha da API |
| `MOBILE_STANDARD_USER` | Credencial do app mobile |
| `MOBILE_STANDARD_PASSWORD` | Senha do app mobile |

### Pipelines

**`api-tests.yml`** — Trigger: push/PR com mudanças em `api-tests/`
1. Typecheck TypeScript
2. Executar todos os testes de API
3. Publicar relatório Mochawesome como artifact
4. Gerar e publicar relatório Allure como artifact
5. Deploy no GitHub Pages (`/api`)

**`mobile-tests.yml`** — Trigger: push/PR com mudanças em `mobile-tests/`
1. Setup Android SDK + criar emulador
2. Instalar Appium + driver UiAutomator2
3. Download do APK de demonstração
4. Executar testes mobile no emulador
5. Publicar screenshots, logs do Appium e relatório Allure
6. Deploy no GitHub Pages (`/mobile`)

### Relatórios no GitHub Pages

```
https://<usuario>.github.io/<repositorio>/api/
https://<usuario>.github.io/<repositorio>/mobile/
```

> Para ativar: Settings → Pages → Source: branch `gh-pages` → `/ (root)`.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript 5 |
| Testes de API | Supertest + Mocha + Chai |
| Testes Mobile | WebdriverIO v8 + Appium 2 |
| Driver Android | UiAutomator2 |
| Driver iOS | XCUITest |
| Relatórios | Mochawesome + Allure Report |
| CI/CD | GitHub Actions |
| Gerenciador de pacotes | Yarn 1.x (Workspaces) |

---

## App de Demonstração

Os testes mobile utilizam o **WebdriverIO Native Demo App**, mantido pela equipe WebdriverIO para fins de automação.

- Repositório: https://github.com/webdriverio/native-demo-app
