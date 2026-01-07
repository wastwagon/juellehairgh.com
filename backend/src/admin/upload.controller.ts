import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import * as fs from "fs";
import * as path from "path";
import { diskStorage } from "multer";
import { extname } from "path";
import type { Express } from "express";

// Use absolute path or relative to backend directory
// In Docker, we need to use the mounted volume path
const getMediaDir = () => {
  const backendDir = process.cwd(); // /app in Docker = ./backend on host

  // Try relative path from backend to frontend (most common case)
  const relativeFrontendPath = path.join(
    backendDir,
    "..",
    "frontend",
    "public",
    "media",
  );
  const frontendExists = fs.existsSync(
    path.join(backendDir, "..", "frontend", "public"),
  );

  if (frontendExists) {
    // Ensure the directory structure exists
    const swatchesDir = path.join(relativeFrontendPath, "swatches");
    if (!fs.existsSync(swatchesDir)) {
      fs.mkdirSync(swatchesDir, { recursive: true });
    }
    const absPath = path.resolve(relativeFrontendPath);
    console.log(`[Upload] Media directory: ${absPath}`);
    console.log(`[Upload] Swatches directory: ${path.resolve(swatchesDir)}`);
    return absPath;
  }

  // Fallback: try from project root (for non-Docker environments)
  const rootPath = path.join(backendDir, "..", "frontend", "public", "media");
  const rootFrontendExists = fs.existsSync(
    path.join(backendDir, "..", "frontend", "public"),
  );

  if (rootFrontendExists) {
    const swatchesDir = path.join(rootPath, "swatches");
    if (!fs.existsSync(swatchesDir)) {
      fs.mkdirSync(swatchesDir, { recursive: true });
    }
    const absPath = path.resolve(rootPath);
    console.log(`[Upload] Media directory (fallback): ${absPath}`);
    return absPath;
  }

  // Last resort: create in backend/uploads
  const uploadsPath = path.join(backendDir, "uploads", "media");
  const swatchesDir = path.join(uploadsPath, "swatches");
  if (!fs.existsSync(swatchesDir)) {
    fs.mkdirSync(swatchesDir, { recursive: true });
  }
  const absPath = path.resolve(uploadsPath);
  console.log(`[Upload] Media directory (last resort): ${absPath}`);
  return absPath;
};

const MEDIA_DIR = getMediaDir();

// Ensure media directories exist
const ensureMediaDirs = () => {
  const dirs = [
    path.join(MEDIA_DIR, "swatches"),
    path.join(MEDIA_DIR, "products"),
    path.join(MEDIA_DIR, "categories"),
    path.join(MEDIA_DIR, "brands"),
    path.join(MEDIA_DIR, "collections"), // Collection images
    path.join(MEDIA_DIR, "banners"), // Banner images
    path.join(MEDIA_DIR, "library"), // General media library
    path.join(MEDIA_DIR, "profiles"), // User profile pictures
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureMediaDirs();

@Controller("admin/upload")
export class UploadController {
  @Post("swatch")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const swatchDir = path.join(MEDIA_DIR, "swatches");
          if (!fs.existsSync(swatchDir)) {
            fs.mkdirSync(swatchDir, { recursive: true });
          }
          cb(null, swatchDir);
        },
        filename: (req, file, cb) => {
          // Generate unique filename: timestamp-color-name.extension
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const name = file.originalname
            .replace(ext, "")
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase();
          cb(null, `${uniqueSuffix}-${name}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException("Only image files are allowed!"),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadSwatch(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const filePath = path.join(MEDIA_DIR, "swatches", file.filename);
    const fileUrl = `/media/swatches/${file.filename}`;

    // Wait a bit for file system sync (especially important for Docker volumes)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify file was saved correctly
    if (!fs.existsSync(filePath)) {
      console.error(`[Upload] File not found at: ${filePath}`);
      console.error(`[Upload] MEDIA_DIR: ${MEDIA_DIR}`);
      console.error(`[Upload] Filename: ${file.filename}`);
      throw new BadRequestException(
        `File was not saved correctly. Expected at: ${filePath}`,
      );
    }

    // Always copy to frontend/public/media/swatches so Next.js can serve it
    const frontendMediaPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "media",
      "swatches",
    );
    const frontendPublicPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
    );

    if (fs.existsSync(frontendPublicPath)) {
      try {
        if (!fs.existsSync(frontendMediaPath)) {
          fs.mkdirSync(frontendMediaPath, { recursive: true });
          console.log(
            `[Upload] Created frontend swatches directory: ${path.resolve(frontendMediaPath)}`,
          );
        }
        const frontendFilePath = path.join(frontendMediaPath, file.filename);
        // Copy file to frontend directory so Next.js can serve it
        fs.copyFileSync(filePath, frontendFilePath);
        console.log(
          `[Upload] Copied file to frontend directory: ${path.resolve(frontendFilePath)}`,
        );
        console.log(`[Upload] File also exists at: ${path.resolve(filePath)}`);
      } catch (error) {
        console.error(
          `[Upload] Could not copy file to frontend directory: ${error}`,
        );
        console.error(
          `[Upload] Frontend path: ${path.resolve(frontendMediaPath)}`,
        );
        console.error(`[Upload] Source path: ${path.resolve(filePath)}`);
      }
    } else {
      console.warn(
        `[Upload] Frontend public directory not found at: ${path.resolve(frontendPublicPath)}`,
      );
    }

    // Verify file is readable
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      const stats = fs.statSync(filePath);
      console.log(
        `[Upload] File saved successfully: ${filePath} (${stats.size} bytes)`,
      );
    } catch (error) {
      console.warn(
        `[Upload] File exists but may not be readable yet: ${filePath}`,
        error,
      );
      // Still return success, file might be syncing
    }

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: filePath, // Include path for debugging (remove in production if needed)
    };
  }

  @Post("product")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const productDir = path.join(MEDIA_DIR, "products");
          if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
          }
          cb(null, productDir);
        },
        filename: (req, file, cb) => {
          // Generate unique filename: timestamp-product-name.extension
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const name = file.originalname
            .replace(ext, "")
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase();
          cb(null, `${uniqueSuffix}-${name}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB for product images
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException("Only image files are allowed!"),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const filePath = path.join(MEDIA_DIR, "products", file.filename);
    const fileUrl = `/media/products/${file.filename}`;

    // Wait a bit for file system sync (especially important for Docker volumes)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify file was saved correctly
    if (!fs.existsSync(filePath)) {
      console.error(`[Upload] File not found at: ${filePath}`);
      throw new BadRequestException(
        `File was not saved correctly. Expected at: ${filePath}`,
      );
    }

    // Always copy to frontend/public/media/products so Next.js can serve it
    const frontendMediaPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "media",
      "products",
    );
    const frontendPublicPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
    );

    if (fs.existsSync(frontendPublicPath)) {
      try {
        if (!fs.existsSync(frontendMediaPath)) {
          fs.mkdirSync(frontendMediaPath, { recursive: true });
          console.log(
            `[Upload] Created frontend products directory: ${path.resolve(frontendMediaPath)}`,
          );
        }
        const frontendFilePath = path.join(frontendMediaPath, file.filename);
        // Copy file to frontend directory so Next.js can serve it
        fs.copyFileSync(filePath, frontendFilePath);
        console.log(
          `[Upload] Copied product image to frontend directory: ${path.resolve(frontendFilePath)}`,
        );
      } catch (error) {
        console.error(
          `[Upload] Could not copy file to frontend directory: ${error}`,
        );
      }
    }

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // Serve uploaded product images (fallback if Next.js doesn't serve them)
  @Get("media/products/:filename")
  async getProductImage(
    @Param("filename") filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(MEDIA_DIR, "products", filename);

    // Security: prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      throw new BadRequestException("Invalid filename");
    }

    // Try multiple possible locations
    let actualFilePath = filePath;
    const altPaths = [
      path.join(
        process.cwd(),
        "..",
        "frontend",
        "public",
        "media",
        "products",
        filename,
      ),
      path.join(process.cwd(), "uploads", "media", "products", filename),
      filePath,
    ];

    for (const altPath of altPaths) {
      const resolvedPath = path.resolve(altPath);
      if (fs.existsSync(resolvedPath)) {
        actualFilePath = resolvedPath;
        break;
      }
    }

    if (!fs.existsSync(actualFilePath)) {
      throw new NotFoundException(`Image not found: ${filename}`);
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    const contentType = contentTypeMap[ext] || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    return res.sendFile(actualFilePath);
  }

  // Serve uploaded images (fallback if Next.js doesn't serve them)
  // This endpoint is public (no auth required) for images to be accessible
  @Get("media/swatches/:filename")
  async getSwatchImage(
    @Param("filename") filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(MEDIA_DIR, "swatches", filename);

    // Security: prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      throw new BadRequestException("Invalid filename");
    }

    // Try multiple possible locations - check frontend first (preferred), then backend uploads
    let actualFilePath = filePath;
    const altPaths = [
      path.join(
        process.cwd(),
        "..",
        "frontend",
        "public",
        "media",
        "swatches",
        filename,
      ), // Preferred: frontend public
      path.join(process.cwd(), "uploads", "media", "swatches", filename), // Fallback: backend uploads
      filePath, // Original MEDIA_DIR location
    ];

    // Check all paths and use the first one that exists
    for (const altPath of altPaths) {
      const resolvedPath = path.resolve(altPath);
      if (fs.existsSync(resolvedPath)) {
        actualFilePath = resolvedPath;
        console.log(`[Get Image] Found file at: ${actualFilePath}`);
        break;
      }
    }

    if (!fs.existsSync(actualFilePath)) {
      console.error(`[Get Image] File not found in any location: ${filename}`);
      console.error(`[Get Image] MEDIA_DIR: ${MEDIA_DIR}`);
      console.error(
        `[Get Image] Checked paths:`,
        altPaths.map((p) => `${path.resolve(p)} (exists: ${fs.existsSync(p)})`),
      );
      throw new NotFoundException(`Image not found: ${filename}`);
    }

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    const contentType = contentTypeMap[ext] || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    return res.sendFile(actualFilePath);
  }

  // Media Library Endpoints (WordPress-style)

  // List all media files
  @Get("media")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async listMedia(
    @Query("search") search?: string,
    @Query("type") type?: string, // 'image', 'all'
    @Query("category") category?: string, // Filter by category: 'swatches', 'products', etc.
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const mediaFiles: any[] = [];
    const pageNum = parseInt(page || "1");
    const limitNum = parseInt(limit || "50");
    const skip = (pageNum - 1) * limitNum;

    // Scan all media directories (filter by category if specified)
    const allDirectories = [
      { path: path.join(MEDIA_DIR, "library"), category: "library" },
      { path: path.join(MEDIA_DIR, "products"), category: "products" },
      { path: path.join(MEDIA_DIR, "swatches"), category: "swatches" },
      { path: path.join(MEDIA_DIR, "categories"), category: "categories" },
      { path: path.join(MEDIA_DIR, "brands"), category: "brands" },
      { path: path.join(MEDIA_DIR, "collections"), category: "collections" },
      { path: path.join(MEDIA_DIR, "banners"), category: "banners" },
    ];

    // Filter directories by category if specified
    const directories = category
      ? allDirectories.filter((dir) => dir.category === category)
      : allDirectories;

    for (const dir of directories) {
      if (!fs.existsSync(dir.path)) continue;

      const files = fs.readdirSync(dir.path);
      for (const file of files) {
        const filePath = path.join(dir.path, file);
        const stats = fs.statSync(filePath);

        // Skip directories
        if (stats.isDirectory()) continue;

        // Filter by type if specified
        if (type === "image") {
          const ext = path.extname(file).toLowerCase();
          if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
            continue;
          }
        }

        // Filter by search term
        if (search) {
          const searchLower = search.toLowerCase();
          if (!file.toLowerCase().includes(searchLower)) {
            continue;
          }
        }

        const ext = path.extname(file).toLowerCase();
        const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(
          ext,
        );
        const url = `/media/${dir.category}/${file}`;

        mediaFiles.push({
          id: `${dir.category}-${file}`,
          filename: file,
          originalName: file,
          url,
          path: filePath,
          category: dir.category,
          size: stats.size,
          type: isImage ? "image" : "file",
          mimeType: isImage
            ? `image/${ext.slice(1) === "jpg" ? "jpeg" : ext.slice(1)}`
            : "application/octet-stream",
          uploadedAt: stats.birthtime,
          modifiedAt: stats.mtime,
        });
      }
    }

    // Sort by upload date (newest first)
    mediaFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    // Paginate
    const total = mediaFiles.length;
    const paginatedFiles = mediaFiles.slice(skip, skip + limitNum);

    return {
      files: paginatedFiles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  // Upload to media library
  @Post("media")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const libraryDir = path.join(MEDIA_DIR, "library");
          if (!fs.existsSync(libraryDir)) {
            fs.mkdirSync(libraryDir, { recursive: true });
          }
          cb(null, libraryDir);
        },
        filename: (req, file, cb) => {
          // Generate unique filename: timestamp-original-name.extension
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const name = file.originalname
            .replace(ext, "")
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase();
          cb(null, `${uniqueSuffix}-${name}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const filePath = path.join(MEDIA_DIR, "library", file.filename);
    const fileUrl = `/media/library/${file.filename}`;

    // Wait for file system sync
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify file was saved
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(
        `File was not saved correctly. Expected at: ${filePath}`,
      );
    }

    // Copy to frontend/public/media/library
    const frontendMediaPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "media",
      "library",
    );
    const frontendPublicPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
    );

    if (fs.existsSync(frontendPublicPath)) {
      try {
        if (!fs.existsSync(frontendMediaPath)) {
          fs.mkdirSync(frontendMediaPath, { recursive: true });
        }
        const frontendFilePath = path.join(frontendMediaPath, file.filename);
        fs.copyFileSync(filePath, frontendFilePath);
      } catch (error) {
        console.error(
          `[Upload] Could not copy file to frontend directory: ${error}`,
        );
      }
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(file.filename).toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);

    return {
      success: true,
      id: `library-${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      url: fileUrl,
      size: file.size,
      type: isImage ? "image" : "file",
      mimeType: file.mimetype,
      uploadedAt: stats.birthtime,
    };
  }

  // Upload collection image
  @Post("collection")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const collectionDir = path.join(MEDIA_DIR, "collections");
          if (!fs.existsSync(collectionDir)) {
            fs.mkdirSync(collectionDir, { recursive: true });
          }
          cb(null, collectionDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const name = file.originalname
            .replace(ext, "")
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase();
          cb(null, `${uniqueSuffix}-${name}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException("Only image files are allowed!"),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadCollectionImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const filePath = path.join(MEDIA_DIR, "collections", file.filename);
    const fileUrl = `/media/collections/${file.filename}`;

    // Wait for file system sync
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify file was saved
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(
        `File was not saved correctly. Expected at: ${filePath}`,
      );
    }

    // Copy to frontend/public/media/collections
    const frontendMediaPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "media",
      "collections",
    );
    const frontendPublicPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
    );

    if (fs.existsSync(frontendPublicPath)) {
      try {
        if (!fs.existsSync(frontendMediaPath)) {
          fs.mkdirSync(frontendMediaPath, { recursive: true });
        }
        const frontendFilePath = path.join(frontendMediaPath, file.filename);
        fs.copyFileSync(filePath, frontendFilePath);
      } catch (error) {
        console.error(
          `[Upload] Could not copy file to frontend directory: ${error}`,
        );
      }
    }

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // Upload banner image
  @Post("banner")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const bannerDir = path.join(MEDIA_DIR, "banners");
          if (!fs.existsSync(bannerDir)) {
            fs.mkdirSync(bannerDir, { recursive: true });
          }
          cb(null, bannerDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const name = file.originalname
            .replace(ext, "")
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase();
          cb(null, `${uniqueSuffix}-${name}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException("Only image files are allowed!"),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadBannerImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const filePath = path.join(MEDIA_DIR, "banners", file.filename);
    const fileUrl = `/media/banners/${file.filename}`;

    // Wait for file system sync
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify file was saved
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(
        `File was not saved correctly. Expected at: ${filePath}`,
      );
    }

    // Copy to frontend/public/media/banners
    const frontendMediaPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "media",
      "banners",
    );
    const frontendPublicPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
    );

    if (fs.existsSync(frontendPublicPath)) {
      try {
        if (!fs.existsSync(frontendMediaPath)) {
          fs.mkdirSync(frontendMediaPath, { recursive: true });
        }
        const frontendFilePath = path.join(frontendMediaPath, file.filename);
        fs.copyFileSync(filePath, frontendFilePath);
      } catch (error) {
        console.error(
          `[Upload] Could not copy file to frontend directory: ${error}`,
        );
      }
    }

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // Upload profile picture (user-facing)
  @Post("profile-picture")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const profileDir = path.join(MEDIA_DIR, "profiles");
          if (!fs.existsSync(profileDir)) {
            fs.mkdirSync(profileDir, { recursive: true });
          }
          cb(null, profileDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const name = file.originalname
            .replace(ext, "")
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase();
          cb(null, `${uniqueSuffix}-${name}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException("Only image files are allowed!"),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const filePath = path.join(MEDIA_DIR, "profiles", file.filename);
    const fileUrl = `/media/profiles/${file.filename}`;

    // Wait for file system sync
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify file was saved
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(
        `File was not saved correctly. Expected at: ${filePath}`,
      );
    }

    // Copy to frontend/public/media/profiles
    const frontendMediaPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "media",
      "profiles",
    );
    const frontendPublicPath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
    );

    if (fs.existsSync(frontendPublicPath)) {
      try {
        if (!fs.existsSync(frontendMediaPath)) {
          fs.mkdirSync(frontendMediaPath, { recursive: true });
        }
        const frontendFilePath = path.join(frontendMediaPath, file.filename);
        fs.copyFileSync(filePath, frontendFilePath);
      } catch (error) {
        console.error(
          `[Upload] Could not copy file to frontend directory: ${error}`,
        );
      }
    }

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
    };
  }

  // Delete media file
  @Delete("media/:category/:filename")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteMedia(
    @Param("category") category: string,
    @Param("filename") filename: string,
  ) {
    // Security: prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\") ||
      category.includes("..") ||
      category.includes("/") ||
      category.includes("\\")
    ) {
      throw new BadRequestException("Invalid filename or category");
    }

    // Validate category
    const validCategories = [
      "library",
      "products",
      "swatches",
      "categories",
      "brands",
      "collections",
    ];
    if (!validCategories.includes(category)) {
      throw new BadRequestException("Invalid category");
    }

    const filePath = path.join(MEDIA_DIR, category, filename);

    // Try multiple possible locations
    const altPaths = [
      path.join(
        process.cwd(),
        "..",
        "frontend",
        "public",
        "media",
        category,
        filename,
      ),
      path.join(process.cwd(), "uploads", "media", category, filename),
      filePath,
    ];

    let deleted = false;
    for (const altPath of altPaths) {
      const resolvedPath = path.resolve(altPath);
      if (fs.existsSync(resolvedPath)) {
        try {
          fs.unlinkSync(resolvedPath);
          deleted = true;
        } catch (error) {
          console.error(
            `[Delete] Could not delete file at ${resolvedPath}:`,
            error,
          );
        }
      }
    }

    if (!deleted) {
      throw new NotFoundException(
        `Media file not found: ${category}/${filename}`,
      );
    }

    return {
      success: true,
      message: `Media file ${filename} deleted successfully`,
    };
  }

  // Serve media library files
  @Get("media/library/:filename")
  async getLibraryMedia(
    @Param("filename") filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(MEDIA_DIR, "library", filename);

    // Security: prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      throw new BadRequestException("Invalid filename");
    }

    // Try multiple possible locations
    let actualFilePath = filePath;
    const altPaths = [
      path.join(
        process.cwd(),
        "..",
        "frontend",
        "public",
        "media",
        "library",
        filename,
      ),
      path.join(process.cwd(), "uploads", "media", "library", filename),
      filePath,
    ];

    for (const altPath of altPaths) {
      const resolvedPath = path.resolve(altPath);
      if (fs.existsSync(resolvedPath)) {
        actualFilePath = resolvedPath;
        break;
      }
    }

    if (!fs.existsSync(actualFilePath)) {
      throw new NotFoundException(`Media file not found: ${filename}`);
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    return res.sendFile(actualFilePath);
  }

  // Generic endpoint to serve media from any category (categories, brands, etc.)
  @Get("media/:category/:filename")
  async getMediaByCategory(
    @Param("category") category: string,
    @Param("filename") filename: string,
    @Res() res: Response,
  ) {
    // Security: prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\") ||
      category.includes("..") ||
      category.includes("/") ||
      category.includes("\\")
    ) {
      throw new BadRequestException("Invalid filename or category");
    }

    // Validate category
    const validCategories = [
      "library",
      "products",
      "swatches",
      "categories",
      "brands",
      "collections",
    ];
    if (!validCategories.includes(category)) {
      throw new BadRequestException("Invalid category");
    }

    const filePath = path.join(MEDIA_DIR, category, filename);

    // Try multiple possible locations
    let actualFilePath = filePath;
    const altPaths = [
      path.join(
        process.cwd(),
        "..",
        "frontend",
        "public",
        "media",
        category,
        filename,
      ),
      path.join(process.cwd(), "uploads", "media", category, filename),
      filePath,
    ];

    for (const altPath of altPaths) {
      const resolvedPath = path.resolve(altPath);
      if (fs.existsSync(resolvedPath)) {
        actualFilePath = resolvedPath;
        break;
      }
    }

    if (!fs.existsSync(actualFilePath)) {
      throw new NotFoundException(
        `Media file not found: ${category}/${filename}`,
      );
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    return res.sendFile(actualFilePath);
  }
}
