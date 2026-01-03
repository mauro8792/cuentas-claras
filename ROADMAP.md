# 🗺️ ROADMAP - SplitApp

## Visión General

SplitApp evolucionará de una app para **dividir gastos entre amigos** a una plataforma completa de **gestión de finanzas personales y compartidas**.

---

## 📊 Estado Actual (v1.0) ✅

### Funcionalidades implementadas:
- [x] Autenticación (registro, login, JWT)
- [x] Grupos para dividir gastos
- [x] Eventos (Juntadas, Regalos)
- [x] Gastos compartidos con división automática
- [x] Participantes manuales (invitados sin cuenta)
- [x] Liquidación óptima de deudas
- [x] Notificaciones push (Firebase)
- [x] Actualizaciones en tiempo real (WebSocket)
- [x] PWA instalable
- [x] Alias bancarios para transferencias
- [x] Selector de emojis
- [x] Edición de grupos y eventos

---

## 🚀 Nueva Feature: Billeteras (v2.0)

### 🎯 Objetivo
Permitir a los usuarios llevar un **control de gastos personales o familiares**, con categorías, análisis y la posibilidad de compartir con pareja/familia.

---

## 📅 Fases de Implementación

### Fase 1: Backend - Modelos y APIs 🔧
**Tiempo estimado: 2-3 días**

#### 1.1 Nuevos modelos de base de datos:

```prisma
// Billetera (personal o compartida)
model Wallet {
  id          String   @id @default(cuid())
  name        String
  type        WalletType @default(PERSONAL)
  currency    String   @default("ARS")
  createdById String
  createdBy   User     @relation("WalletCreator", fields: [createdById], references: [id])
  members     WalletMember[]
  expenses    PersonalExpense[]
  categories  Category[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum WalletType {
  PERSONAL    // Solo el creador
  SHARED      // Compartida (pareja, familia)
}

// Miembros de billetera compartida
model WalletMember {
  id        String   @id @default(cuid())
  walletId  String
  wallet    Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      WalletRole @default(MEMBER)
  joinedAt  DateTime @default(now())

  @@unique([walletId, userId])
}

enum WalletRole {
  OWNER
  MEMBER
}

// Categorías de gastos
model Category {
  id        String   @id @default(cuid())
  name      String
  icon      String   // Emoji
  color     String   // Hex color
  walletId  String?  // null = categoría global/predeterminada
  wallet    Wallet?  @relation(fields: [walletId], references: [id], onDelete: Cascade)
  expenses  PersonalExpense[]
  isDefault Boolean  @default(false)
}

// Gastos personales/familiares
model PersonalExpense {
  id            String      @id @default(cuid())
  amount        Float
  description   String
  date          DateTime
  type          ExpenseType
  currency      String      @default("ARS")  // Moneda del gasto
  exchangeRate  Float?      // Cotización al momento (si es distinta a la billetera)
  walletId      String
  wallet        Wallet      @relation(fields: [walletId], references: [id], onDelete: Cascade)
  categoryId    String
  category      Category    @relation(fields: [categoryId], references: [id])
  paidById      String
  paidBy        User        @relation(fields: [paidById], references: [id])
  isRecurring   Boolean     @default(false)
  recurringId   String?     // ID del gasto recurrente padre
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum ExpenseType {
  FIXED       // Fijo (alquiler, cuotas, suscripciones)
  VARIABLE    // Variable (luz, gas, supermercado)
}

// Gastos recurrentes (plantillas)
model RecurringExpense {
  id          String   @id @default(cuid())
  amount      Float
  description String
  dayOfMonth  Int      // Día del mes (1-31)
  type        ExpenseType
  walletId    String
  categoryId  String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

#### 1.2 Soporte Multi-Moneda:

```prisma
// Monedas soportadas
model Currency {
  id        String   @id @default(cuid())
  code      String   @unique  // ARS, USD, EUR, BRL
  name      String            // Peso Argentino, Dólar, Euro, Real
  symbol    String            // $, US$, €, R$
  flag      String            // 🇦🇷, 🇺🇸, 🇪🇺, 🇧🇷
}
```

**Monedas iniciales:**

| Código | Nombre | Símbolo | Flag |
|--------|--------|---------|------|
| ARS | Peso Argentino | $ | 🇦🇷 |
| USD | Dólar Estadounidense | US$ | 🇺🇸 |
| EUR | Euro | € | 🇪🇺 |
| BRL | Real Brasileño | R$ | 🇧🇷 |
| UYU | Peso Uruguayo | $U | 🇺🇾 |
| CLP | Peso Chileno | CLP$ | 🇨🇱 |

**Funcionalidades:**
- Cada billetera tiene una moneda principal
- Cada gasto puede tener su propia moneda
- Conversión automática para totales (usando cotización del día o manual)
- Historial de cotizaciones

**Ejemplo de uso:**
```
Billetera: "Gastos Personales" (ARS)
├── 🏠 Alquiler: $150.000 ARS
├── 🎬 Netflix: US$15 USD → ~$15.000 ARS
├── 📚 Curso Udemy: US$20 USD → ~$20.000 ARS
└── Total: ~$185.000 ARS
```

#### 1.3 Categorías predeterminadas:

| Icono | Nombre | Color |
|-------|--------|-------|
| 🏠 | Hogar | #8B5CF6 |
| ⚡ | Servicios | #F59E0B |
| 🛒 | Supermercado | #10B981 |
| 🚗 | Transporte | #3B82F6 |
| 👕 | Ropa | #EC4899 |
| 🎉 | Entretenimiento | #F97316 |
| 💊 | Salud | #EF4444 |
| 📚 | Educación | #6366F1 |
| 💳 | Tarjeta | #14B8A6 |
| 📦 | Otros | #6B7280 |

#### 1.3 Endpoints API:

```
# Billeteras
POST   /wallets              - Crear billetera
GET    /wallets              - Mis billeteras
GET    /wallets/:id          - Detalle de billetera
PUT    /wallets/:id          - Editar billetera
DELETE /wallets/:id          - Eliminar billetera

# Miembros
POST   /wallets/:id/members  - Invitar miembro
DELETE /wallets/:id/members/:userId - Remover miembro

# Categorías
GET    /wallets/:id/categories - Categorías de la billetera
POST   /wallets/:id/categories - Crear categoría personalizada
PUT    /categories/:id       - Editar categoría
DELETE /categories/:id       - Eliminar categoría

# Gastos personales
GET    /wallets/:id/expenses - Listar gastos (con filtros)
POST   /wallets/:id/expenses - Crear gasto
PUT    /expenses/:id         - Editar gasto
DELETE /expenses/:id         - Eliminar gasto

# Gastos recurrentes
GET    /wallets/:id/recurring - Listar gastos recurrentes
POST   /wallets/:id/recurring - Crear gasto recurrente
PUT    /recurring/:id        - Editar
DELETE /recurring/:id        - Eliminar

# Reportes
GET    /wallets/:id/summary  - Resumen mensual
GET    /wallets/:id/stats    - Estadísticas por categoría
GET    /wallets/:id/trends   - Tendencias (comparación meses)
```

---

### Fase 2: Frontend - UI Base 🎨
**Tiempo estimado: 3-4 días**

#### 2.1 Nuevas páginas:

```
/wallets                    - Lista de billeteras
/wallets/new                - Crear billetera
/wallets/[id]               - Dashboard de billetera
/wallets/[id]/expenses      - Lista de gastos
/wallets/[id]/expenses/new  - Agregar gasto
/wallets/[id]/recurring     - Gastos recurrentes
/wallets/[id]/reports       - Reportes y gráficos
/wallets/[id]/settings      - Configuración, miembros
```

#### 2.2 Componentes nuevos:

- `WalletCard` - Tarjeta de billetera en lista
- `ExpenseForm` - Formulario de gasto
- `CategoryPicker` - Selector de categoría con iconos
- `ExpenseTypeToggle` - Toggle Fijo/Variable
- `CurrencyPicker` - Selector de moneda con flags
- `MonthPicker` - Selector de mes para filtrar
- `CategoryChart` - Gráfico de torta por categoría
- `TrendChart` - Gráfico de línea de tendencias
- `RecurringExpenseCard` - Tarjeta de gasto recurrente

#### 2.3 Selector de moneda:

```
┌─────────────────────────────────────┐
│  Monto                              │
│  ┌─────────┐ ┌──────────────────┐  │
│  │ 🇦🇷 ARS ▼│ │ $ 15.000        │  │
│  └─────────┘ └──────────────────┘  │
│                                     │
│  ▼ Monedas disponibles             │
│  ┌─────────────────────────────┐   │
│  │ 🇦🇷 ARS - Peso Argentino    │   │
│  │ 🇺🇸 USD - Dólar             │   │
│  │ 🇪🇺 EUR - Euro              │   │
│  │ 🇧🇷 BRL - Real              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Si el gasto es en otra moneda:**
```
┌─────────────────────────────────────┐
│  Monto: US$ 15.00                   │
│                                     │
│  💱 Cotización (opcional)           │
│  1 USD = $ [1.050] ARS              │
│                                     │
│  ≈ $15.750 ARS                      │
└─────────────────────────────────────┘
```

#### 2.4 Dashboard de billetera:

```
┌─────────────────────────────────────────┐
│  💰 Mi Billetera Personal               │
│  Enero 2026                    [< >]    │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Total   │ │ Fijos   │ │Variables│   │
│  │$250.000 │ │$150.000 │ │$100.000 │   │
│  └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│        [GRÁFICO DE TORTA]               │
│    🏠 30% │ ⚡ 25% │ 🛒 20% │ ...      │
├─────────────────────────────────────────┤
│  Últimos gastos                         │
│  ┌─────────────────────────────────┐   │
│  │ ⚡ Luz EDENOR         $15.000   │   │
│  │ 🛒 Supermercado Coto  $25.000   │   │
│  │ 🏠 Alquiler           $80.000   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ Agregar gasto]                      │
└─────────────────────────────────────────┘
```

---

### Fase 3: Gastos Recurrentes ⏰
**Tiempo estimado: 1-2 días**

#### 3.1 Funcionalidades:

- Crear plantilla de gasto recurrente
- Definir día del mes
- Marcar como "pagado" cada mes
- Recordatorio de gastos pendientes
- Generar automáticamente al inicio de mes (cron job)

#### 3.2 UI de recurrentes:

```
┌─────────────────────────────────────────┐
│  🔄 Gastos Recurrentes                  │
├─────────────────────────────────────────┤
│  Enero 2026                             │
│                                         │
│  ✅ 🏠 Alquiler          $80.000   (5)  │
│  ✅ 💳 Netflix           $5.000    (15) │
│  ⬜ ⚡ Luz EDENOR        ~$15.000  (20) │
│  ⬜ 💊 Obra Social       $12.000   (25) │
│                                         │
│  Total fijos: $112.000                  │
│  Pagados: $85.000 | Pendientes: $27.000 │
└─────────────────────────────────────────┘
```

---

### Fase 4: Reportes y Análisis 📈
**Tiempo estimado: 2-3 días**

#### 4.1 Gráficos:

1. **Torta por categoría** - En qué gastás más
2. **Barras mensual** - Comparación mes a mes
3. **Línea de tendencia** - Evolución de gastos
4. **Fijos vs Variables** - Proporción

#### 4.2 Estadísticas:

- Promedio mensual por categoría
- Mes que más gastaste
- Categoría que más creció
- Predicción del mes actual

---

### Fase 5: Billeteras Compartidas 👨‍👩‍👧‍👦
**Tiempo estimado: 2 días**

#### 5.1 Funcionalidades:

- Invitar pareja/familia por código
- Ver quién agregó cada gasto
- Filtrar por miembro
- Notificaciones cuando otro agrega gasto

#### 5.2 Permisos:

| Acción | Owner | Member |
|--------|-------|--------|
| Ver gastos | ✅ | ✅ |
| Agregar gastos | ✅ | ✅ |
| Editar sus gastos | ✅ | ✅ |
| Editar gastos de otros | ✅ | ❌ |
| Invitar miembros | ✅ | ❌ |
| Eliminar miembros | ✅ | ❌ |
| Eliminar billetera | ✅ | ❌ |

---

### Fase 6: Mejoras y Polish ✨
**Tiempo estimado: 2 días**

- [ ] Búsqueda de gastos
- [ ] Exportar a Excel/CSV
- [ ] Modo oscuro mejorado
- [ ] Animaciones y transiciones
- [ ] Onboarding para nuevos usuarios
- [ ] Tips de ahorro basados en datos

---

## 🔮 Futuro (v3.0+)

### Ideas para más adelante:

- 📸 **Escaneo de tickets** - OCR para extraer monto
- 🎯 **Presupuestos** - Límite por categoría con alertas
- 🏦 **Conexión bancaria** - Sincronizar movimientos (Open Banking)
- 💱 **Multi-moneda** - USD, EUR, etc.
- 📱 **App nativa** - React Native
- 🤖 **IA** - Categorización automática, predicciones

---

## 📝 Prioridades

| Prioridad | Feature | Fase |
|-----------|---------|------|
| 🔴 Alta | Modelos y APIs base | 1 |
| 🔴 Alta | Dashboard y lista de gastos | 2 |
| 🟡 Media | Gastos recurrentes | 3 |
| 🟡 Media | Gráficos básicos | 4 |
| 🟢 Baja | Billeteras compartidas | 5 |
| 🟢 Baja | Exportación y mejoras | 6 |

---

## 🚦 Timeline Estimado

```
Semana 1: Fase 1 + Fase 2 (Backend + UI base)
Semana 2: Fase 3 + Fase 4 (Recurrentes + Reportes)
Semana 3: Fase 5 + Fase 6 (Compartidas + Polish)
```

**Total estimado: 2-3 semanas**

---

## 🤝 Contribuir

Si querés ayudar con alguna fase, abrí un issue o PR en el repo.

---

*Última actualización: Enero 2026*

