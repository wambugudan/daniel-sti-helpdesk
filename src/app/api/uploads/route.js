// File: src/app/api/upload/route.js

import { createClient } from "@supabase/supabase-js";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    const file = files.file[0];
    const bucket = fields.bucket ? fields.bucket[0] : null;

    // Security check: ensure the bucket is one of the allowed names
    const allowedBuckets = ['profiles', 'jobs', 'submissions'];
    if (!bucket || !allowedBuckets.includes(bucket)) {
      return res.status(400).json({ error: 'Invalid or missing bucket name.' });
    }

    const filePath = file.filepath;
    const fileName = `${Date.now()}-${file.originalFilename}`;

    try {
      const fileContent = fs.readFileSync(filePath);

      // Dynamically select the bucket
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileContent);

      if (error) throw error;

      // Get the public URL for the file
      const { data: publicURL } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return res.status(200).json({ fileURL: publicURL.publicUrl });
    } catch (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ error: "Failed to upload file to storage" });
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });
}