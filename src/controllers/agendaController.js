const supabase = require('../config/supabase');

const getAgenda = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agenda_academica')
      .select('*')
      .eq('id_usuario', req.user.id)
      .order('fecha_inicio', { ascending: true });
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createAgendaItem = async (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_fin, categoria, tipo, completada } = req.body;
  if (!titulo || !fecha_inicio) return res.status(400).json({ message: 'Título y fecha_inicio son requeridos' });
  try {
    const { data, error } = await supabase
      .from('agenda_academica')
      .insert([{
        titulo,
        descripcion: descripcion || null,
        fecha_inicio,
        fecha_fin: fecha_fin || null,
        categoria: categoria || 'General',
        tipo: tipo || 'actividad',
        completada: completada || false,
        id_usuario: req.user.id
      }])
      .select();
    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateAgendaItem = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_inicio, fecha_fin, categoria, tipo, completada } = req.body;
  try {
    const updates = {};
    if (titulo !== undefined)      updates.titulo      = titulo;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (fecha_inicio !== undefined) updates.fecha_inicio = fecha_inicio;
    if (fecha_fin !== undefined)   updates.fecha_fin   = fecha_fin;
    if (categoria !== undefined)   updates.categoria   = categoria;
    if (tipo !== undefined)        updates.tipo        = tipo;
    if (completada !== undefined)  updates.completada  = completada;

    const { data, error } = await supabase
      .from('agenda_academica')
      .update(updates)
      .eq('id', id)
      .eq('id_usuario', req.user.id)
      .select();
    if (error) throw error;
    return res.json(data[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteAgendaItem = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('agenda_academica')
      .delete()
      .eq('id', id)
      .eq('id_usuario', req.user.id);
    if (error) throw error;
    return res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPrioridades = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notas_rapidas')
      .select('*')
      .eq('id_usuario', req.user.id)
      .eq('categoria', 'prioridad')
      .order('created_at', { ascending: true });
    if (error) throw error;
    // Devolver con campo completada derivado de contenido
    const mapped = (data || []).map(function(r) {
      return Object.assign({}, r, { completada: r.contenido === 'true' });
    });
    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createPrioridad = async (req, res) => {
  const { titulo, completada } = req.body;
  if (!titulo) return res.status(400).json({ message: 'El título es requerido' });
  try {
    const { data, error } = await supabase
      .from('notas_rapidas')
      .insert([{
        titulo,
        contenido:  completada ? 'true' : 'false',  // estado persistido en contenido
        color:      'azul',
        categoria:  'prioridad',
        fijada:     false,
        archivada:  false,
        id_usuario: req.user.id
      }])
      .select();
    if (error) throw error;
    const row = Object.assign({}, data[0], { completada: data[0].contenido === 'true' });
    return res.status(201).json(row);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updatePrioridad = async (req, res) => {
  const { id } = req.params;
  const { titulo, completada } = req.body;
  try {
    const updates = {};
    if (titulo     !== undefined) updates.titulo   = titulo;
    if (completada !== undefined) updates.contenido = completada ? 'true' : 'false';

    const { data, error } = await supabase
      .from('notas_rapidas')
      .update(updates)
      .eq('id', id)
      .eq('id_usuario', req.user.id)
      .eq('categoria', 'prioridad')
      .select();
    if (error) throw error;
    const row = Object.assign({}, data[0], { completada: data[0].contenido === 'true' });
    return res.json(row);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deletePrioridad = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('notas_rapidas')
      .delete()
      .eq('id', id)
      .eq('id_usuario', req.user.id)
      .eq('categoria', 'prioridad');
    if (error) throw error;
    return res.json({ message: 'Prioridad eliminada' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAgenda, createAgendaItem, updateAgendaItem, deleteAgendaItem,
  getPrioridades, createPrioridad, updatePrioridad, deletePrioridad
};
