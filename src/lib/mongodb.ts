// lib/mongodb.ts
import { Collection, Db, MongoClient, ObjectId } from "mongodb";

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "ecommerce";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

if (!MONGODB_DB) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env"
  );
}

// 全局变量，用于缓存数据库连接
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  // 如果已有缓存连接，直接返回
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // 创建新的 MongoDB 客户端
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // 连接到 MongoDB
    await client.connect();
    const db = client.db(MONGODB_DB);

    // 缓存连接
    cachedClient = client;
    cachedDb = db;

    console.log("✅ Connected to MongoDB successfully");
    return { client, db };
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}

// 获取集合的辅助函数
export async function getCollection<T>(name: string): Promise<Collection<T>> {
  const { db } = await connectToDatabase();
  return db.collection<T>(name);
}

// 关闭连接的函数
export async function closeConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("MongoDB connection closed");
  }
}

// 数据库操作服务类
export class MongoDBService {
  public db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  // 通用 CRUD 操作
  async create<T>(collectionName: string, data: Partial<T>): Promise<T> {
    try {
      const collection = this.db.collection<T>(collectionName);
      const result = await collection.insertOne(data as any);
      return { ...data, _id: result.insertedId } as T;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async findById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const collection = this.db.collection<T>(collectionName);
      // 🔧 FIX: Use 'new ObjectId()' instead of 'ObjectId()'
      return await collection.findOne({ _id: new ObjectId(id) } as any);
    } catch (error) {
      console.error(
        `Error finding document by id in ${collectionName}:`,
        error
      );
      return null;
    }
  }

  async findMany<T>(
    collectionName: string,
    filter: any = {},
    options: { limit?: number; skip?: number; sort?: any } = {}
  ): Promise<T[]> {
    try {
      const collection = this.db.collection<T>(collectionName);
      let query = collection.find(filter);

      if (options.sort) {
        query = query.sort(options.sort);
      }
      if (options.skip) {
        query = query.skip(options.skip);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query.toArray();
    } catch (error) {
      console.error(`Error finding documents in ${collectionName}:`, error);
      return [];
    }
  }

  async updateOne<T>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<T | null> {
    try {
      const collection = this.db.collection<T>(collectionName);
      // 🔧 FIX: Use 'new ObjectId()' instead of 'ObjectId()'
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) } as any,
        { $set: data },
        { returnDocument: "after" }
      );
      return result || null;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      return null;
    }
  }

  async deleteOne(collectionName: string, id: string): Promise<boolean> {
    try {
      const collection = this.db.collection(collectionName);
      // 🔧 FIX: Use 'new ObjectId()' instead of 'ObjectId()'
      const result = await collection.deleteOne({
        _id: new ObjectId(id),
      } as any);
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting document in ${collectionName}:`, error);
      return false;
    }
  }

  // 批量操作
  async insertMany<T>(
    collectionName: string,
    documents: Partial<T>[]
  ): Promise<T[]> {
    try {
      const collection = this.db.collection<T>(collectionName);
      const result = await collection.insertMany(documents as any);
      return documents.map((doc, index) => ({
        ...doc,
        _id: result.insertedIds[index],
      })) as T[];
    } catch (error) {
      console.error(`Error inserting documents in ${collectionName}:`, error);
      throw error;
    }
  }

  async updateMany(
    collectionName: string,
    filter: any,
    data: any
  ): Promise<number> {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.updateMany(filter, { $set: data });
      return result.modifiedCount;
    } catch (error) {
      console.error(`Error updating documents in ${collectionName}:`, error);
      return 0;
    }
  }

  async deleteMany(collectionName: string, filter: any): Promise<number> {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.deleteMany(filter);
      return result.deletedCount;
    } catch (error) {
      console.error(`Error deleting documents in ${collectionName}:`, error);
      return 0;
    }
  }

  // 统计和聚合
  async count(collectionName: string, filter: any = {}): Promise<number> {
    try {
      const collection = this.db.collection(collectionName);
      return await collection.countDocuments(filter);
    } catch (error) {
      console.error(`Error counting documents in ${collectionName}:`, error);
      return 0;
    }
  }

  async aggregate<T>(collectionName: string, pipeline: any[]): Promise<T[]> {
    try {
      const collection = this.db.collection<T>(collectionName);
      return await collection.aggregate(pipeline).toArray();
    } catch (error) {
      console.error(`Error aggregating in ${collectionName}:`, error);
      return [];
    }
  }
}

// 获取 MongoDB 服务实例
export async function getMongoDBService(): Promise<MongoDBService> {
  const { db } = await connectToDatabase();
  return new MongoDBService(db);
}
