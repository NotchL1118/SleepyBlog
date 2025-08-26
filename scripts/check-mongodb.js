import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// 手动读取 .env.local 文件
const envPath = path.join(import.meta.dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const MONGODB_URL = process.env.MONGODB_URL;

console.log('🔍 检查MongoDB连接...\n');

if (!MONGODB_URL) {
  console.error('❌ 错误: 未找到 MONGODB_URL 环境变量');
  console.log('💡 解决方案:');
  console.log('   1. 在项目根目录创建 .env.local 文件');
  console.log('   2. 添加: MONGODB_URL=mongodb://localhost:27017/sleepy-blog');
  console.log('   3. 确保MongoDB服务正在运行\n');
  process.exit(1);
}

console.log(`🔗 连接字符串: ${MONGODB_URL.replace(/\/\/.*@/, '//***:***@')}`);

async function checkConnection() {
  try {
    console.log('⏳ 正在连接MongoDB...');
    
    await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000, // 5秒超时
    });
    
    console.log('✅ MongoDB连接成功!');
    
    // 检查数据库状态
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📊 数据库信息:`);
    console.log(`   - 数据库名: ${db.databaseName}`);
    console.log(`   - 集合数量: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log(`   - 集合列表: ${collections.map(c => c.name).join(', ')}`);
      
      // 检查文章集合
      const articlesCollection = collections.find(c => c.name === 'articles');
      if (articlesCollection) {
        const articleCount = await db.collection('articles').countDocuments();
        console.log(`   - 文章数量: ${articleCount}`);
        
        if (articleCount === 0) {
          console.log('\n💡 提示: 数据库为空，可以通过以下方式初始化数据:');
          console.log('   1. 访问 http://localhost:3000/test-api');
          console.log('   2. 点击"初始化数据"按钮');
        }
      }
    } else {
      console.log('\n💡 提示: 数据库为空，这是正常的首次运行状态');
    }
    
    console.log('\n🎉 MongoDB连接检查完成!');
    
  } catch (error) {
    console.error('\n❌ MongoDB连接失败:');
    console.error(`   错误信息: ${error.message}`);
    
    // 提供具体的解决建议
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 解决方案:');
      console.log('   1. 确保MongoDB服务正在运行');
      console.log('   2. macOS: brew services start mongodb-community');
      console.log('   3. Ubuntu: sudo systemctl start mongodb');
      console.log('   4. Docker: docker run -d -p 27017:27017 mongo');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 解决方案:');
      console.log('   1. 检查用户名和密码是否正确');
      console.log('   2. 确保用户有访问数据库的权限');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 解决方案:');
      console.log('   1. 检查主机名是否正确');
      console.log('   2. 检查网络连接');
      console.log('   3. 如果使用云服务，检查IP白名单设置');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkConnection(); 