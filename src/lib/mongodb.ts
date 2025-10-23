import { MongoClient, Db, Collection } from 'mongodb'

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env')
}

// 全局变量，用于缓存数据库连接
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // 如果已有缓存连接，直接返回
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    // 创建新的 MongoDB 客户端
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10, // 连接池大小
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket 超时
    })

    // 连接到 MongoDB
    await client.connect()
    const db = client.db(MONGODB_DB)

    // 缓存连接
    cachedClient = client
    cachedDb = db

    console.log('Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

// 获取集合的辅助函数
export async function getCollection<T>(name: string): Promise<Collection<T>> {
  const { db } = await connectToDatabase()
  return db.collection<T>(name)
}

// 关闭连接的函数
export async function closeConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log('MongoDB connection closed')
  }
}

// 数据库操作示例类
export class MongoDBService {
  private db: Db

  constructor(db: Db) {
    this.db = db
  }

  // 通用 CRUD 操作
  async create<T>(collectionName: string, data: Partial<T>): Promise<T> {
    const collection = this.db.collection<T>(collectionName)
    const result = await collection.insertOne(data as any)
    return { ...data, _id: result.insertedId } as T
  }

  async findById<T>(collectionName: string, id: string): Promise<T | null> {
    const collection = this.db.collection<T>(collectionName)
    return await collection.findOne({ _id: new require('mongodb').ObjectId(id) } as any)
  }

  async findMany<T>(
    collectionName: string,
    filter: any = {},
    options: { limit?: number; skip?: number; sort?: any } = {}
  ): Promise<T[]> {
    const collection = this.db.collection<T>(collectionName)
    return await collection.find(filter, options).toArray()
  }

  async updateOne<T>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<T | null> {
    const collection = this.db.collection<T>(collectionName)
    const result = await collection.findOneAndUpdate(
      { _id: new require('mongodb').ObjectId(id) } as any,
      { $set: data },
      { returnDocument: 'after' }
    )
    return result.value
  }

  async deleteOne(collectionName: string, id: string): Promise<boolean> {
    const collection = this.db.collection(collectionName)
    const result = await collection.deleteOne({ _id: new require('mongodb').ObjectId(id) } as any)
    return result.deletedCount > 0
  }
}

// 获取 MongoDB 服务实例
export async function getMongoDBService(): Promise<MongoDBService> {
  const { db } = await connectToDatabase()
  return new MongoDBService(db)
}