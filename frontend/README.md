# Oficina · Painel (Front-end React)

Interface web para a API **Car_Repair_Shop** (.NET). Gerencia clientes, veículos,
mecânicos, estoque de peças e ordens de serviço, com autenticação JWT.

## Stack

- **React 18** + **Vite 5** (JavaScript / JSX)
- **react-router-dom** para as rotas
- **lucide-react** para ícones
- CSS puro (tema escuro "garagem" em `src/index.css`) — sem framework de UI
- Gráfico do painel feito à mão em CSS (sem dependência de charts)

## Rodando

```bash
cd frontend
npm install
npm run dev
```

App em **http://localhost:5173**.

### Ligando na API

O Vite faz proxy de tudo que começa com `/api` para o backend, ignorando o
certificado HTTPS de desenvolvimento (`secure: false` em `vite.config.js`).
Assim não há problema de CORS nem de certificado autoassinado.

Confirme a porta da API em `../Properties/launchSettings.json`. O padrão aqui é
`https://localhost:62635`. Para trocar sem editar o `vite.config.js`:

```bash
# PowerShell
$env:VITE_API_TARGET = "https://localhost:5001"; npm run dev
```

Suba a API antes (`dotnet run` na raiz do projeto). Rode uma vez
`dotnet dev-certs https --trust` se ainda não tiver confiado no certificado.

### Primeiro acesso

Todas as rotas da API exigem o papel **Admin**. A tela de login tem uma aba
**Registrar** — a conta criada por ela já entra como Admin (ver
`AuthController.Register`). Crie a primeira conta por lá e siga em frente.

## Build de produção

```bash
npm run build      # gera dist/
npm run preview     # serve o dist/ localmente
```

## ⚠️ O caractere `#` no caminho

O projeto está em `...\C#\Sistema_Oficina\...`. O **Vite não suporta `#` no
caminho da pasta raiz**: o `npm run dev` falha com
`Failed to load url /src/main.jsx (Does the file exist?)` e o `npm run build`
pode quebrar ao resolver dependências.

**Solução (Windows):** crie um *junction* sem `#` apontando para esta pasta e
rode o Vite de lá. Feito uma vez, `node_modules` é compartilhado:

```powershell
New-Item -ItemType Junction -Path C:\oficina-web `
  -Target "C:\Users\Pichau\Documents\Junior\Junior\C#\Sistema_Oficina\Car_Repair_Shop\frontend"

cd C:\oficina-web
npm install     # só na primeira vez
npm run dev
```

Editar os arquivos em `frontend\` continua funcionando normalmente — o junction
é a mesma pasta. Alternativa definitiva: mover `frontend\` para um caminho sem
`#` (ex.: `C:\dev\oficina-web`).

## Organização

```
src/
  api/
    client.js       Wrapper de fetch: baseURL /api, Bearer token, tratamento de 401
    resources.js    Endpoints por recurso (Client, Vehicle, Mechanic, Piece, WorkOrder, WorkOrderPiece, Auth)
  context/
    AuthContext.jsx   Login/registro, token em localStorage, expiração pelo exp do JWT
    ToastContext.jsx  Notificações
  components/
    Layout.jsx      Shell com sidebar + topbar
    Modal.jsx       Modal via portal
    ConfirmDialog.jsx
    ui.jsx          Spinner, EmptyState, StatusPill, Field, ErrorNote
  hooks/
    useCollection.js  Carrega uma lista + refetch
  pages/
    Login.jsx
    Dashboard.jsx        KPIs, distribuição por status, ordens recentes
    Clients.jsx          CRUD (tabela + modal)
    Vehicles.jsx         CRUD (cards + modal, vínculo com cliente)
    Mechanics.jsx        CRUD (cards + modal)
    Pieces.jsx           CRUD + indicadores de estoque
    WorkOrders.jsx       Lista + filtro por status + criação
    WorkOrderDetail.jsx  Fluxo de status, diagnóstico, peças aplicadas, resumo financeiro
  utils/
    format.js       money (BRL), datas, máscara de CPF, iniciais
    status.js       Espelha o enum WorkOrderStatus (Open/InProgress/Finished/Delivered)
```

## Notas de integração

- `WorkOrderStatus` é serializado como inteiro pela API; `utils/status.js`
  também aceita string por segurança.
- `PUT /WorkOrder/{id}` só aceita `problemDescription`, `service`,
  `departureDate`, `value` e `status`. Cliente/veículo/mecânico e número são
  definidos apenas na criação — por isso a edição fica na tela de detalhe.
- `WorkOrderPiece` usa chave composta: as rotas de update/delete são
  `/WorkOrderPiece/{workOrderId}/{pieceId}`.
- O back-end não baixa o estoque da peça automaticamente ao aplicá-la numa
  ordem; o painel apenas exibe a quantidade disponível.
