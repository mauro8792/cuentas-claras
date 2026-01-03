# 💰 Cuentas Claras

**Dividí gastos sin complicaciones** - Una PWA moderna para gestionar gastos compartidos entre amigos, familia o compañeros de trabajo.

![SplitApp](https://img.shields.io/badge/PWA-Ready-brightgreen)
![NestJS](https://img.shields.io/badge/Backend-NestJS-red)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

---

## 🚀 Demo

- **Frontend**: [https://cuentas-claras-peach.vercel.app](https://cuentas-claras-peach.vercel.app)
- **Backend**: [https://cuentas-claras-5mdu.onrender.com](https://cuentas-claras-5mdu.onrender.com)

---

## ✨ Funcionalidades

### ✅ Implementadas

| Funcionalidad              | Descripción                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| 👥 **Grupos**              | Crear grupos para diferentes ocasiones (amigos, familia, viajes) |
| 🎁 **Modo Regalo**         | Eventos ocultos para el agasajado (cumpleaños, sorpresas)        |
| 🍖 **Modo Juntada**        | Para asados, cenas, viajes - cada uno pone lo que compró         |
| 💸 **Gastos compartidos**  | Cargar gastos y dividirlos automáticamente                       |
| 🧮 **Liquidación óptima**  | Calcula la forma más eficiente de saldar deudas                  |
| 👤 **Invitados virtuales** | Agregar participantes sin cuenta (ej: la abuela)                 |
| 🏦 **Alias bancarios**     | Configurar hasta 3 alias para recibir pagos                      |
| 🔗 **Links de invitación** | Compartir link para que se unan al grupo                         |
| ⚡ **Tiempo real**         | WebSockets para ver cambios instantáneamente                     |
| 📱 **PWA Instalable**      | Instalar como app nativa en celular                              |
| 🌙 **Modo oscuro**         | Interfaz elegante en tema oscuro                                 |

### 🎯 Casos de uso

**Modo Juntada:**

- Asados con amigos
- Viajes grupales
- Cenas o salidas
- Alquiler compartido

**Modo Regalo:**

- Cumpleaños sorpresa
- Baby showers
- Despedidas
- Regalos grupales

---

## 🛠️ Stack Tecnológico

### Backend

- **NestJS** - Framework Node.js con arquitectura hexagonal
- **Prisma** - ORM para PostgreSQL
- **Socket.io** - WebSockets para tiempo real
- **JWT** - Autenticación con refresh tokens
- **Swagger** - Documentación de API

### Frontend

- **Next.js 14** - React framework con App Router
- **Tailwind CSS** - Estilos utilitarios
- **Zustand** - Estado global
- **Socket.io Client** - WebSockets
- **next-pwa** - Progressive Web App

### Infraestructura

- **Vercel** - Hosting frontend
- **Render** - Hosting backend
- **Neon** - PostgreSQL serverless
- **Cron-job.org** - Keep-alive para Render free tier

---

## 📦 Instalación Local

### Requisitos

- Node.js 18+
- PostgreSQL (o Docker)
- npm o yarn

### 1. Clonar repositorio

```bash
git clone https://github.com/tu-usuario/cuentas-claras.git
cd cuentas-claras
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus valores:
# DATABASE_URL="postgresql://user:pass@localhost:5432/cuentas_claras"
# JWT_SECRET="tu-secreto-super-seguro"
# JWT_REFRESH_SECRET="otro-secreto-seguro"

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor
npm run start:dev
```

### 3. Configurar Frontend

```bash
cd frontend
npm install

# Crear archivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Iniciar servidor
npm run dev
```

### 4. Con Docker (Opcional)

```bash
docker-compose up -d
```

---

## 🔧 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cuentas_claras"
JWT_SECRET="tu-jwt-secret-muy-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret-muy-seguro"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📁 Estructura del Proyecto

```
cuentas-claras/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Esquema de base de datos
│   ├── src/
│   │   ├── application/         # Casos de uso (lógica de negocio)
│   │   │   ├── ports/           # Interfaces (input/output)
│   │   │   └── use-cases/       # Implementación de casos de uso
│   │   ├── domain/              # Entidades del dominio
│   │   │   └── entities/
│   │   └── infrastructure/      # Adaptadores externos
│   │       ├── adapters/        # Repositorios (Prisma)
│   │       ├── controllers/     # Endpoints REST
│   │       ├── gateways/        # WebSocket gateway
│   │       ├── guards/          # JWT guards
│   │       └── modules/         # Módulos NestJS
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── icons/               # Íconos PWA
│   │   └── manifest.json        # Manifest PWA
│   ├── src/
│   │   ├── app/                 # Páginas (App Router)
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Panel principal
│   │   │   ├── groups/[id]/     # Detalle de grupo
│   │   │   ├── events/[id]/     # Detalle de evento
│   │   │   ├── invite/[code]/   # Unirse por invitación
│   │   │   └── profile/         # Perfil y alias bancarios
│   │   ├── components/          # Componentes reutilizables
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   ├── stores/              # Zustand stores
│   │   └── types/               # TypeScript types
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Modelo de Datos

```
User ─────────┬──────────── Group
              │               │
              │          GroupMember
              │               │
              ├──────────── Event
              │               │
              │            Expense
              │            /     \
              │   ExpenseParticipant
              │          │
              └───────── Debt ───── GuestDebt
                          │
                     GuestMember
                          │
                     BankAlias
```

---

## 🔌 API Endpoints

### Auth

| Método | Endpoint             | Descripción       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Registrar usuario |
| POST   | `/api/auth/login`    | Iniciar sesión    |
| POST   | `/api/auth/refresh`  | Renovar token     |

### Groups

| Método | Endpoint                 | Descripción       |
| ------ | ------------------------ | ----------------- |
| GET    | `/api/groups`            | Mis grupos        |
| POST   | `/api/groups`            | Crear grupo       |
| GET    | `/api/groups/:id`        | Detalle de grupo  |
| POST   | `/api/groups/join/:code` | Unirse por código |
| DELETE | `/api/groups/:id/leave`  | Abandonar grupo   |

### Events

| Método | Endpoint                     | Descripción       |
| ------ | ---------------------------- | ----------------- |
| GET    | `/api/events/group/:groupId` | Eventos del grupo |
| POST   | `/api/events/group/:groupId` | Crear evento      |
| POST   | `/api/events/:id/settle`     | Liquidar evento   |
| DELETE | `/api/events/:id`            | Eliminar evento   |

### Expenses

| Método | Endpoint                                  | Descripción         |
| ------ | ----------------------------------------- | ------------------- |
| GET    | `/api/expenses/event/:eventId`            | Gastos del evento   |
| POST   | `/api/expenses/event/:eventId`            | Crear gasto         |
| PUT    | `/api/expenses/:id`                       | Editar gasto        |
| DELETE | `/api/expenses/:id`                       | Eliminar gasto      |
| GET    | `/api/expenses/event/:eventId/settlement` | Liquidación óptima  |
| POST   | `/api/expenses/debts/:debtId/pay`         | Marcar deuda pagada |

### Guests

| Método | Endpoint                               | Descripción         |
| ------ | -------------------------------------- | ------------------- |
| GET    | `/api/groups/:groupId/guests`          | Invitados del grupo |
| POST   | `/api/groups/:groupId/guests`          | Agregar invitado    |
| DELETE | `/api/groups/:groupId/guests/:guestId` | Eliminar invitado   |

### Bank Aliases

| Método | Endpoint                | Descripción    |
| ------ | ----------------------- | -------------- |
| GET    | `/api/bank-aliases`     | Mis alias      |
| POST   | `/api/bank-aliases`     | Crear alias    |
| PUT    | `/api/bank-aliases/:id` | Editar alias   |
| DELETE | `/api/bank-aliases/:id` | Eliminar alias |

---

## 🛣️ Roadmap

### 🔜 Próximamente

- [ ] 🔔 **Notificaciones Push** - Avisos de nuevos gastos y recordatorios
- [ ] 📊 **División desigual** - Por porcentajes, partes o montos exactos
- [ ] 📸 **Foto del ticket** - Adjuntar comprobante al gasto
- [ ] 💱 **Múltiples monedas** - Para viajes internacionales

### 📋 Backlog

- [ ] 🏷️ Categorías de gastos (comida, transporte, etc.)
- [ ] 📈 Estadísticas y gráficos
- [ ] 📥 Exportar a PDF/Excel
- [ ] 💬 Comentarios en gastos
- [ ] 🔄 Gastos recurrentes
- [ ] 📜 Historial de cambios
- [ ] 🌐 Modo offline (sincronización)
- [ ] 💳 Integración con Mercado Pago

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

Desarrollado con ❤️ en Argentina 🇦🇷

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://prisma.io/)
- [Vercel](https://vercel.com/)
- [Render](https://render.com/)
- [Firebase](https://firebase.google.com/)
