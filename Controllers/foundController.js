import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import supabase from "../config/supabaseClient.js";

// Get all found items
export const getAllFound = async (req, res) => {
  const { data, error, count } = await supabase
    .from("found")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    totalItems: count || data.length,
    items: data,
  });
};

// Get specific item
export const getFoundById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("found")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

// Add new found item
const storage = multer.memoryStorage();
export const upload = multer({ storage });
export const addFound = async (req, res) => {
  try {
    const { name, description, location, contact, date } = req.body;
    const file = req.file;
    let imageUrl = null;
    const itemDate = date || new Date().toISOString();

    // 1) Upload image to Supabase Storage if file is provided
    if (file) {
      const fileName = `${uuidv4()}-${file.originalname}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(`found/${fileName}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      // 2)  Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(`found/${fileName}`);

      imageUrl = publicUrlData.publicUrl;
    }

    // 3) Insert new found item into the "found" table
    const { data, error } = await supabase
      .from("found")
      .insert([
        {
          name,
          description,
          location,
          contact,
          date: itemDate,
          imageURL: imageUrl,
        },
      ])
      .select();

    if (error) throw error;

    res.json({
      message: "Found item added successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete specific object
export const deleteFound = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("found").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Found item deleted successfully" });
};
