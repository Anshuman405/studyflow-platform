import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Bucket } from "encore.dev/storage/objects";

// Create a bucket for file uploads
const filesBucket = new Bucket("study-files", {
  public: false,
  versioned: false,
});

interface GenerateUploadUrlRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface GenerateUploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  downloadUrl: string;
}

interface GetDownloadUrlRequest {
  fileKey: string;
}

interface GetDownloadUrlResponse {
  downloadUrl: string;
}

// Generates a signed upload URL for file uploads.
export const generateUploadUrl = api<GenerateUploadUrlRequest, GenerateUploadUrlResponse>(
  { auth: true, expose: true, method: "POST", path: "/upload/generate-url" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.fileSize > maxSize) {
      throw APIError.invalidArgument("File size exceeds 50MB limit");
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
    ];
    
    if (!allowedTypes.includes(req.mimeType)) {
      throw APIError.invalidArgument("File type not supported");
    }
    
    // Generate unique file key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExtension = req.fileName.split('.').pop();
    const fileKey = `${auth.userID}/${timestamp}-${randomId}.${fileExtension}`;
    
    try {
      // Generate signed upload URL
      const { url: uploadUrl } = await filesBucket.signedUploadUrl(fileKey, {
        ttl: 3600, // 1 hour
      });
      
      // Generate signed download URL
      const { url: downloadUrl } = await filesBucket.signedDownloadUrl(fileKey, {
        ttl: 7 * 24 * 3600, // 7 days
      });
      
      return {
        uploadUrl,
        fileKey,
        downloadUrl,
      };
    } catch (error) {
      console.error("Failed to generate upload URL:", error);
      throw APIError.internal("Failed to generate upload URL");
    }
  }
);

// Gets a download URL for an existing file.
export const getDownloadUrl = api<GetDownloadUrlRequest, GetDownloadUrlResponse>(
  { auth: true, expose: true, method: "POST", path: "/upload/download-url" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Verify the file belongs to the user
    if (!req.fileKey.startsWith(auth.userID + '/')) {
      throw APIError.permissionDenied("Access denied to this file");
    }
    
    try {
      // Check if file exists
      const exists = await filesBucket.exists(req.fileKey);
      if (!exists) {
        throw APIError.notFound("File not found");
      }
      
      // Generate signed download URL
      const { url: downloadUrl } = await filesBucket.signedDownloadUrl(req.fileKey, {
        ttl: 24 * 3600, // 24 hours
      });
      
      return {
        downloadUrl,
      };
    } catch (error: any) {
      if (error.code === 'not_found') {
        throw APIError.notFound("File not found");
      }
      console.error("Failed to generate download URL:", error);
      throw APIError.internal("Failed to generate download URL");
    }
  }
);

// Deletes a file from storage.
export const deleteFile = api<GetDownloadUrlRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/upload/files" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Verify the file belongs to the user
    if (!req.fileKey.startsWith(auth.userID + '/')) {
      throw APIError.permissionDenied("Access denied to this file");
    }
    
    try {
      await filesBucket.remove(req.fileKey);
    } catch (error: any) {
      if (error.code === 'not_found') {
        throw APIError.notFound("File not found");
      }
      console.error("Failed to delete file:", error);
      throw APIError.internal("Failed to delete file");
    }
  }
);
