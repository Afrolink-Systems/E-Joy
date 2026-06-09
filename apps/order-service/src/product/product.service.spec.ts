import { BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';

function buildService(overrides: Record<string, unknown> = {}) {
  const category = {
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue({
      id: 'cat_general',
      shopId: 'shop_1',
      name: 'General',
      iconKey: 'grid',
      color: '#E8C49E',
      sortOrder: 10,
      active: true,
    }),
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
    ...((overrides.category as Record<string, unknown>) ?? {}),
  };
  const product = {
    create: jest
      .fn()
      .mockImplementation(
        async ({ data }: { data: Record<string, unknown> }) => ({
          id: 'prod_1',
          shopId: data.shopId,
          name: data.name,
          categoryId: data.categoryId,
          categoryRef: {
            id: data.categoryId,
            shopId: data.shopId,
            name: 'Main',
            iconKey: 'soup',
            color: '#B45309',
            sortOrder: 10,
            active: true,
          },
          unitPrice: data.unitPrice,
          imageUrl: data.imageUrl ?? null,
          active: data.active,
          status: 'ACTIVE',
        }),
      ),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    ...((overrides.product as Record<string, unknown>) ?? {}),
  };
  const prisma = {
    category,
    product,
    shop: {
      findUnique: jest.fn().mockResolvedValue({ id: 'shop_1' }),
      ...((overrides.shop as Record<string, unknown>) ?? {}),
    },
  };
  return { service: new ProductService(prisma as never), prisma };
}

describe('ProductService categories', () => {
  it('creates a product with a shop-owned categoryId', async () => {
    const { service, prisma } = buildService({
      category: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'cat_main',
          shopId: 'shop_1',
          name: 'Main',
          iconKey: 'soup',
          color: '#B45309',
          sortOrder: 10,
          active: true,
        }),
      },
    });

    const product = await service.createProduct('shop_1', {
      name: 'Tibs',
      categoryId: 'cat_main',
      unitPrice: 1200,
      active: true,
    });

    expect(product.categoryId).toBe('cat_main');
    expect(product.category.name).toBe('Main');
    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          categoryId: 'cat_main',
        }),
        include: { categoryRef: true },
      }),
    );
  });

  it('rejects a categoryId from another shop or inactive category', async () => {
    const { service } = buildService({
      category: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    });

    await expect(
      service.createProduct('shop_1', {
        name: 'Shiro',
        categoryId: 'cat_other',
        unitPrice: 900,
        active: true,
      }),
    ).rejects.toThrow(
      new BadRequestException('categoryId is not valid for this shop'),
    );
  });

  it('requires categoryId when creating products', async () => {
    const { service } = buildService();

    await expect(
      service.createProduct('shop_1', {
        name: 'Mango juice',
        unitPrice: 500,
        active: true,
      } as never),
    ).rejects.toThrow(new BadRequestException('categoryId is required'));
  });
});
