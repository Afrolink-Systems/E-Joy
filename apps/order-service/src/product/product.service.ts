import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
} from '../admin/admin.inputs';
import {
  CategoryModel,
  ProductModel,
  ProductStatusModel,
} from '../admin/admin.types';

/** Matches Prisma `ProductStatus` after migrate + `prisma generate`. */
const PS = { ACTIVE: 'ACTIVE', ARCHIVED: 'ARCHIVED' } as const;
const DEFAULT_CATEGORY_ICON = 'grid';
const DEFAULT_CATEGORY_COLOR = '#E8C49E';

type CategoryRow = {
  id: string;
  shopId: string;
  name: string;
  iconKey: string;
  color: string;
  sortOrder: number;
  active: boolean;
};

type ProductRow = {
  id: string;
  shopId: string;
  name: string;
  categoryId: string;
  categoryRef?: CategoryRow | null;
  unitPrice: number;
  imageUrl: string | null;
  active: boolean;
  status?: string;
};

type CategoryDelegate = {
  findMany(args: unknown): Promise<CategoryRow[]>;
  findFirst(args: unknown): Promise<CategoryRow | null>;
  count(args: unknown): Promise<number>;
  create(args: unknown): Promise<CategoryRow>;
  update(args: unknown): Promise<CategoryRow>;
};

type ProductDelegate = {
  findMany(args: unknown): Promise<ProductRow[]>;
  create(args: unknown): Promise<ProductRow>;
  updateMany(args: unknown): Promise<unknown>;
};

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private categoryDelegate(): CategoryDelegate {
    return (this.prisma as unknown as { category: CategoryDelegate }).category;
  }

  private productDelegate(): ProductDelegate {
    return (this.prisma as unknown as { product: ProductDelegate }).product;
  }

  private sanitizeCategoryName(name: string | undefined): string {
    return name?.trim() || '';
  }

  private sanitizeIconKey(iconKey: string | undefined): string {
    return iconKey?.trim() || DEFAULT_CATEGORY_ICON;
  }

  private sanitizeColor(color: string | undefined): string {
    const trimmed = color?.trim() || DEFAULT_CATEGORY_COLOR;
    return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : DEFAULT_CATEGORY_COLOR;
  }

  private toCategoryModel(row: CategoryRow): CategoryModel {
    return {
      id: String(row.id),
      shopId: String(row.shopId),
      name: String(row.name),
      iconKey: String(row.iconKey || DEFAULT_CATEGORY_ICON),
      color: String(row.color || DEFAULT_CATEGORY_COLOR),
      sortOrder: Number(row.sortOrder ?? 0),
      active: Boolean(row.active),
    };
  }

  private toProductModel(row: ProductRow): ProductModel {
    const st = (row.status ?? PS.ACTIVE) as ProductStatusModel;
    return {
      id: row.id,
      shopId: row.shopId,
      name: row.name,
      categoryId: row.categoryId,
      category: this.toCategoryModel(row.categoryRef as CategoryRow),
      unitPrice: row.unitPrice,
      imageUrl: row.imageUrl ?? undefined,
      active: row.active,
      status: st,
    };
  }

  async listCategories(shopId: string): Promise<CategoryModel[]> {
    const rows = await this.categoryDelegate().findMany({
      where: { shopId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: 200,
    });
    return rows.map((row: CategoryRow) => this.toCategoryModel(row));
  }

  async createCategory(
    shopId: string,
    input: CreateCategoryInput,
  ): Promise<CategoryModel> {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException(`Shop not found: ${shopId}`);
    }
    const name = this.sanitizeCategoryName(input.name);
    if (!name) {
      throw new BadRequestException('category name is required');
    }
    const existing = await this.categoryDelegate().findFirst({
      where: { shopId, name },
    });
    if (existing) {
      throw new ConflictException('Category already exists in this shop');
    }
    const sortOrder =
      input.sortOrder ??
      ((await this.categoryDelegate().count({ where: { shopId } })) + 1) * 10;
    const row = await this.categoryDelegate().create({
      data: {
        shopId,
        name,
        iconKey: this.sanitizeIconKey(input.iconKey),
        color: this.sanitizeColor(input.color),
        sortOrder,
        active: input.active ?? true,
      },
    });
    return this.toCategoryModel(row);
  }

  async updateCategory(
    categoryId: string,
    shopId: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryModel | null> {
    const current = await this.categoryDelegate().findFirst({
      where: { id: categoryId, shopId },
    });
    if (!current) return null;
    const nextName =
      input.name !== undefined
        ? this.sanitizeCategoryName(input.name)
        : undefined;
    if (nextName !== undefined && !nextName) {
      throw new BadRequestException('category name cannot be empty');
    }
    if (nextName && nextName !== current.name) {
      const conflict = await this.categoryDelegate().findFirst({
        where: { shopId, name: nextName, NOT: { id: categoryId } },
      });
      if (conflict) {
        throw new ConflictException('Category already exists in this shop');
      }
    }

    const row = await this.categoryDelegate().update({
      where: { id: categoryId },
      data: {
        ...(nextName !== undefined ? { name: nextName } : {}),
        ...(input.iconKey !== undefined
          ? { iconKey: this.sanitizeIconKey(input.iconKey) }
          : {}),
        ...(input.color !== undefined
          ? { color: this.sanitizeColor(input.color) }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
    return this.toCategoryModel(row);
  }

  private async resolveProductCategory(
    shopId: string,
    input: { categoryId?: string },
  ): Promise<CategoryRow> {
    if (input.categoryId?.trim()) {
      const category = await this.categoryDelegate().findFirst({
        where: { id: input.categoryId.trim(), shopId, active: true },
      });
      if (!category) {
        throw new BadRequestException('categoryId is not valid for this shop');
      }
      return category;
    }

    throw new BadRequestException('categoryId is required');
  }

  /**
   * List products for merchant console. By default excludes archived rows.
   */
  async listProducts(
    shopId: string,
    categoryId?: string,
  ): Promise<ProductModel[]> {
    const rows = await this.productDelegate().findMany({
      where: {
        shopId,
        status: PS.ACTIVE,
        ...(categoryId ? { categoryId } : {}),
      } as Record<string, unknown>,
      include: { categoryRef: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return rows.map((row) => this.toProductModel(row));
  }

  /**
   * Create product: unitPrice in integer cents; duplicate name per shop blocked among ACTIVE rows.
   */
  async createProduct(
    shopId: string,
    input: CreateProductInput,
  ): Promise<ProductModel> {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException(`Shop not found: ${shopId}`);
    }

    const raw = Number(input.unitPrice);
    if (!Number.isFinite(raw) || raw < 0 || !Number.isInteger(raw)) {
      throw new BadRequestException(
        'unitPrice must be a non-negative integer (cents)',
      );
    }
    const unitPriceCents = raw;

    const name = input.name.trim();
    if (!name) {
      throw new BadRequestException('name is required');
    }
    const category = await this.resolveProductCategory(shopId, input);

    const dup = await this.prisma.product.findFirst({
      where: {
        shopId,
        name,
        status: PS.ACTIVE,
      } as Record<string, unknown>,
    });
    if (dup) {
      throw new ConflictException(
        'Product with this name already exists in this shop',
      );
    }

    const imageUrl =
      typeof input.imageUrl === 'string' && input.imageUrl.trim() !== ''
        ? input.imageUrl.trim()
        : undefined;

    const row = await this.productDelegate().create({
      data: {
        shopId,
        name,
        categoryId: category.id,
        unitPrice: unitPriceCents,
        imageUrl,
        active: input.active ?? true,
        status: PS.ACTIVE,
      } as never,
      include: { categoryRef: true },
    });

    return this.toProductModel(row);
  }

  /**
   * Update fields on an ACTIVE product; name must not duplicate another ACTIVE product in the shop.
   */
  async updateProduct(
    productId: string,
    shopId: string,
    input: UpdateProductInput,
  ): Promise<ProductModel | null> {
    const current = await this.prisma.product.findFirst({
      where: { id: productId, shopId },
      include: { categoryRef: true },
    });
    if (!current) {
      return null;
    }
    const curStatus = (current as { status?: string }).status ?? PS.ACTIVE;
    if (curStatus === PS.ARCHIVED) {
      throw new BadRequestException('Cannot update an archived product');
    }

    if (input.name !== undefined) {
      const nextName = input.name.trim();
      if (!nextName) {
        throw new BadRequestException('name cannot be empty');
      }
      if (nextName !== current.name) {
        const conflict = await this.prisma.product.findFirst({
          where: {
            shopId,
            name: nextName,
            status: PS.ACTIVE,
            NOT: { id: productId },
          } as Record<string, unknown>,
        });
        if (conflict) {
          throw new ConflictException(
            'Product with this name already exists in this shop',
          );
        }
      }
    }

    const category =
      input.categoryId !== undefined
        ? await this.resolveProductCategory(shopId, input)
        : undefined;

    await this.productDelegate().updateMany({
      where: { id: productId, shopId, status: PS.ACTIVE } as Record<
        string,
        unknown
      >,
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(category !== undefined ? { categoryId: category.id } : {}),
        ...(input.unitPrice !== undefined
          ? { unitPrice: input.unitPrice }
          : {}),
        ...(input.imageUrl !== undefined
          ? {
              imageUrl:
                input.imageUrl.trim() === '' ? null : input.imageUrl.trim(),
            }
          : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });

    const row = await this.prisma.product.findFirst({
      where: { id: productId, shopId },
      include: { categoryRef: true },
    });
    if (!row) return null;
    return this.toProductModel(row);
  }

  /**
   * Soft-delete: marks product ARCHIVED (no physical delete; order history preserved).
   */
  async archiveProduct(
    productId: string,
    shopId: string,
  ): Promise<ProductModel> {
    const current = await this.prisma.product.findFirst({
      where: { id: productId, shopId },
      include: { categoryRef: true },
    });
    if (!current) {
      throw new NotFoundException('Product not found');
    }
    const curStatus = (current as { status?: string }).status ?? PS.ACTIVE;
    if (curStatus === PS.ARCHIVED) {
      return this.toProductModel(current as never);
    }

    const row = await this.prisma.product.update({
      where: { id: productId },
      data: { status: PS.ARCHIVED } as never,
      include: { categoryRef: true },
    });
    return this.toProductModel(row);
  }
}
