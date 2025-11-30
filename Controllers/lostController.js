import multer from "multer";
import supabase from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

// Get all lost items
export const getAllLost = async (req, res) => {
  const { data, error, count } = await supabase
    .from("lost")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    totalItems: count || data.length,
    items: data,
  });
};

// Get specific item
export const getLostById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("lost")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

// Add new lost item
const storage = multer.memoryStorage();
export const upload = multer({ storage });
export const addLost = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ 
        error: "Request body is missing. Make sure you're sending data correctly." 
      });
    }

    const { name, description, location, contact, date } = req.body;
    const file = req.file;
    let imageUrl = null;
    const itemDate = date || new Date().toISOString();

    // Get logged-in user's reg_no from auth middleware
    const addedBy = req.user?.reg_no;

    if (!addedBy) {
      return res.status(401).json({ 
        error: "User not authenticated. Please login first." 
      });
    }

    // Validate required fields
    if (!name || !description || !location) {
      return res.status(400).json({ 
        error: "name, description, and location are required fields" 
      });
    }

    // 3. If an image is uploaded, store it in Supabase Storage
    if (file) {
      const fileName = `${uuidv4()}-${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`lost/${fileName}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      // 4. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(`lost/${fileName}`);

      imageUrl = publicUrlData.publicUrl;
    }

    // 5. Insert record into database
    const { data, error } = await supabase.from("lost").insert([
      {
        name,
        description,
        location,
        contact,
        date: itemDate,
        imageURL: imageUrl,
        added_by: addedBy, // Foreign key to users.reg_no
      },
    ]);

    if (error) throw error;

    res.json({ message: "Lost item added successfully", data });
  } catch (error) {
    console.error("Error in addLost:", error);
    res.status(400).json({ error: error.message });
  }
};
// Delete a specific lost item by ID
export const deleteLost = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("lost").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Lost item deleted successfully" });
};
