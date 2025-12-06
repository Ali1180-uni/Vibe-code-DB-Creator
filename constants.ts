import { DatabaseDialect } from './types';

const TIMESTAMP = new Date().toISOString();
export const MOCK_ENHANCED_DIAGRAM_URL = "https://placehold.co/1200x900/0f172a/22d3ee?text=Enhanced+Schema+Diagram%0A(Normalized+%26+Optimized)+%E2%9C%A8";

// --- OPTIMIZED / ENHANCED MOCKS (Nano Banana Mode) ---

export const MOCK_SQL_POSTGRES = `-- E-commerce Schema (PostgreSQL)
-- Optimized by VisionDB (Nano Banana Mode)
-- Timestamp: ${TIMESTAMP}

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(100),
  "last_name" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "last_login" TIMESTAMP
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "parent_id" INTEGER
);

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "sku" VARCHAR(50) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "stock_quantity" INTEGER NOT NULL DEFAULT 0,
  "category_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "orders" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
  "total_amount" DECIMAL(10, 2) NOT NULL,
  "shipping_address" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "order_items" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(10, 2) NOT NULL
);

CREATE TABLE "reviews" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

-- Foreign Keys
ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "categories" ADD FOREIGN KEY ("parent_id") REFERENCES "categories" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");
ALTER TABLE "order_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");
ALTER TABLE "reviews" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");
ALTER TABLE "reviews" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Indexes
CREATE INDEX "idx_products_category" ON "products" ("category_id");
CREATE INDEX "idx_orders_user" ON "orders" ("user_id");
`;

export const MOCK_SQL_MYSQL = `-- E-commerce Schema (MySQL)
-- Optimized by VisionDB (Nano Banana Mode)
-- Timestamp: ${TIMESTAMP}

CREATE TABLE \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`email\` VARCHAR(255) UNIQUE NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`first_name\` VARCHAR(100),
  \`last_name\` VARCHAR(100),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`last_login\` TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE \`categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`parent_id\` INT,
  FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`)
) ENGINE=InnoDB;

CREATE TABLE \`products\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`sku\` VARCHAR(50) UNIQUE NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`description\` TEXT,
  \`price\` DECIMAL(10, 2) NOT NULL,
  \`stock_quantity\` INT NOT NULL DEFAULT 0,
  \`category_id\` INT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`)
) ENGINE=InnoDB;

CREATE TABLE \`orders\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT NOT NULL,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
  \`total_amount\` DECIMAL(10, 2) NOT NULL,
  \`shipping_address\` TEXT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
) ENGINE=InnoDB;

CREATE TABLE \`order_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` INT NOT NULL,
  \`product_id\` INT NOT NULL,
  \`quantity\` INT NOT NULL,
  \`unit_price\` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`),
  FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`)
) ENGINE=InnoDB;

-- Indexes
CREATE INDEX \`idx_products_category\` ON \`products\` (\`category_id\`);
CREATE INDEX \`idx_orders_user\` ON \`orders\` (\`user_id\`);
`;

export const MOCK_SQL_SQLITE = `-- E-commerce Schema (SQLite)
-- Optimized by VisionDB (Nano Banana Mode)
-- Timestamp: ${TIMESTAMP}

CREATE TABLE "users" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "email" TEXT UNIQUE NOT NULL,
  "password_hash" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "last_login" DATETIME
);

CREATE TABLE "categories" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "parent_id" INTEGER,
  FOREIGN KEY("parent_id") REFERENCES "categories"("id")
);

CREATE TABLE "products" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "sku" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" REAL NOT NULL,
  "stock_quantity" INTEGER NOT NULL DEFAULT 0,
  "category_id" INTEGER,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY("category_id") REFERENCES "categories"("id")
);

CREATE TABLE "orders" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "user_id" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "total_amount" REAL NOT NULL,
  "shipping_address" TEXT NOT NULL,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY("user_id") REFERENCES "users"("id")
);

CREATE TABLE "order_items" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" REAL NOT NULL,
  FOREIGN KEY("order_id") REFERENCES "orders"("id"),
  FOREIGN KEY("product_id") REFERENCES "products"("id")
);

-- Indexes
CREATE INDEX "idx_products_category" ON "products" ("category_id");
CREATE INDEX "idx_orders_user" ON "orders" ("user_id");
`;

export const MOCK_SQL_MSSQL = `-- E-commerce Schema (SQL Server / T-SQL)
-- Optimized by VisionDB (Nano Banana Mode)
-- Timestamp: ${TIMESTAMP}

CREATE TABLE [users] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [email] NVARCHAR(255) UNIQUE NOT NULL,
  [password_hash] NVARCHAR(255) NOT NULL,
  [first_name] NVARCHAR(100),
  [last_name] NVARCHAR(100),
  [created_at] DATETIME DEFAULT GETDATE(),
  [last_login] DATETIME
);

CREATE TABLE [categories] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] NVARCHAR(100) NOT NULL,
  [parent_id] INT,
  CONSTRAINT [FK_Category_Parent] FOREIGN KEY ([parent_id]) REFERENCES [categories]([id])
);

CREATE TABLE [products] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [sku] NVARCHAR(50) UNIQUE NOT NULL,
  [name] NVARCHAR(255) NOT NULL,
  [description] NVARCHAR(MAX),
  [price] DECIMAL(10, 2) NOT NULL,
  [stock_quantity] INT NOT NULL DEFAULT 0,
  [category_id] INT,
  [created_at] DATETIME DEFAULT GETDATE(),
  CONSTRAINT [FK_Product_Category] FOREIGN KEY ([category_id]) REFERENCES [categories]([id])
);

CREATE TABLE [orders] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [user_id] INT NOT NULL,
  [status] NVARCHAR(50) NOT NULL DEFAULT 'pending',
  [total_amount] DECIMAL(10, 2) NOT NULL,
  [shipping_address] NVARCHAR(MAX) NOT NULL,
  [created_at] DATETIME DEFAULT GETDATE(),
  CONSTRAINT [FK_Order_User] FOREIGN KEY ([user_id]) REFERENCES [users]([id])
);

CREATE TABLE [order_items] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [order_id] INT NOT NULL,
  [product_id] INT NOT NULL,
  [quantity] INT NOT NULL,
  [unit_price] DECIMAL(10, 2) NOT NULL,
  CONSTRAINT [FK_OrderItem_Order] FOREIGN KEY ([order_id]) REFERENCES [orders]([id]),
  CONSTRAINT [FK_OrderItem_Product] FOREIGN KEY ([product_id]) REFERENCES [products]([id])
);

-- Indexes
CREATE INDEX [idx_products_category] ON [products] ([category_id]);
CREATE INDEX [idx_orders_user] ON [orders] ([user_id]);
`;

export const MOCK_MONGO_MONGOOSE = `// E-commerce Schema (MongoDB / Mongoose)
// Optimized by VisionDB (Nano Banana Mode)
// Timestamp: ${TIMESTAMP}

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Users Schema ---
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: String,
  last_name: String,
  last_login: Date
}, { timestamps: true });

// --- Categories Schema ---
const CategorySchema = new Schema({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' }
});

// --- Products Schema ---
const ProductSchema = new Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock_quantity: { type: Number, default: 0 },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  // Embedded reviews for read performance
  reviews: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    created_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// --- Orders Schema ---
const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  total_amount: { type: Number, required: true },
  shipping_address: { type: String, required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    unit_price: Number
  }]
}, { timestamps: true });

// --- Models ---
module.exports = {
  User: mongoose.model('User', UserSchema),
  Category: mongoose.model('Category', CategorySchema),
  Product: mongoose.model('Product', ProductSchema),
  Order: mongoose.model('Order', OrderSchema)
};
`;

export const MOCK_PRISMA = `// E-commerce Schema (Prisma)
// Optimized by VisionDB (Nano Banana Mode)
// Timestamp: ${TIMESTAMP}

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")
  createdAt     DateTime  @default(now()) @map("created_at")
  lastLogin     DateTime? @map("last_login")
  
  orders        Order[]
  reviews       Review[]

  @@map("users")
}

model Category {
  id        Int        @id @default(autoincrement())
  name      String
  parentId  Int?       @map("parent_id")
  parent    Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryToCategory")
  products  Product[]

  @@map("categories")
}

model Product {
  id            Int         @id @default(autoincrement())
  sku           String      @unique
  name          String
  description   String?
  price         Decimal
  stockQuantity Int         @default(0) @map("stock_quantity")
  categoryId    Int?        @map("category_id")
  category      Category?   @relation(fields: [categoryId], references: [id])
  createdAt     DateTime    @default(now()) @map("created_at")
  
  orderItems    OrderItem[]
  reviews       Review[]

  @@index([categoryId])
  @@map("products")
}

model Order {
  id              Int         @id @default(autoincrement())
  userId          Int         @map("user_id")
  user            User        @relation(fields: [userId], references: [id])
  status          String      @default("pending")
  totalAmount     Decimal     @map("total_amount")
  shippingAddress String      @map("shipping_address")
  createdAt       DateTime    @default(now()) @map("created_at")
  
  items           OrderItem[]

  @@index([userId])
  @@map("orders")
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int     @map("order_id")
  order     Order   @relation(fields: [orderId], references: [id])
  productId Int     @map("product_id")
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Decimal @map("unit_price")

  @@map("order_items")
}

model Review {
  id        Int      @id @default(autoincrement())
  productId Int      @map("product_id")
  product   Product  @relation(fields: [productId], references: [id])
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  rating    Int
  comment   String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("reviews")
}
`;

// --- RAW / ORIGINAL MOCKS (Messy) ---

const MOCK_RAW_POSTGRES = `-- Original Schema Extraction (Raw)
-- Contains detected inconsistencies and missing constraints
-- Timestamp: ${TIMESTAMP}

CREATE TABLE users (
  id integer, -- Missing PRIMARY KEY
  email varchar(255),
  password_hash varchar(255),
  First_Name varchar(100), -- Inconsistent naming
  Last_Name varchar(100)
);

CREATE TABLE products (
  sku varchar(50),
  name varchar(255),
  price decimal,
  cat_id integer -- Ambiguous Foreign Key
);

CREATE TABLE orders (
  order_id integer,
  user_id integer,
  total decimal
);

-- Note: No foreign keys detected in diagram
-- Note: No indexes found
`;

const MOCK_RAW_GENERIC = `-- Original Schema Extraction (Raw)
-- Contains detected inconsistencies and missing constraints
-- Timestamp: ${TIMESTAMP}

/* 
   WARNING: The AI detected multiple issues in the original image:
   1. Missing Primary Keys on 'users', 'orders'.
   2. Ambiguous relationship lines between 'products' and 'categories'.
   3. Mixed casing (camelCase vs snake_case).
   
   Proceeding with raw extraction...
*/

TABLE users {
  id: int
  email: string
  name: string
}

TABLE orders {
  id: int
  user_id: int
  amt: double
}
`;


export const ENHANCED_CODE_BY_DIALECT: Record<DatabaseDialect, string> = {
  'PostgreSQL': MOCK_SQL_POSTGRES,
  'MySQL': MOCK_SQL_MYSQL,
  'SQLite': MOCK_SQL_SQLITE,
  'SQL Server': MOCK_SQL_MSSQL,
  'MongoDB': MOCK_MONGO_MONGOOSE,
  'Prisma': MOCK_PRISMA
};

export const RAW_CODE_BY_DIALECT: Record<DatabaseDialect, string> = {
  'PostgreSQL': MOCK_RAW_POSTGRES,
  'MySQL': MOCK_RAW_GENERIC,
  'SQLite': MOCK_RAW_GENERIC,
  'SQL Server': MOCK_RAW_GENERIC,
  'MongoDB': MOCK_RAW_GENERIC,
  'Prisma': MOCK_RAW_GENERIC
};