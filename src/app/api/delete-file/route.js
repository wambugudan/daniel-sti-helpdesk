// File: src/app/api/delete-file/route.js

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request) {
    try {
        const { filePath, bucketName } = await request.json();

        console.log(`Attempting to delete file: ${filePath} from bucket: ${bucketName}`);

        if (!filePath || !bucketName) {
            return NextResponse.json({ error: "File path and bucket name are required" }, { status: 400 });
        }

        const { data, error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            console.error("Supabase file removal error:", error);
            return NextResponse.json({ error: "Failed to remove file from storage" }, { status: 500 });
        }

        return NextResponse.json({ message: "File removed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}