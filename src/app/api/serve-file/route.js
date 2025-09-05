// // File: src/app/api/serve-file/route.js
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";
// import { parseFilePath } from "@/utils/parseFilePath";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// export const dynamic = 'force-dynamic';

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const fileUrl = searchParams.get('filePath');

//     if (!fileUrl) {
//       return NextResponse.json({ error: "File path is required" }, { status: 400 });
//     }

//     const filePath = parseFilePath(fileUrl, "jobs");
//     if (!filePath) {
//       return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
//     }

//     const { data, error } = await supabase.storage.from('jobs').download(filePath);

//     if (error) {
//       console.error("Supabase file download error:", error);
//       return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
//     }

//     // Determine the Content-Type based on the file extension
//     const fileExtension = filePath.split('.').pop().toLowerCase();
//     let contentType = 'application/octet-stream';
//     switch (fileExtension) {
//       case 'png':
//         contentType = 'image/png';
//         break;
//       case 'jpg':
//       case 'jpeg':
//         contentType = 'image/jpeg';
//         break;
//       case 'pdf':
//         contentType = 'application/pdf';
//         break;
//       case 'doc':
//       case 'docx':
//         contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//         break;
//       // Add more cases for other file types as needed
//       default:
//         contentType = 'application/octet-stream';
//         break;
//     }

//     return new Response(data, {
//       status: 200,
//       headers: {
//         'Content-Type': contentType,
//         // Optionally, you can add a content-disposition header to suggest a filename
//         // 'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
//       },
//     });

//   } catch (error) {
//     console.error("Error serving file:", error);
//     return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
//   }
// }


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
    const fileUrl = searchParams.get('filePath');
    const download = searchParams.get('download') === 'true'; // Check for the download query parameter

    if (!fileUrl) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    const filePath = parseFilePath(fileUrl, "jobs");
    if (!filePath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const { data, error } = await supabase.storage.from('jobs').download(filePath);

    if (error) {
      console.error("Supabase file download error:", error);
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const fileExtension = filePath.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'doc':
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        contentType = 'application/octet-stream';
        break;
    }

    const fileName = filePath.split('/').pop();

    const headers = {
      'Content-Type': contentType,
    };
    
    // Set Content-Disposition header based on the 'download' parameter
    if (download) {
        headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
    } else {
        headers['Content-Disposition'] = `inline; filename="${fileName}"`;
    }

    return new Response(data, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}