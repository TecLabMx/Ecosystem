-- 1. EXTENSIONES (Opcional pero recomendado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE USUARIOS (ALUMNOS Y ADMINS)
-- Si la tabla ya existe, añadimos los campos faltantes
DO $$ 
BEGIN
    -- Campos de perfil académico
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'numero_control') THEN
        ALTER TABLE usuarios ADD COLUMN numero_control TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'carrera') THEN
        ALTER TABLE usuarios ADD COLUMN carrera TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'semestre') THEN
        ALTER TABLE usuarios ADD COLUMN semestre INTEGER;
    END IF;
    
    -- Campos de contacto
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'telefono') THEN
        ALTER TABLE usuarios ADD COLUMN telefono TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'telefono_emergencia') THEN
        ALTER TABLE usuarios ADD COLUMN telefono_emergencia TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'direccion') THEN
        ALTER TABLE usuarios ADD COLUMN direccion TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'ciudad') THEN
        ALTER TABLE usuarios ADD COLUMN ciudad TEXT;
    END IF;
    
    -- Metadatos
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'usuarios' AND column_name = 'created_at') THEN
        ALTER TABLE usuarios ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. TABLA DE VISITANTES (NUEVA)
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    motivo_visita TEXT,
    fecha_acceso TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE AGENDA ACADÉMICA
CREATE TABLE IF NOT EXISTS agenda_academica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ,
    categoria TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE NOTAS RÁPIDAS
CREATE TABLE IF NOT EXISTS notas_rapidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contenido TEXT,
    color TEXT DEFAULT '#ffffff',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE DIRECTORIO DOCENTE
CREATE TABLE IF NOT EXISTS directorio_docente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    departamento TEXT,
    email TEXT,
    cubiculo TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE SERVICIOS INSTITUCIONALES
CREATE TABLE IF NOT EXISTS servicios_institucionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    ubicacion TEXT,
    horario TEXT,
    icono TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONFIGURACIÓN DE SEGURIDAD (RLS)
-- Habilitar RLS en tablas sensibles
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_academica ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_rapidas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Ejemplo: el usuario solo puede ver sus propios datos)
-- Nota: Esto requiere que el auth de Supabase esté vinculado, 
-- si usas tu propio backend con JWT, la lógica de filtrado se hace en el código.

-- ── COLUMNAS ADICIONALES para notas (requeridas por el nuevo sistema) ──
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='notas_rapidas' AND column_name='color') THEN
        ALTER TABLE notas_rapidas ADD COLUMN color TEXT DEFAULT 'amarilla';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='notas_rapidas' AND column_name='categoria') THEN
        ALTER TABLE notas_rapidas ADD COLUMN categoria TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='notas_rapidas' AND column_name='fijada') THEN
        ALTER TABLE notas_rapidas ADD COLUMN fijada BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='notas_rapidas' AND column_name='archivada') THEN
        ALTER TABLE notas_rapidas ADD COLUMN archivada BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ── COLUMNAS ADICIONALES para agenda ──
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='agenda_academica' AND column_name='tipo') THEN
        ALTER TABLE agenda_academica ADD COLUMN tipo TEXT DEFAULT 'actividad';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='agenda_academica' AND column_name='completada') THEN
        ALTER TABLE agenda_academica ADD COLUMN completada BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ── COLUMNA icono para servicios ──
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='servicios_institucionales' AND column_name='icono') THEN
        ALTER TABLE servicios_institucionales ADD COLUMN icono TEXT;
    END IF;
END $$;
