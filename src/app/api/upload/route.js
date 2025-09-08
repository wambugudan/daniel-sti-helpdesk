// File: src/app/api/upload/route.js

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the Supabase Service Role Key for writing to private buckets
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a single Supabase client for all API calls using the service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request) {
  try {
    // Get the form data from the incoming request
    const formData = await request.formData();
    // Extract the file and bucket name from the form data
    const file = formData.get("file");
    const bucket = formData.get("bucket");

    // Check if the file or bucket name is missing
    if (!file || !bucket) {
      return NextResponse.json({ error: "No file or bucket specified" }, { status: 400 });
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique file name to avoid collisions
    const fileName = `${Date.now()}-${file.name}`;

    // Upload the file to the specified bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Get the public URL for the newly uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Note: For private buckets like 'jobs' and 'submissions', this public URL will not work.
    // You will need to create a separate API endpoint to generate a temporary, signed URL for retrieval.
    const fileURL = publicUrlData.publicUrl;

    // return NextResponse.json({ fileURL, fileName }, { status: 200 });
    return NextResponse.json(
      { fileURL, fileName, filePath: fileName, bucket },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error.message },
      { status: 500 }
    );
  }
}