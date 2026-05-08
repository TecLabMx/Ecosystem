// src/controllers/cafeteriaController.js
// REQ-02: Controlador del módulo cafetería
const supabase = require("../config/supabase");

// ── GET /api/cafeteria/menu ────────────────────────────────────
// Público — devuelve el menú activo del día (si existe)
const getMenu = async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from("cafeteria_menu")
      .select(
        "id, fecha, imagen_url, imagen_base64, tipo_archivo, publicado_por, created_at",
      )
      .eq("fecha", hoy)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return res.json({ menu: data || null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── POST /api/cafeteria/menu ───────────────────────────────────
// Protegido: admin / cafeteria — sube nuevo menú del día
const uploadMenu = async (req, res) => {
  try {
    const { fecha, imagen_base64, tipo_archivo } = req.body;

    if (!fecha || !imagen_base64) {
      return res
        .status(400)
        .json({ error: "fecha e imagen_base64 son requeridos" });
    }

    // Tamaño máximo: 5 MB en base64 ≈ ~6.8 MB de string
    const MAX_B64 = 7 * 1024 * 1024;
    if (imagen_base64.length > MAX_B64) {
      return res
        .status(413)
        .json({ error: "La imagen supera el límite de 5 MB" });
    }

    // Upsert: si ya existe menú para esa fecha, lo reemplaza
    const { data, error } = await supabase
      .from("cafeteria_menu")
      .upsert(
        {
          fecha,
          imagen_base64,
          tipo_archivo: tipo_archivo || "image/jpeg",
          publicado_por: req.user.id,
        },
        { onConflict: "fecha" },
      )
      .select()
      .single();

    if (error) throw error;
    return res
      .status(201)
      .json({ message: "Menú publicado correctamente", menu: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/cafeteria/menu ─────────────────────────────────
// Protegido: admin / cafeteria — borra el menú del día actual
const deleteMenu = async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10);

    const { error } = await supabase
      .from("cafeteria_menu")
      .delete()
      .eq("fecha", hoy);

    if (error) throw error;
    return res.json({ message: "Menú eliminado correctamente" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getMenu, uploadMenu, deleteMenu };
