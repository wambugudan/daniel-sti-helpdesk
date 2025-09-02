// src/app/api/get-signed-url/route.js

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request) {
  try {
    const { filePath, bucketName } = await request.json();
    
    // Log the received filePath and bucketName for debugging
    console.log("Received request for filePath:", filePath, "in bucket:", bucketName);

    if (!filePath || !bucketName) {
      return NextResponse.json({ error: "File path and bucket name are required" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 5); // URL expires in 5 minutes

    if (error) {
      console.error("Supabase signed URL error:", error);
      return NextResponse.json({ error: "Failed to get signed URL" }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}