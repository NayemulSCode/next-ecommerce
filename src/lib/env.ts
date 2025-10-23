import { z } from 'zod'

// 环境变量验证模式
const envSchema = z.object({
  // 数据库配置
  DATABASE_PROVIDER: z.enum(['sqlite', 'mongodb']).default('sqlite'),
  DATABASE_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().optional(),
  
  // NextAuth 配置
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Stripe 配置
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // 邮件配置
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  
  // 应用配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
})

// 验证环境变量
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    process.exit(1)
  }
}

// 导出验证后的环境变量
export const env = validateEnv()

// 数据库配置辅助函数
export function getDatabaseConfig() {
  const provider = env.DATABASE_PROVIDER
  
  if (provider === 'mongodb') {
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required when using MongoDB')
    }
    return {
      provider: 'mongodb',
      uri: env.MONGODB_URI,
      database: env.MONGODB_DB || 'ecommerce',
    }
  }
  
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when using SQLite')
  }
  
  return {
    provider: 'sqlite',
    url: env.DATABASE_URL,
  }
}

// 配置检查函数
export function checkRequiredConfigs() {
  const missing = []
  
  // 检查必需的配置
  if (!env.NEXTAUTH_SECRET) {
    missing.push('NEXTAUTH_SECRET')
  }
  
  // 检查数据库配置
  if (env.DATABASE_PROVIDER === 'mongodb') {
    if (!env.MONGODB_URI) missing.push('MONGODB_URI')
  } else {
    if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  }
  
  // 检查 Stripe 配置（如果需要支付功能）
  if (!env.STRIPE_PUBLIC_KEY || !env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  Stripe configuration missing. Payment features will not work.')
  }
  
  // 检查 Google OAuth 配置（如果需要 Google 登录）
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth configuration missing. Google login will not work.')
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    return false
  }
  
  console.log('✅ Environment variables validated successfully')
  return true
}

// 开发环境配置生成器
export function generateEnvExample() {
  return `# Database Configuration
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./db/custom.db

# MongoDB Configuration (alternative to SQLite)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ecommerce

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application Configuration
NODE_ENV=development
PORT=3000`
}

// 安全的密钥生成器
export function generateSecretKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}