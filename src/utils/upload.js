import { supabase } from '../config/supabase';

const uploadFile = async (file) => {
  // Create a unique file name (optional, but recommended)
  const fileName = `${Date.now()}_${file.name}`;
  // Upload to the 'uploads' bucket (change bucket name if needed)
  const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
  if (error) throw error;
  // Get the public URL
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return urlData.publicUrl;
};

export default uploadFile;