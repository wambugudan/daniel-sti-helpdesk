// File: src/app/api/uploads/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
);

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const bucket = form.get("bucket");

    // ✅ Check file exists
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // ✅ Security: only allow certain buckets
    const allowedBuckets = ["profiles", "jobs", "submissions", "submission_messages"];
    if (!bucket || !allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Invalid or missing bucket name" }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;

    // ✅ Upload directly to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // ✅ Get public URL
    const { data: publicURL } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({ fileURL: publicURL.publicUrl });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
