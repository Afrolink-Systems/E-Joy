import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RateLimitService } from '../auth/rate-limit.service';
import { AppLoggerService } from '../ops/app-logger.service';
import { UploadService } from './upload.service';
import type { UploadPurpose } from './upload.service';

const imageUpload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

type UploadRequest = {
  user?: {
    role?: string;
    scope?: string[];
    id?: string;
    shopId?: string;
  };
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
};

const UPLOAD_PURPOSES = new Set<UploadPurpose>([
  'product',
  'shop-logo',
  'platform-banner',
]);

/**
 * Merchant-authenticated REST upload (CORS-enabled for admin-web).
 */
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly rateLimit: RateLimitService,
    private readonly appLogger: AppLoggerService,
  ) {}

  private assertCanUpload(req: UploadRequest) {
    const role = req.user?.role?.toLowerCase();
    const scopes = req.user?.scope ?? [];
    if (
      role === 'admin' ||
      role === 'platform_admin' ||
      role === 'manager' ||
      scopes.includes('staff:write')
    ) {
      return;
    }
    throw new ForbiddenException('You do not have permission to upload images');
  }

  private resolveUploadTarget(
    purposeRaw: string | undefined,
    req: UploadRequest,
  ): { purpose: UploadPurpose; folder: string } {
    const purpose = purposeRaw?.trim() as UploadPurpose | undefined;
    if (!purpose || !UPLOAD_PURPOSES.has(purpose)) {
      throw new BadRequestException(
        'purpose must be one of: product, shop-logo, platform-banner',
      );
    }

    const role = req.user?.role?.toLowerCase();
    const root = this.uploadRootFolder();
    if (purpose === 'platform-banner') {
      if (role !== 'platform_admin') {
        throw new ForbiddenException(
          'Only platform admins can upload platform banners',
        );
      }
      return { purpose, folder: `${root}/platform/banners` };
    }

    const shopId = req.user?.shopId?.trim();
    if (!shopId) {
      throw new ForbiddenException('Shop-bound uploads require a shop session');
    }
    return {
      purpose,
      folder:
        purpose === 'shop-logo'
          ? `${root}/shops/${this.safePathSegment(shopId)}/logos`
          : `${root}/shops/${this.safePathSegment(shopId)}/products`,
    };
  }

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(imageUpload)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: UploadRequest,
    @Body('purpose') purposeRaw?: string,
  ) {
    this.assertCanUpload(req);
    const target = this.resolveUploadTarget(purposeRaw, req);
    this.rateLimit.consume({
      key: `${this.rateLimit.getClientIp(req)}:${req.user?.id ?? 'unknown'}`,
      label: 'upload_image',
      limit: 20,
      windowMs: 60_000,
    });
    if (!file?.buffer?.length) {
      this.appLogger.warn('upload.rejected', {
        reason: 'missing_file',
        userId: req.user?.id,
      });
      throw new BadRequestException('file is required');
    }
    this.assertSafeImage(file);
    const response = await this.uploadService.uploadImage(file, {
      folder: target.folder,
    });
    return { url: response.secure_url };
  }

  private uploadRootFolder(): string {
    const configured = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim();
    const root = configured || 'ejoy';
    return root.replace(/^\/+|\/+$/g, '') || 'ejoy';
  }

  private safePathSegment(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '-');
  }

  private assertSafeImage(file: Express.Multer.File): void {
    const allowed = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]);
    if (!allowed.has(file.mimetype)) {
      this.appLogger.warn('upload.rejected', {
        reason: 'invalid_mime',
        mimetype: file.mimetype,
      });
      throw new BadRequestException(
        'Only JPEG, PNG, WEBP, or GIF images are allowed',
      );
    }
    const name = file.originalname.toLowerCase();
    if (!/\.(jpe?g|png|webp|gif)$/.test(name)) {
      this.appLogger.warn('upload.rejected', {
        reason: 'invalid_extension',
        originalname: file.originalname,
      });
      throw new BadRequestException('Image extension is not allowed');
    }
    const b = file.buffer;
    const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const isPng =
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    const isGif = b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46;
    const isWebp =
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50;
    if (!(isJpeg || isPng || isGif || isWebp)) {
      this.appLogger.warn('upload.rejected', {
        reason: 'signature_mismatch',
        mimetype: file.mimetype,
      });
      throw new BadRequestException(
        'Image content does not match an allowed format',
      );
    }
  }
}
