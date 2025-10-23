import { COLLECTIONS, INDEXES } from '@/types/mongodb'
import { getMongoDBService } from './mongodb'

export async function initializeMongoDB() {
  try {
    const service = await getMongoDBService()
    
    console.log('Initializing MongoDB collections and indexes...')
    
    // 创建集合和索引
    for (const [collectionName, indexes] of Object.entries(INDEXES)) {
      const collection = COLLECTIONS[collectionName as keyof typeof COLLECTIONS]
      
      // 创建索引
      for (const indexSpec of indexes) {
        try {
          await service.db.collection(collection).createIndex(indexSpec)
          console.log(`Created index on ${collection}:`, indexSpec)
        } catch (error) {
          console.warn(`Failed to create index on ${collection}:`, indexSpec, error)
        }
      }
    }
    
    // 插入初始数据
    await insertInitialData(service)
    
    console.log('MongoDB initialization completed successfully!')
  } catch (error) {
    console.error('MongoDB initialization failed:', error)
    throw error
  }
}

async function insertInitialData(service: any) {
  try {
    // 检查是否已有数据
    const existingCategories = await service.findMany(COLLECTIONS.CATEGORIES, {}, { limit: 1 })
    if (existingCategories.length > 0) {
      console.log('Database already contains data, skipping initial data insertion')
      return
    }
    
    // 插入默认分类
    const categories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
        isActive: true,
        level: 0,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        isActive: true,
        level: 0,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Books and educational materials',
        isActive: true,
        level: 0,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    for (const category of categories) {
      await service.create(COLLECTIONS.CATEGORIES, category)
    }
    
    // 插入管理员用户
    const adminUser = {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', // password123
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    await service.create(COLLECTIONS.USERS, adminUser)
    
    console.log('Initial data inserted successfully')
  } catch (error) {
    console.error('Failed to insert initial data:', error)
  }
}

// 数据验证函数
export async function validateMongoDBConnection() {
  try {
    const service = await getMongoDBService()
    
    // 测试连接
    await service.db.admin().ping()
    
    // 检查集合是否存在
    const collections = await service.db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    console.log('MongoDB connection validated successfully')
    console.log('Available collections:', collectionNames)
    
    return true
  } catch (error) {
    console.error('MongoDB connection validation failed:', error)
    return false
  }
}