// ============================================
// DIAGNÓSTICO DE CONEXIÓN — ConoceTec
// Ejecutar con: node test-conexion.js
// ============================================
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function diagnostico() {
  console.log('\n🔍 DIAGNÓSTICO DE CONEXIÓN ConoceTec\n');
  console.log('📡 URL:', process.env.SUPABASE_URL);
  console.log('🔑 Key:', process.env.SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Falta');
  console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Presente' : '❌ Falta');
  console.log('');

  const tablas = [
    'usuarios',
    'agenda_academica',
    'notas_rapidas',
    'directorio_docente',
    'servicios_institucionales'
  ];

  for (const tabla of tablas) {
    try {
      const { data, error, count } = await supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${tabla.padEnd(30)} → TABLA NO EXISTE (ejecuta setup_database.sql)`);
        } else if (error.code === 'PGRST301') {
          console.log(`🔒 ${tabla.padEnd(30)} → BLOQUEADA POR RLS (ver instrucciones abajo)`);
        } else {
          console.log(`⚠️  ${tabla.padEnd(30)} → Error: ${error.message}`);
        }
      } else {
        console.log(`✅ ${tabla.padEnd(30)} → OK (${count ?? '?'} registros)`);
      }
    } catch (e) {
      console.log(`💥 ${tabla.padEnd(30)} → Excepción: ${e.message}`);
    }
  }

  console.log('\n🧪 Probando INSERT en usuarios (registro de prueba)...');
  const testEmail = `test_${Date.now()}@diagnostico.local`;
  const { data: insertData, error: insertError } = await supabase
    .from('usuarios')
    .insert([{
      nombre: 'Test Diagnóstico',
      email: testEmail,
      password: 'hash_prueba',
      rol: 'estudiante'
    }])
    .select();

  if (insertError) {
    console.log('❌ INSERT falló:', insertError.message);
    if (insertError.code === '42501') {
      console.log('   → Causa: RLS activo. Ver solución abajo.');
    }
  } else {
    console.log('✅ INSERT funcionó correctamente');
    // Limpiar el registro de prueba
    await supabase.from('usuarios').delete().eq('email', testEmail);
    console.log('🧹 Registro de prueba eliminado');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

diagnostico().catch(console.error);
