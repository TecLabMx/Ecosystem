const supabase = require('../config/supabase');

const getNotes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notas_rapidas')
      .select('*')
      .eq('id_usuario', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createNote = async (req, res) => {
  const { titulo, contenido, color, categoria, fijada } = req.body;
  if (!titulo) return res.status(400).json({ message: 'El título es requerido' });
  try {
    const { data, error } = await supabase
      .from('notas_rapidas')
      .insert([{
        titulo,
        contenido: contenido || null,
        color: color || 'amarilla',
        categoria: categoria || 'general',
        fijada: fijada || false,
        id_usuario: req.user.id
      }])
      .select();
    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateNote = async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido, color, categoria, fijada, archivada } = req.body;
  try {
    const updates = {};
    if (titulo !== undefined)    updates.titulo    = titulo;
    if (contenido !== undefined) updates.contenido = contenido;
    if (color !== undefined)     updates.color     = color;
    if (categoria !== undefined) updates.categoria = categoria;
    if (fijada !== undefined)    updates.fijada    = fijada;
    if (archivada !== undefined) updates.archivada = archivada;

    const { data, error } = await supabase
      .from('notas_rapidas')
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

const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('notas_rapidas')
      .delete()
      .eq('id', id)
      .eq('id_usuario', req.user.id);
    if (error) throw error;
    return res.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
