// File: src/app/api/serve-file/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseFilePath } from "@/utils/parseFilePath";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let filePath = searchParams.get("filePath");
    const bucket = searchParams.get("bucket") || "jobs";
    const download = searchParams.get("download") === "true";

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    // If a full URL was provided, convert it to a bucket-relative path for the chosen bucket
    if (filePath.startsWith("http")) {
      const parsed = parseFilePath(filePath, bucket);
      if (!parsed) {
        return NextResponse.json({ error: "Invalid file path URL" }, { status: 400 });
      }
      filePath = parsed;
    }

    const { data, error } = await supabase.storage.from(bucket).download(filePath);
    if (error) {
      console.error("Supabase file download error:", error);
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const fileName = filePath.split("/").pop() || "file";
    const ext = (fileName.split(".").pop() || "").toLowerCase();

    let contentType = "application/octet-stream";
    switch (ext) {
      case "png": contentType = "image/png"; break;
      case "jpg":
      case "jpeg": contentType = "image/jpeg"; break;
      case "pdf": contentType = "application/pdf"; break;
      case "doc": contentType = "application/msword"; break;
      case "docx": contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; break;
      default: contentType = "application/octet-stream";
    }

    const headers = {
      "Content-Type": contentType,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    };

    return new Response(data, { status: 200, headers });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
