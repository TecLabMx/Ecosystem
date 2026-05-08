const supabase = require('../config/supabase');

// GET /api/priorities — obtener prioridades del usuario
const getPriorities = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prioridades_usuario')
      .select('*')
      .eq('id_usuario', req.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/priorities — crear prioridad
const createPriority = async (req, res) => {
  const { texto } = req.body;
  if (!texto || !texto.trim()) return res.status(400).json({ message: 'El texto es requerido' });
  try {
    const { data, error } = await supabase
      .from('prioridades_usuario')
      .insert([{ texto: texto.trim(), completada: false, id_usuario: req.user.id }])
      .select();
    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/priorities/:id — actualizar prioridad
const updatePriority = async (req, res) => {
  const { id } = req.params;
  const { texto, completada } = req.body;
  try {
    const updates = { updated_at: new Date().toISOString() };
    if (texto      !== undefined) updates.texto      = texto;
    if (completada !== undefined) updates.completada = completada;
    const { data, error } = await supabase
      .from('prioridades_usuario')
      .update(updates)
      .eq('id', id)
      .eq('id_usuario', req.user.id)
      .select();
    if (error) throw error;
    return res.json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/priorities/:id — eliminar prioridad
const deletePriority = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('prioridades_usuario')
      .delete()
      .eq('id', id)
      .eq('id_usuario', req.user.id);
    if (error) throw error;
    return res.json({ message: 'Prioridad eliminada' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getPriorities, createPriority, updatePriority, deletePriority };
