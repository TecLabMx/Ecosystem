const supabase = require('../config/supabase');

const getServices = async (req, res) => {
  try {
    const { data, error } = await supabase.from('servicios_institucionales').select('*').order('nombre', { ascending: true });
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getServices };
