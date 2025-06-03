// src/app/api/upload-image/route.js
import { promises as fs } from 'fs'; // Node.js File System module
import path from 'path'; // Node.js Path module
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

// You'll need to install 'uuid' if you don't have it:
// npm install uuid
// or
// yarn add uuid

// Define the directory where uploaded files will be stored
// This creates a 'public/uploads' folder relative to your project root.
// In production, consider cloud storage like AWS S3, Cloudinary, Vercel Blob.
const UPLOAD_DIRECTORY = path.join(process.cwd(), 'public', 'uploads');

// Ensure the upload directory exists
// This runs once when the API route is loaded.
// For robust production apps, handle this in a build step or dedicated setup.
try {
  fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
} catch (error) {
  console.error('Failed to create upload directory:', error);
  // Depending on your error handling, you might want to exit or throw.
}


export async function POST(request) {
  try {
    // Parse the incoming request as FormData
    const formData = await request.formData();

    // Get the file from the FormData. 'image' should match the name attribute
    // of your file input or the key used when appending to FormData on the client.
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ message: 'No image file provided.' }), { status: 400 });
    }

    // Basic validation: Check if 'file' is actually a File object
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ message: 'Invalid file upload.' }), { status: 400 });
    }

    // Generate a unique filename to prevent collisions and improve security
    const fileExtension = path.extname(file.name || ''); // Use original extension
    // const uniqueFileName = `<span class="math-inline">\{uuidv4\(\)\}</span>{fileExtension}`;
    // AFTER (Correct):
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIRECTORY, uniqueFileName);

    // Convert the File object to a Node.js Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Write the buffer to the file system
    await fs.writeFile(filePath, buffer);

    // Construct the URL that the client can use to access the image
    // Assuming 'public' directory is served statically by Next.js
    const imageUrl = `/uploads/${uniqueFileName}`;

    return new Response(JSON.stringify({
      message: 'Image uploaded successfully!',
      url: imageUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error handling image upload:', error);
    return new Response(JSON.stringify({ message: 'Failed to upload image.', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Optional: If you need to disable Next.js's body parser for this route
// However, with `request.formData()`, Next.js automatically handles it.
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };