# 💸 SplitApp - Dividí gastos con amigos

Una PWA para dividir gastos entre grupos de amigos de forma simple y transparente.

## 📋 Descripción

SplitApp permite gestionar gastos compartidos entre grupos de amigos para dos casos de uso principales:

### 🎁 Modo Regalo (Cumpleaños/Eventos especiales)

- Un miembro del grupo compra un regalo para otro miembro (cumpleañero)
- El gasto se divide entre todos los participantes **excepto el agasajado**
- El agasajado **NO puede ver nada** relacionado con su regalo (sorpresa)
- Los agasajados pueden dejar una **lista de deseos** antes de retirarse del evento
- Las deudas son **acumulativas** entre eventos

### 🍖 Modo Juntada (Asados/Comidas)

- Cada participante compra algo (carne, bebidas, postre, etc.)
- Se suma todo y se divide entre los asistentes
- Se calcula la **liquidación óptima** (minimizar transferencias)
- Muestra quién le debe a quién considerando deudas cruzadas

## ✨ Características principales

- 👤 **Autenticación** con email/contraseña (Google en el futuro)
- 👥 **Múltiples grupos** por usuario
- 🔗 **Invitaciones** por link compartible (WhatsApp, email)
- 📊 **Balance en tiempo real** de deudas
- ✅ **Marcar pagos** como realizados
- 🔔 **Notificaciones** y recordatorios de pago
- 📱 **PWA** instalable en móviles
- 🔒 **Liquidación** que bloquea ediciones posteriores

## 🛠️ Stack Tecnológico

### Frontend

- **Framework:** Next.js 14 (App Router)
- **UI:** React + TailwindCSS
- **Estado:** Zustand
- **PWA:** next-pwa
- **Deploy:** Vercel

### Backend

- **Framework:** NestJS
- **Arquitectura:** Hexagonal (Ports & Adapters)
- **Base de datos:** PostgreSQL
- **ORM:** Prisma
- **Autenticación:** JWT + Passport
- **Deploy:** Railway / Render

## 📁 Estructura del Proyecto

```
split-app/
├── frontend/                 # Next.js PWA
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API calls
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   └── public/
│       └── manifest.json    # PWA manifest
│
└── backend/                  # NestJS API
    └── src/
        ├── application/     # Casos de uso
        │   ├── ports/       # Interfaces (input/output)
        │   └── use-cases/   # Lógica de negocio
        ├── domain/          # Entidades y reglas de negocio
        │   ├── entities/
        │   └── value-objects/
        ├── infrastructure/  # Implementaciones concretas
        │   ├── adapters/    # Adaptadores (DB, external services)
        │   ├── controllers/ # HTTP Controllers
        │   └── persistence/ # Prisma repositories
        └── shared/          # Utilidades compartidas
```

## 📊 Modelo de Datos

### Entidades principales

```
User
├── id
├── email
├── password (hashed)
├── name
├── avatar?
└── createdAt

Group
├── id
├── name
├── inviteCode (único)
├── createdBy (User)
├── members (User[])
└── createdAt

Event
├── id
├── groupId
├── name
├── type: 'GIFT' | 'GATHERING'
├── date
├── giftRecipientId? (para tipo GIFT - el agasajado)
├── wishList? (lista de deseos del agasajado)
├── isSettled (liquidado)
├── settledAt?
└── createdAt

Expense
├── id
├── eventId
├── paidBy (User)
├── amount
├── description
├── participants (User[]) - quiénes deben pagar
└── createdAt

Payment
├── id
├── expenseId
├── fromUser
├── toUser
├── amount
├── isPaid
├── paidAt?
└── markedPaidBy (User) - quién marcó como pagado
```

## 🔄 Flujo de Usuario

### Crear evento de cumpleaños

1. Usuario crea evento tipo "Regalo" en un grupo
2. Selecciona al agasajado (este no podrá ver el evento)
3. El agasajado puede dejar una lista de deseos (opcional)
4. Los participantes agregan gastos
5. Se calcula división automática
6. Se liquida el evento (ya no se puede editar)

### Crear evento de juntada

1. Usuario crea evento tipo "Juntada"
2. Cada participante agrega lo que compró
3. Se suma todo y divide entre asistentes
4. Se muestra liquidación óptima
5. Los que gastaron marcan los pagos recibidos
6. Se liquida el evento

## 🚀 Instalación y Desarrollo

### Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- pnpm (recomendado) o npm

### Configuración

```bash
# Clonar repositorio
git clone <repo-url>
cd split-app

# Instalar dependencias del frontend
cd frontend
pnpm install

# Instalar dependencias del backend
cd ../backend
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones de base de datos
pnpm prisma migrate dev

# Iniciar desarrollo
pnpm dev
```

### Variables de entorno

#### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/splitapp"
JWT_SECRET="tu-secreto-super-seguro"
JWT_EXPIRATION="7d"
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 📱 PWA Features

- ✅ Instalable en dispositivos móviles
- ✅ Funciona offline (datos en caché)
- ✅ Notificaciones push
- ✅ Ícono en pantalla de inicio

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- Refresh tokens para sesiones largas
- Validación de permisos por grupo
- El agasajado no puede ver eventos de regalo donde es destinatario

## 📅 Roadmap

### v1.0 (MVP)

- [x] Autenticación email/password
- [x] CRUD de grupos
- [x] Invitaciones por link
- [x] Eventos tipo Juntada
- [x] División de gastos
- [x] Liquidación

### v1.1

- [ ] Eventos tipo Regalo
- [ ] Lista de deseos
- [ ] Ocultamiento al agasajado

### v1.2

- [ ] Notificaciones push
- [ ] Recordatorios de pago
- [ ] Login con Google

### v2.0

- [ ] Múltiples monedas
- [ ] Exportar a Excel/PDF
- [ ] Estadísticas de gastos

## 👥 Autores

- Tu nombre

## 📄 Licencia

MIT
