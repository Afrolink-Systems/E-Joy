import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UploadController } from './upload.controller';

function pngFile(): Express.Multer.File {
  return {
    buffer: Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]),
    mimetype: 'image/png',
    originalname: 'image.png',
  } as Express.Multer.File;
}

describe('UploadController', () => {
  const uploadService = {
    uploadImage: jest.fn().mockResolvedValue({ secure_url: 'https://cdn.test/image.png' }),
  };
  const rateLimit = {
    consume: jest.fn(),
    getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  };
  const appLogger = { warn: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLOUDINARY_UPLOAD_FOLDER = 'ejoy';
  });

  function controller() {
    return new UploadController(
      uploadService as never,
      rateLimit as never,
      appLogger as never,
    );
  }

  it('uploads merchant product images into the shop product folder', async () => {
    await expect(
      controller().uploadImage(
        pngFile(),
        { user: { id: 'u1', role: 'manager', shopId: 'shop-1' } },
        'product',
      ),
    ).resolves.toEqual({ url: 'https://cdn.test/image.png' });

    expect(uploadService.uploadImage).toHaveBeenCalledWith(
      expect.anything(),
      { folder: 'ejoy/shops/shop-1/products' },
    );
  });

  it('uploads merchant logos into the shop logo folder', async () => {
    await controller().uploadImage(
      pngFile(),
      { user: { id: 'u1', role: 'manager', shopId: 'shop-1' } },
      'shop-logo',
    );

    expect(uploadService.uploadImage).toHaveBeenCalledWith(
      expect.anything(),
      { folder: 'ejoy/shops/shop-1/logos' },
    );
  });

  it('uploads platform banners into the platform banner folder', async () => {
    await controller().uploadImage(
      pngFile(),
      { user: { id: 'p1', role: 'platform_admin' } },
      'platform-banner',
    );

    expect(uploadService.uploadImage).toHaveBeenCalledWith(
      expect.anything(),
      { folder: 'ejoy/platform/banners' },
    );
  });

  it('rejects unknown upload purposes', async () => {
    await expect(
      controller().uploadImage(
        pngFile(),
        { user: { id: 'u1', role: 'manager', shopId: 'shop-1' } },
        'avatar',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects platform banner uploads from merchant users', async () => {
    await expect(
      controller().uploadImage(
        pngFile(),
        { user: { id: 'u1', role: 'manager', shopId: 'shop-1' } },
        'platform-banner',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
