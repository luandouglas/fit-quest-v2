# FitQuest

Template base escalavel para **Web + Android + iOS** usando:
- React + Vite + TypeScript
- Ionic React
- Capacitor
- Sem Expo

## Visao Geral
O projeto segue fluxo **web-first**:
1. Desenvolve e valida no navegador.
2. Gera build web.
3. Sincroniza no Capacitor.
4. Abre no Android Studio / Xcode para build nativo.

## Stack
- Node.js 20+
- npm 10+
- React 19
- Vite 8
- Ionic React 8
- Capacitor 8

## Pre-requisitos

### Geral
- Node.js instalado
- npm instalado

### Android
- Android Studio
- Android SDK configurado
- Emulador ou dispositivo Android

### iOS (apenas macOS)
- Xcode
- CocoaPods instalado
- Simulador iOS ou dispositivo iPhone

## Como Rodar (Web)

```bash
npm install
npm run dev
```

App web em modo dev: `http://localhost:5173`

### Build de Producao (Web)
```bash
npm run build
npm run preview
```

## Como Rodar (Mobile com Capacitor)

### 1) Garantir build web atualizado
```bash
npm run build
```

### 2) Adicionar plataformas (apenas 1x)
```bash
npx cap add android
npx cap add ios
```

### 3) Sincronizar assets/codigo web no nativo
```bash
npm run cap:sync
```

### 4) Abrir IDE nativa
```bash
npm run cap:android
npm run cap:ios
```

## Scripts Disponiveis

- `npm run dev`: inicia ambiente web de desenvolvimento
- `npm run build`: gera build de producao em `dist`
- `npm run preview`: sobe preview local da build
- `npm run cap:init`: inicializa Capacitor (normalmente ja configurado)
- `npm run cap:sync`: sincroniza web build com Android/iOS
- `npm run cap:copy`: copia arquivos web para plataformas
- `npm run cap:android`: abre projeto Android no Android Studio
- `npm run cap:ios`: abre projeto iOS no Xcode

## Estrutura do Projeto

```txt
src
├── app/          # bootstrap, providers, router e layouts globais
├── features/     # modulos por feature (auth, home, profile)
├── shared/       # UI, hooks, services, utils, types, theme
└── types/        # declaracoes globais de tipos
```

### Convencoes
- Arquitetura **feature-first**
- Alias de import: `@/` -> `src/`
- Barrel files (`index.ts`) para exports por pasta
- Tema centralizado em `src/shared/theme`

## Rotas Base
- Publica: `/login`
- Privadas: `/tabs/home`, `/tabs/profile`
- Fallback: `404`

## Tema e UI Base
- Cores FitQuest em `src/shared/theme/colors.css`
- Tipografia global em `src/shared/theme/typography.css`
- Estilos globais e utilitarios em `src/shared/theme/global.css`
- Componentes reutilizaveis em `src/shared/ui`

## Checklist Rapido de Onboarding

### Web
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Acessar `/login`
- [ ] Validar login/logout e navegacao por tabs

### Android
- [ ] `npm run build`
- [ ] `npm run cap:sync`
- [ ] `npm run cap:android`
- [ ] Rodar no emulador/dispositivo

### iOS
- [ ] `npm run build`
- [ ] `npm run cap:sync`
- [ ] `npm run cap:ios`
- [ ] Configurar Signing no Xcode
- [ ] Rodar no simulador/dispositivo

## Troubleshooting

### App abriu no Android/iOS, mas sem atualizacao recente
Sempre rode:
```bash
npm run build
npm run cap:sync
```

### Erro de dependencias
Limpe e reinstale:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro de build no iOS (Pods)
No diretório `ios/App`:
```bash
pod install
```

### Porta 5173 ocupada
Rode o Vite em outra porta:
```bash
npm run dev -- --port 5174
```

## Proximos Passos Recomendados
1. Integrar API real de autenticacao no lugar do mock local.
2. Adicionar camada HTTP central (`shared/services/http`).
3. Configurar ambientes (`.env.development`, `.env.production`).
4. Adicionar testes (unitarios e e2e).

---
Se voce pegou este projeto agora, comece por: `npm install && npm run dev`.
