import { connectToDatabase } from "@/lib/database"

async function testConnection() {
  console.log('🔗 Testing database connection...')
  
  const isConnected = await connectToDatabase()
  
  if (isConnected) {
    console.log('✅ Database connection successful!')
  } else {
    console.log('❌ Database connection failed!')
  }
}

testConnection().catch(console.error)
