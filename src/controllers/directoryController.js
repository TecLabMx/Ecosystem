const supabase = require('../config/supabase');

const getDirectory = async (req, res) => {
  try {
    const { data, error } = await supabase.from('directorio_docente').select('*').order('nombre', { ascending: true });
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getDirectory };
