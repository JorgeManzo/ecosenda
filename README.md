# Ecosenda

Plataforma de gestión de brigadas comunitarias de limpieza en Guadalajara.

## Requisitos

- Node.js 18+
- Cuenta de Supabase
- Cuenta de Netlify (para deploy)

## Setup

### 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al SQL Editor y ejecuta el schema completo en `supabase/schema.sql`
3. Copia el Project URL y el anon/public key de Settings → API

### 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Correr localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Panel de administración
│   ├── brigades/          # Vista de brigadas (voluntarios)
│   ├── login/             # Login
│   ├── profile/           # Perfil de usuario
│   └── register/          # Registro
├── components/ui/        # Componentes reutilizables
├── features/             # Código por dominio
├── lib/                   # Utilidades (Supabase, constantes)
└── types/                # Tipos TypeScript
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Login de voluntarios y admins |
| `/register` | Registro de voluntarios |
| `/brigades` | Feed de brigadas disponibles |
| `/profile` | Perfil del voluntario |
| `/admin/dashboard` | Dashboard del admin |
| `/admin/brigadas` | Gestionar brigadas |
| `/admin/brigadas/nueva` | Crear nueva brigada |

## Deploy a Netlify

1. Conecta tu repositorio a Netlify
2. Configura:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Añade las variables de entorno en Netlify dashboard
4. Deploy!

## Notas

- Los admins se identifican por email en la tabla `admin_emails`
- Los voluntarios menores de 18 años no pueden registrarse (validación en frontend y DB)
- El mapa usa OpenStreetMap via Leaflet (no requiere API key)
