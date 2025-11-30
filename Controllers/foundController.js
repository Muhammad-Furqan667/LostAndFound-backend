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
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ 
        error: "Request body is missing. Make sure you're sending data correctly." 
      });
    }

    const { name, description, location, contact, date, Category } = req.body;
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
    if (!name || !description || !location || !Category) {
      return res.status(400).json({ 
        error: "name, description, location, and Category are required fields" 
      });
    }

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
    } else {
      // If no file provided, get default image from category_defaults table
      const { data: defaultData, error: defaultError } = await supabase
        .from("category_defaults")
        .select("default_image")
        .eq("category", Category)
        .single();

      if (!defaultError && defaultData) {
        imageUrl = defaultData.default_image;
      }
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
          Category,
          date: itemDate,
          imageURL: imageUrl,
          added_by: addedBy, // Foreign key to users.reg_no
        },
      ])
      .select();

    if (error) throw error;

    res.json({
      message: "Found item added successfully",
      data,
    });
  } catch (error) {
    console.error("Error in addFound:", error);
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
