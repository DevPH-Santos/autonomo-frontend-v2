# Autonomo Frontend V2

Projeto Next.js organizado com uma estrutura minimalista e pronta para crescer.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Estrutura

```txt
src/
  app/
    (auth)/          Rotas publicas de login e cadastro
    (app)/           Rotas internas do sistema
    layout.tsx       Layout raiz
    page.tsx         Redireciona para /login
  components/
    layout/          Estrutura visual reutilizavel
    ui/              Componentes pequenos e reutilizaveis
  hooks/             Hooks compartilhados
  lib/               API, utils e infraestrutura
  modules/           Regras e telas por dominio
  types/             Tipos globais
```

## Padrao de paginas

As rotas ficam pequenas e importam a tela do modulo correspondente:

```tsx
import { ClientesPage } from "@/modules/clientes";

export default function Page() {
  return <ClientesPage />;
}
```

## API

Configure a URL do backend em um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Use `src/lib/api.ts` como cliente central para chamadas HTTP.
