import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is missing. Set it in apps/order-service/.env (e.g. postgresql://ejoy:ejoy123@localhost:5433/ejoy)',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
  log: ['error'],
});

type CategorySeed = {
  name: string;
  iconKey: string;
  color: string;
  sortOrder: number;
};

type ProductSeed = {
  name: string;
  unitPrice: number;
  category: string;
  image: string;
};

const SHOP_ID = 'test-shop-001';
const SHOP_NAME = 'test shop';

const categories: CategorySeed[] = [
  { name: 'Breakfast', iconKey: 'coffee', color: '#B7791F', sortOrder: 10 },
  { name: 'Mains', iconKey: 'soup', color: '#B85C38', sortOrder: 20 },
  { name: 'Vegetarian', iconKey: 'leaf', color: '#2F7D4B', sortOrder: 30 },
  { name: 'Coffee & Tea', iconKey: 'coffee', color: '#7C2D12', sortOrder: 40 },
  { name: 'Cold Drinks', iconKey: 'drink', color: '#0E7490', sortOrder: 50 },
];

const products: ProductSeed[] = [
  {
    name: 'Injera Firfir',
    unitPrice: 18000,
    category: 'Breakfast',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Chechebsa',
    unitPrice: 26000,
    category: 'Breakfast',
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Special Ful',
    unitPrice: 30000,
    category: 'Breakfast',
    image:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Kitfo',
    unitPrice: 42000,
    category: 'Mains',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Awaze Tibs',
    unitPrice: 39000,
    category: 'Mains',
    image:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Doro Wot',
    unitPrice: 46000,
    category: 'Mains',
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Fried Fish',
    unitPrice: 36000,
    category: 'Mains',
    image:
      'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Shiro Tegabino',
    unitPrice: 22000,
    category: 'Vegetarian',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Fasting Beyaynetu',
    unitPrice: 32000,
    category: 'Vegetarian',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Vegetable Pasta',
    unitPrice: 28000,
    category: 'Vegetarian',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Macchiato',
    unitPrice: 12000,
    category: 'Coffee & Tea',
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Buna',
    unitPrice: 10000,
    category: 'Coffee & Tea',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Spiced Tea',
    unitPrice: 9000,
    category: 'Coffee & Tea',
    image:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Avocado Juice',
    unitPrice: 22000,
    category: 'Cold Drinks',
    image:
      'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Mango Juice',
    unitPrice: 20000,
    category: 'Cold Drinks',
    image:
      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Lemon Mint',
    unitPrice: 18000,
    category: 'Cold Drinks',
    image:
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80',
  },
];

function getSeedManagerPassword(): string {
  const configured = process.env.SEED_MANAGER_PASSWORD?.trim();
  if (configured) return configured;
  throw new Error('SEED_MANAGER_PASSWORD is required for database seeding');
}

function cloudinaryCloudName(): string | undefined {
  const explicit = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (explicit) return explicit;

  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (!cloudinaryUrl) return undefined;
  try {
    const parsed = new URL(cloudinaryUrl);
    return parsed.protocol === 'cloudinary:' ? parsed.hostname : undefined;
  } catch {
    return undefined;
  }
}

function seedImageUrl(sourceUrl: string): string {
  const cloudName = cloudinaryCloudName();
  if (!cloudName) return sourceUrl;
  return `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,c_fill,w_900,h_700/${encodeURIComponent(sourceUrl)}`;
}

async function resetDemoMenu(shopId: string): Promise<void> {
  await prisma.product.deleteMany({ where: { shopId } });
  await prisma.category.deleteMany({ where: { shopId } });
}

async function seedMenu(shopId: string): Promise<void> {
  const categoriesByName = new Map<string, { id: string; name: string }>();

  for (const category of categories) {
    const row = await prisma.category.create({
      data: {
        shopId,
        name: category.name,
        iconKey: category.iconKey,
        color: category.color,
        sortOrder: category.sortOrder,
        active: true,
      },
      select: { id: true, name: true },
    });
    categoriesByName.set(row.name, row);
  }

  for (const product of products) {
    const category = categoriesByName.get(product.category);
    if (!category) {
      throw new Error(`Missing category seed for ${product.category}`);
    }

    await prisma.product.create({
      data: {
        shopId,
        name: product.name,
        unitPrice: product.unitPrice,
        categoryId: category.id,
        imageUrl: seedImageUrl(product.image),
        active: true,
        status: 'ACTIVE',
      },
    });
  }
}

async function seedTables(shopId: string): Promise<void> {
  const tables = [
    { name: 'Hall A1', capacity: 4, posX: 0.18, posY: 0.22 },
    { name: 'Hall A2', capacity: 4, posX: 0.42, posY: 0.22 },
    { name: 'Hall A3', capacity: 4, posX: 0.66, posY: 0.22 },
    { name: 'Window B1', capacity: 2, posX: 0.25, posY: 0.62 },
    { name: 'Window B2', capacity: 2, posX: 0.55, posY: 0.62 },
    { name: 'Family C1', capacity: 6, posX: 0.78, posY: 0.62 },
  ];

  for (const table of tables) {
    await prisma.diningTable.upsert({
      where: { shopId_name: { shopId, name: table.name } },
      create: { shopId, ...table },
      update: {
        capacity: table.capacity,
        posX: table.posX,
        posY: table.posY,
      },
    });
  }
}

async function seedStaff(shopId: string): Promise<void> {
  const managerPasswordHash = await bcrypt.hash(getSeedManagerPassword(), 10);
  await prisma.staff.upsert({
    where: { phone: '0911000000' },
    create: {
      shopId,
      name: 'Demo Manager',
      phone: '0911000000',
      role: 'MANAGER',
      status: 'ACTIVE',
      passwordHash: managerPasswordHash,
    },
    update: {
      shopId,
      name: 'Demo Manager',
      role: 'MANAGER',
      status: 'ACTIVE',
      passwordHash: managerPasswordHash,
    },
  });
}

async function main() {
  const shop = await prisma.shop.upsert({
    where: { id: SHOP_ID },
    update: {
      name: SHOP_NAME,
      description: 'Fresh Ethiopian favorites, coffee, and juice.',
      active: true,
    },
    create: {
      id: SHOP_ID,
      name: SHOP_NAME,
      description: 'Fresh Ethiopian favorites, coffee, and juice.',
      active: true,
    },
  });

  await resetDemoMenu(shop.id);
  await seedMenu(shop.id);
  await seedTables(shop.id);
  await seedStaff(shop.id);

  console.log(
    `Seeded ${products.length} products across ${categories.length} categories for ${SHOP_NAME}. Shop ID: ${SHOP_ID}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
