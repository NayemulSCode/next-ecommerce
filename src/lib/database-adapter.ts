import { COLLECTIONS } from "@/types/mongodb";
import { db as prismaDb } from "./db";
import { getDatabaseConfig } from "./env";
import { getMongoDBService, MongoDBService } from "./mongodb";

// 数据库适配器接口
interface DatabaseAdapter {
  // 用户操作
  createUser(data: any): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  updateUser(id: string, data: any): Promise<any>;
  deleteUser(id: string): Promise<boolean>;

  // 产品操作
  createProduct(data: any): Promise<any>;
  getProductById(id: string): Promise<any>;
  getProductBySlug(slug: string): Promise<any>;
  getProducts(filter?: any, options?: any): Promise<any[]>;
  updateProduct(id: string, data: any): Promise<any>;
  deleteProduct(id: string): Promise<boolean>;
  checkProductHasOrders(productId: string): Promise<boolean>; // ✅ NEW

  // 分类操作
  createCategory(data: any): Promise<any>;
  getCategoryById(id: string): Promise<any>;
  getCategoryBySlug(slug: string): Promise<any>;
  getCategories(filter?: any): Promise<any[]>;
  updateCategory(id: string, data: any): Promise<any>;
  deleteCategory(id: string): Promise<boolean>;
  // 订单操作
  createOrder(data: any): Promise<any>;
  getOrderById(id: string): Promise<any>;
  getOrdersByUserId(userId: string): Promise<any[]>;
  updateOrder(id: string, data: any): Promise<any>;
  deleteOrder(id: string): Promise<boolean>;
}

// Prisma 适配器实现
class PrismaAdapter implements DatabaseAdapter {
  async createUser(data: any) {
    return await prismaDb.user.create({ data });
  }

  async getUserById(id: string) {
    return await prismaDb.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string) {
    return await prismaDb.user.findUnique({ where: { email } });
  }

  async updateUser(id: string, data: any) {
    return await prismaDb.user.update({ where: { id }, data });
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await prismaDb.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async createProduct(data: any) {
    return await prismaDb.product.create({ data });
  }

  async getProductById(id: string) {
    return await prismaDb.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async getProductBySlug(slug: string) {
    return await prismaDb.product.findUnique({
      where: { slug },
      include: { category: true },
    });
  }

  async getProducts(filter: any = {}, options: any = {}) {
    return await prismaDb.product.findMany({
      where: filter,
      include: { category: true },
      ...options,
    });
  }

  async updateProduct(id: string, data: any) {
    return await prismaDb.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await prismaDb.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  async checkProductHasOrders(productId: string): Promise<boolean> {
    const orderItems = await prismaDb.orderItem.findMany({
      where: { productId },
      take: 1,
    });
    return orderItems.length > 0;
  }
  async createCategory(data: any) {
    return await prismaDb.category.create({ data });
  }

  async getCategoryById(id: string) {
    return await prismaDb.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
  }

  async getCategoryBySlug(slug: string) {
    return await prismaDb.category.findUnique({
      where: { slug },
      include: { parent: true, children: true },
    });
  }

  async getCategories(filter: any = {}) {
    return await prismaDb.category.findMany({
      where: filter,
      include: { parent: true, children: true },
    });
  }

  async updateCategory(id: string, data: any) {
    return await prismaDb.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await prismaDb.category.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async createOrder(data: any) {
    return await prismaDb.order.create({
      data,
      include: { items: true, user: true, address: true },
    });
  }

  async getOrderById(id: string) {
    return await prismaDb.order.findUnique({
      where: { id },
      include: { items: true, user: true, address: true },
    });
  }

  async getOrdersByUserId(userId: string) {
    return await prismaDb.order.findMany({
      where: { userId },
      include: { items: true, address: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOrder(id: string, data: any) {
    return await prismaDb.order.update({ where: { id }, data });
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      await prismaDb.order.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

// MongoDB 适配器实现
class MongoDBAdapter implements DatabaseAdapter {
  private service: MongoDBService | null = null;

  private async getService() {
    if (!this.service) {
      this.service = await getMongoDBService();
    }
    return this.service;
  }

  // Helper function to convert MongoDB document to consistent format
  private convertDoc(doc: any) {
    if (!doc) return null;
    return {
      ...doc,
      id: doc._id?.toString(),
    };
  }

  async createUser(data: any) {
    const service = await this.getService();
    const result = await service.create(COLLECTIONS.USERS, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async getUserById(id: string) {
    const service = await this.getService();
    const user = await service.findById(COLLECTIONS.USERS, id);
    return this.convertDoc(user);
  }

  async getUserByEmail(email: string) {
    const service = await this.getService();
    const users = await service.findMany(COLLECTIONS.USERS, { email });
    return this.convertDoc(users[0]);
  }

  async updateUser(id: string, data: any) {
    const service = await this.getService();
    const result = await service.updateOne(COLLECTIONS.USERS, id, {
      ...data,
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async deleteUser(id: string): Promise<boolean> {
    const service = await this.getService();
    return await service.deleteOne(COLLECTIONS.USERS, id);
  }

  async createProduct(data: any) {
    const service = await this.getService();
    const result = await service.create(COLLECTIONS.PRODUCTS, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async getProductById(id: string) {
    const service = await this.getService();
    const product = await service.findById(COLLECTIONS.PRODUCTS, id);
    return this.convertDoc(product);
  }

  async getProductBySlug(slug: string) {
    const service = await this.getService();
    const products = await service.findMany(COLLECTIONS.PRODUCTS, { slug });
    return this.convertDoc(products[0]);
  }

  async getProducts(filter: any = {}, options: any = {}) {
    const service = await this.getService();
    const products = await service.findMany(
      COLLECTIONS.PRODUCTS,
      filter,
      options
    );
    return products.map((doc) => this.convertDoc(doc));
  }

  async updateProduct(id: string, data: any) {
    const service = await this.getService();
    const result = await service.updateOne(COLLECTIONS.PRODUCTS, id, {
      ...data,
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const service = await this.getService();
    return await service.deleteOne(COLLECTIONS.PRODUCTS, id);
  }
  // ✅ NEW: Check if product has orders
  async checkProductHasOrders(productId: string): Promise<boolean> {
    const service = await this.getService();

    // Check if there are any order items with this product
    const orderItems = await service.findMany(COLLECTIONS.ORDER_ITEMS, {
      productId,
    });

    return orderItems.length > 0;
  }
  async createCategory(data: any) {
    const service = await this.getService();
    const result = await service.create(COLLECTIONS.CATEGORIES, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async getCategoryById(id: string) {
    const service = await this.getService();
    const category = await service.findById(COLLECTIONS.CATEGORIES, id);
    return this.convertDoc(category);
  }

  async getCategoryBySlug(slug: string) {
    const service = await this.getService();
    const categories = await service.findMany(COLLECTIONS.CATEGORIES, { slug });
    return this.convertDoc(categories[0]);
  }

  async getCategories(filter: any = {}) {
    const service = await this.getService();
    const categories = await service.findMany(COLLECTIONS.CATEGORIES, filter);
    return categories.map((doc) => this.convertDoc(doc));
  }

  async updateCategory(id: string, data: any) {
    const service = await this.getService();
    const result = await service.updateOne(COLLECTIONS.CATEGORIES, id, {
      ...data,
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const service = await this.getService();
    return await service.deleteOne(COLLECTIONS.CATEGORIES, id);
  }

  async createOrder(data: any) {
    const service = await this.getService();
    const result = await service.create(COLLECTIONS.ORDERS, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async getOrderById(id: string) {
    const service = await this.getService();
    const order = await service.findById(COLLECTIONS.ORDERS, id);
    return this.convertDoc(order);
  }

  async getOrdersByUserId(userId: string) {
    const service = await this.getService();
    const orders = await service.findMany(
      COLLECTIONS.ORDERS,
      { userId },
      {
        sort: { createdAt: -1 },
      }
    );
    return orders.map((doc) => this.convertDoc(doc));
  }

  async updateOrder(id: string, data: any) {
    const service = await this.getService();
    const result = await service.updateOne(COLLECTIONS.ORDERS, id, {
      ...data,
      updatedAt: new Date(),
    });
    return this.convertDoc(result);
  }

  async deleteOrder(id: string): Promise<boolean> {
    const service = await this.getService();
    return await service.deleteOne(COLLECTIONS.ORDERS, id);
  }
}

// 数据库适配器工厂
export function createDatabaseAdapter(): DatabaseAdapter {
  const config = getDatabaseConfig();

  if (config.provider === "mongodb") {
    console.log("🍃 Using MongoDB adapter");
    return new MongoDBAdapter();
  }

  console.log("🗄️  Using Prisma (SQLite) adapter");
  return new PrismaAdapter();
}

// 导出单例实例
export const dbAdapter = createDatabaseAdapter();
