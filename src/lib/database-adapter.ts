import { getDatabaseConfig } from './env'
import { db as prismaDb } from './db'
import { getMongoDBService, MongoDBService } from './mongodb'
import { COLLECTIONS } from '@/types/mongodb'

// 数据库适配器接口
interface DatabaseAdapter {
  // 用户操作
  createUser(data: any): Promise<any>
  getUserById(id: string): Promise<any>
  getUserByEmail(email: string): Promise<any>
  updateUser(id: string, data: any): Promise<any>
  deleteUser(id: string): Promise<boolean>
  
  // 产品操作
  createProduct(data: any): Promise<any>
  getProductById(id: string): Promise<any>
  getProductBySlug(slug: string): Promise<any>
  getProducts(filter?: any, options?: any): Promise<any[]>
  updateProduct(id: string, data: any): Promise<any>
  deleteProduct(id: string): Promise<boolean>
  
  // 分类操作
  createCategory(data: any): Promise<any>
  getCategoryById(id: string): Promise<any>
  getCategoryBySlug(slug: string): Promise<any>
  getCategories(filter?: any): Promise<any[]>
  updateCategory(id: string, data: any): Promise<any>
  deleteCategory(id: string): Promise<boolean>
  
  // 订单操作
  createOrder(data: any): Promise<any>
  getOrderById(id: string): Promise<any>
  getOrdersByUserId(userId: string): Promise<any[]>
  updateOrder(id: string, data: any): Promise<any>
  deleteOrder(id: string): Promise<boolean>
}

// Prisma 适配器实现
class PrismaAdapter implements DatabaseAdapter {
  async createUser(data: any) {
    return await prismaDb.user.create({ data })
  }
  
  async getUserById(id: string) {
    return await prismaDb.user.findUnique({ where: { id } })
  }
  
  async getUserByEmail(email: string) {
    return await prismaDb.user.findUnique({ where: { email } })
  }
  
  async updateUser(id: string, data: any) {
    return await prismaDb.user.update({ where: { id }, data })
  }
  
  async deleteUser(id: string): Promise<boolean> {
    try {
      await prismaDb.user.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }
  
  async createProduct(data: any) {
    return await prismaDb.product.create({ data })
  }
  
  async getProductById(id: string) {
    return await prismaDb.product.findUnique({ 
      where: { id },
      include: { category: true }
    })
  }
  
  async getProductBySlug(slug: string) {
    return await prismaDb.product.findUnique({ 
      where: { slug },
      include: { category: true }
    })
  }
  
  async getProducts(filter: any = {}, options: any = {}) {
    return await prismaDb.product.findMany({
      where: filter,
      include: { category: true },
      ...options
    })
  }
  
  async updateProduct(id: string, data: any) {
    return await prismaDb.product.update({ where: { id }, data })
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await prismaDb.product.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }
  
  async createCategory(data: any) {
    return await prismaDb.category.create({ data })
  }
  
  async getCategoryById(id: string) {
    return await prismaDb.category.findUnique({ 
      where: { id },
      include: { parent: true, children: true }
    })
  }
  
  async getCategoryBySlug(slug: string) {
    return await prismaDb.category.findUnique({ 
      where: { slug },
      include: { parent: true, children: true }
    })
  }
  
  async getCategories(filter: any = {}) {
    return await prismaDb.category.findMany({
      where: filter,
      include: { parent: true, children: true }
    })
  }
  
  async updateCategory(id: string, data: any) {
    return await prismaDb.category.update({ where: { id }, data })
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    try {
      await prismaDb.category.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }
  
  async createOrder(data: any) {
    return await prismaDb.order.create({ 
      data,
      include: { items: true, user: true, address: true }
    })
  }
  
  async getOrderById(id: string) {
    return await prismaDb.order.findUnique({ 
      where: { id },
      include: { items: true, user: true, address: true }
    })
  }
  
  async getOrdersByUserId(userId: string) {
    return await prismaDb.order.findMany({ 
      where: { userId },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  async updateOrder(id: string, data: any) {
    return await prismaDb.order.update({ where: { id }, data })
  }
  
  async deleteOrder(id: string): Promise<boolean> {
    try {
      await prismaDb.order.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }
}

// MongoDB 适配器实现
class MongoDBAdapter implements DatabaseAdapter {
  private service: MongoDBService
  
  constructor() {
    this.service = {} as MongoDBService
  }
  
  private async getService() {
    if (!this.service.db) {
      this.service = await getMongoDBService()
    }
    return this.service
  }
  
  async createUser(data: any) {
    const service = await this.getService()
    return await service.create(COLLECTIONS.USERS, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
  
  async getUserById(id: string) {
    const service = await this.getService()
    return await service.findById(COLLECTIONS.USERS, id)
  }
  
  async getUserByEmail(email: string) {
    const service = await this.getService()
    const users = await service.findMany(COLLECTIONS.USERS, { email })
    return users[0] || null
  }
  
  async updateUser(id: string, data: any) {
    const service = await this.getService()
    return await service.updateOne(COLLECTIONS.USERS, id, {
      ...data,
      updatedAt: new Date(),
    })
  }
  
  async deleteUser(id: string): Promise<boolean> {
    const service = await this.getService()
    return await service.deleteOne(COLLECTIONS.USERS, id)
  }
  
  async createProduct(data: any) {
    const service = await this.getService()
    return await service.create(COLLECTIONS.PRODUCTS, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
  
  async getProductById(id: string) {
    const service = await this.getService()
    return await service.findById(COLLECTIONS.PRODUCTS, id)
  }
  
  async getProductBySlug(slug: string) {
    const service = await this.getService()
    const products = await service.findMany(COLLECTIONS.PRODUCTS, { slug })
    return products[0] || null
  }
  
  async getProducts(filter: any = {}, options: any = {}) {
    const service = await this.getService()
    return await service.findMany(COLLECTIONS.PRODUCTS, filter, options)
  }
  
  async updateProduct(id: string, data: any) {
    const service = await this.getService()
    return await service.updateOne(COLLECTIONS.PRODUCTS, id, {
      ...data,
      updatedAt: new Date(),
    })
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const service = await this.getService()
    return await service.deleteOne(COLLECTIONS.PRODUCTS, id)
  }
  
  async createCategory(data: any) {
    const service = await this.getService()
    return await service.create(COLLECTIONS.CATEGORIES, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
  
  async getCategoryById(id: string) {
    const service = await this.getService()
    return await service.findById(COLLECTIONS.CATEGORIES, id)
  }
  
  async getCategoryBySlug(slug: string) {
    const service = await this.getService()
    const categories = await service.findMany(COLLECTIONS.CATEGORIES, { slug })
    return categories[0] || null
  }
  
  async getCategories(filter: any = {}) {
    const service = await this.getService()
    return await service.findMany(COLLECTIONS.CATEGORIES, filter)
  }
  
  async updateCategory(id: string, data: any) {
    const service = await this.getService()
    return await service.updateOne(COLLECTIONS.CATEGORIES, id, {
      ...data,
      updatedAt: new Date(),
    })
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    const service = await this.getService()
    return await service.deleteOne(COLLECTIONS.CATEGORIES, id)
  }
  
  async createOrder(data: any) {
    const service = await this.getService()
    return await service.create(COLLECTIONS.ORDERS, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
  
  async getOrderById(id: string) {
    const service = await this.getService()
    return await service.findById(COLLECTIONS.ORDERS, id)
  }
  
  async getOrdersByUserId(userId: string) {
    const service = await this.getService()
    return await service.findMany(COLLECTIONS.ORDERS, { userId }, {
      sort: { createdAt: -1 }
    })
  }
  
  async updateOrder(id: string, data: any) {
    const service = await this.getService()
    return await service.updateOne(COLLECTIONS.ORDERS, id, {
      ...data,
      updatedAt: new Date(),
    })
  }
  
  async deleteOrder(id: string): Promise<boolean> {
    const service = await this.getService()
    return await service.deleteOne(COLLECTIONS.ORDERS, id)
  }
}

// 数据库适配器工厂
export function createDatabaseAdapter(): DatabaseAdapter {
  const config = getDatabaseConfig()
  
  if (config.provider === 'mongodb') {
    console.log('🍃 Using MongoDB adapter')
    return new MongoDBAdapter()
  }
  
  console.log('🗄️  Using Prisma (SQLite) adapter')
  return new PrismaAdapter()
}

// 导出单例实例
export const dbAdapter = createDatabaseAdapter()