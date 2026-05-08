const supabase = require("../config/supabase");

const User = {
  create: async (userData) => {
    const {
      nombre,
      email,
      password,
      rol,
      numero_control,
      carrera,
      semestre,
      telefono,
      direccion,
      ciudad,
    } = userData;

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nombre,
          email,
          password, // Se asume que ya viene hasheada del controlador
          rol: rol || "estudiante",
          numero_control: numero_control || null,
          carrera: carrera || null,
          semestre: semestre || null,
          telefono: telefono || null,
          direccion: direccion || null,
          ciudad: ciudad || null,
        },
      ])
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error("No se pudo crear el usuario");
    }

    return data[0];
  },

  findByEmail: async (email) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select(
        "id, nombre, email, rol, numero_control, carrera, semestre, telefono, telefono_emergencia, direccion, ciudad",
      )
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  // REQ-03: Contador real desde la BD
  count: async () => {
    const { data, error } = await supabase.rpc("count_usuarios");
    if (error) throw error;
    return Number(data);
  },

  updateProfile: async (id, profileData) => {
    const { data, error } = await supabase
      .from("usuarios")
      .update(profileData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },
};

module.exports = User;
