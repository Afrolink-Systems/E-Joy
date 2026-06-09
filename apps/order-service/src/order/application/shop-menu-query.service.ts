import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopMenuProductModel } from '../order.types';

type ShopMenuProductRow = {
  id: string;
  name: string;
  categoryId: string;
  unitPrice: number;
  imageUrl?: string | null;
  categoryRef?: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    sortOrder: number;
    active: boolean;
  } | null;
};

@Injectable()
export class ShopMenuQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async shopMenuProducts(shopId: string): Promise<ShopMenuProductModel[]> {
    const rows = await (this.prisma as any).product.findMany({
      where: { shopId, active: true, status: 'ACTIVE' } as Record<
        string,
        unknown
      >,
      include: { categoryRef: true },
      orderBy: [{ name: 'asc' }],
      take: 500,
    });
    return rows
      .filter((row: ShopMenuProductRow) => row.categoryRef?.active)
      .map((row: ShopMenuProductRow) => this.toShopMenuProduct(row))
      .sort((left: ShopMenuProductModel, right: ShopMenuProductModel) => {
        const leftOrder = left.categoryMeta.sortOrder;
        const rightOrder = right.categoryMeta.sortOrder;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        const categoryCompare = left.categoryMeta.name.localeCompare(
          right.categoryMeta.name,
        );
        if (categoryCompare !== 0) return categoryCompare;
        return left.name.localeCompare(right.name);
      });
  }

  private toShopMenuProduct(row: ShopMenuProductRow): ShopMenuProductModel {
    const activeCategory = row.categoryRef;
    return {
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      categoryMeta: {
        id: activeCategory!.id,
        name: activeCategory!.name,
        iconKey: activeCategory!.iconKey,
        color: activeCategory!.color,
        sortOrder: activeCategory!.sortOrder,
      },
      unitPrice: row.unitPrice,
      imageUrl:
        typeof row.imageUrl === 'string' && row.imageUrl.length > 0
          ? row.imageUrl
          : undefined,
    };
  }
}
