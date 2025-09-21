import bcrypt from 'bcryptjs';
import { users, packages, trips } from '../lib/data/listings';
import prisma from '@/lib/prisma';
import { 
  UserRole, 
  PackageStatus, 
  TripStatus, 
  TransactionType, 
  PaymentStatus,
  NotificationType,
  VerificationStatus,
  DisputeStatus
} from '@prisma/client';

// Helper function to get next sequential ID based on existing data
const getNextSequentialId = async (tableName: string, prefix: string): Promise<string> => {
  try {
    let maxNum = 0;
    
    switch (tableName) {
      case 'user':
        const users = await prisma.user.findMany({ select: { id: true } });
        users.forEach(user => {
          const match = user.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
        
      case 'package':
        const packages = await prisma.package.findMany({ select: { id: true } });
        packages.forEach(pkg => {
          const match = pkg.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
        
      case 'trip':
        const trips = await prisma.trip.findMany({ select: { id: true } });
        trips.forEach(trip => {
          const match = trip.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
        
      case 'chat':
        const chats = await prisma.chat.findMany({ select: { id: true } });
        chats.forEach(chat => {
          const match = chat.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
        
      case 'message':
        const messages = await prisma.message.findMany({ select: { id: true } });
        messages.forEach(message => {
          const match = message.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
        
      case 'transaction':
        const transactions = await prisma.transaction.findMany({ select: { id: true } });
        transactions.forEach(transaction => {
          const match = transaction.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
        
      case 'verificationDocument':
        const docs = await prisma.verificationDocument.findMany({ select: { id: true } });
        docs.forEach(doc => {
          const match = doc.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
        
      case 'dispute':
        const disputes = await prisma.dispute.findMany({ select: { id: true } });
        disputes.forEach(dispute => {
          const match = dispute.id.match(/(\d+)$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        break;
    }
    
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error(`Error getting next ID for ${tableName}:`, error);
    return `${prefix}001`;
  }
};

// Helper function to ensure unique ID by checking existence and generating new one if needed
const ensureUniqueId = async (tableName: string, proposedId: string, prefix: string): Promise<string> => {
  try {
    let exists = false;
    
    switch (tableName) {
      case 'user':
        exists = !!(await prisma.user.findUnique({ where: { id: proposedId } }));
        break;
      case 'package':
        exists = !!(await prisma.package.findUnique({ where: { id: proposedId } }));
        break;
      case 'trip':
        exists = !!(await prisma.trip.findUnique({ where: { id: proposedId } }));
        break;
      case 'chat':
        exists = !!(await prisma.chat.findUnique({ where: { id: proposedId } }));
        break;
      case 'message':
        exists = !!(await prisma.message.findUnique({ where: { id: proposedId } }));
        break;
      case 'transaction':
        exists = !!(await prisma.transaction.findUnique({ where: { id: proposedId } }));
        break;
      case 'verificationDocument':
        exists = !!(await prisma.verificationDocument.findUnique({ where: { id: proposedId } }));
        break;
      case 'dispute':
        exists = !!(await prisma.dispute.findUnique({ where: { id: proposedId } }));
        break;
    }
    
    if (exists) {
      return await getNextSequentialId(tableName, prefix);
    }
    
    return proposedId;
  } catch (error) {
    console.error(`Error checking ID uniqueness for ${tableName}:`, error);
    return await getNextSequentialId(tableName, prefix);
  }
};

// Helper functions to generate diverse data
const generateRandomName = () => {
  const firstNames = [
    'Alex', 'Maria', 'James', 'Sarah', 'David', 'Emma', 'Michael', 'Jessica', 'Robert', 'Ashley',
    'William', 'Jennifer', 'Richard', 'Amanda', 'Joseph', 'Lisa', 'Thomas', 'Michelle', 'Christopher', 'Kimberly',
    'Daniel', 'Dorothy', 'Matthew', 'Nancy', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
    'Steven', 'Carol', 'Paul', 'Ruth', 'Joshua', 'Sharon', 'Kenneth', 'Michelle', 'Kevin', 'Laura',
    'Brian', 'Sarah', 'George', 'Kimberly', 'Timothy', 'Deborah', 'Ronald', 'Dorothy', 'Jason', 'Lisa',
    'Edward', 'Nancy', 'Jeffrey', 'Karen', 'Ryan', 'Betty', 'Jacob', 'Helen', 'Gary', 'Sandra'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName, lastName };
};

const generateRandomEmail = (firstName: string, lastName: string) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com', 'mail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}@${domain}`
  ];
  return variations[Math.floor(Math.random() * variations.length)];
};

const generateRandomCity = () => {
  const cities = [
    { city: 'New York', country: 'USA', state: 'NY' },
    { city: 'Los Angeles', country: 'USA', state: 'CA' },
    { city: 'London', country: 'UK', state: 'England' },
    { city: 'Paris', country: 'France', state: 'Île-de-France' },
    { city: 'Tokyo', country: 'Japan', state: 'Tokyo' },
    { city: 'Sydney', country: 'Australia', state: 'NSW' },
    { city: 'Toronto', country: 'Canada', state: 'Ontario' },
    { city: 'Berlin', country: 'Germany', state: 'Berlin' },
    { city: 'Madrid', country: 'Spain', state: 'Madrid' },
    { city: 'Rome', country: 'Italy', state: 'Lazio' },
    { city: 'Mumbai', country: 'India', state: 'Maharashtra' },
    { city: 'Lagos', country: 'Nigeria', state: 'Lagos' },
    { city: 'Cairo', country: 'Egypt', state: 'Cairo' },
    { city: 'Dubai', country: 'UAE', state: 'Dubai' },
    { city: 'Singapore', country: 'Singapore', state: 'Singapore' },
    { city: 'Hong Kong', country: 'China', state: 'Hong Kong' },
    { city: 'Seoul', country: 'South Korea', state: 'Seoul' },
    { city: 'Bangkok', country: 'Thailand', state: 'Bangkok' },
    { city: 'Jakarta', country: 'Indonesia', state: 'Jakarta' },
    { city: 'Mexico City', country: 'Mexico', state: 'CDMX' }
  ];
  return cities[Math.floor(Math.random() * cities.length)];
};

const generateCoordinates = () => ({
  latitude: (Math.random() - 0.5) * 180,
  longitude: (Math.random() - 0.5) * 360
});

async function main() {
  console.log('🌱 Starting comprehensive database seed with 50+ records per entity...');

  // Check existing data instead of clearing
  console.log('📊 Checking existing data...');
  const existingUsers = await prisma.user.findMany({ select: { id: true } });
  const existingPackages = await prisma.package.findMany({ select: { id: true } });
  const existingTrips = await prisma.trip.findMany({ select: { id: true } });
  
  console.log(`📈 Current data: ${existingUsers.length} users, ${existingPackages.length} packages, ${existingTrips.length} trips`);

  // Hash password for all users
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  // First seed the original users from listings
  console.log('👥 Seeding original users...');
  const createdUsers = [];
  const existingUserIds = new Set(existingUsers.map(u => u.id));
  
  for (const userData of users) {
    if (existingUserIds.has(userData.id)) {
      console.log(`⏭️ Skipping existing user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      const existingUser = await prisma.user.findUnique({ where: { id: userData.id } });
      createdUsers.push(existingUser!);
      continue;
    }

    const { profile, ...userFields } = userData;
    
    const user = await prisma.user.create({
      data: {
        id: userFields.id,
        email: userFields.email,
        firstName: userFields.firstName,
        lastName: userFields.lastName,
        role: userFields.role as UserRole,
        password: hashedPassword,
        isActive: userFields.isActive,
        isVerified: userFields.isVerified,
        avatar: userFields.avatar,
        createdAt: new Date(userFields.createdAt),
        profile: {
          create: profile
        }
      }
    });
    createdUsers.push(user);
    console.log(`✅ Created original user: ${user.firstName} ${user.lastName} (${user.email})`);
  }

  // Create additional admin user if not exists
  const adminExists = await prisma.user.findUnique({ where: { id: "admin_001" } });
  let adminUser;
  if (adminExists) {
    console.log(`⏭️ Admin user already exists: ${adminExists.firstName} ${adminExists.lastName}`);
    adminUser = adminExists;
  } else {
    adminUser = await prisma.user.create({
      data: {
        id: "admin_001",
        email: "admin@sendmame.com",
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        password: hashedPassword,
        isActive: true,
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date('2024-01-01T00:00:00Z'),
        profile: {
          create: {
            bio: "System administrator",
            occupation: "Administrator",
            currentCity: "San Francisco",
            currentCountry: "USA",
            languages: ["English"],
            senderRating: 5.0,
            travelerRating: 5.0,
            totalTrips: 0,
            totalDeliveries: 0
          }
        }
      }
    });
    console.log(`✅ Created admin user: ${adminUser.firstName} ${adminUser.lastName}`);
  }
  createdUsers.push(adminUser);

  // Generate additional 50+ diverse users
  console.log('👥 Generating 50+ additional diverse users...');
  const roles = [UserRole.SENDER, UserRole.TRAVELER, UserRole.SENDER, UserRole.TRAVELER]; // More senders/travelers
  const occupations = [
    'Software Engineer', 'Teacher', 'Doctor', 'Lawyer', 'Artist', 'Designer', 'Marketing Manager',
    'Sales Representative', 'Consultant', 'Entrepreneur', 'Student', 'Photographer', 'Writer',
    'Nurse', 'Architect', 'Chef', 'Pilot', 'Engineer', 'Scientist', 'Journalist'
  ];
  
  let userIdCounter = 0;
  // Get the next available user ID
  const nextUserIdBase = await getNextSequentialId('user', 'generated_user_');
  const startingUserNumber = parseInt(nextUserIdBase.replace('generated_user_', ''));
  
  for (let i = 0; i < 500; i++) {
    const { firstName, lastName } = generateRandomName();
    const email = generateRandomEmail(firstName, lastName);
    const location = generateRandomCity();
    const role = roles[Math.floor(Math.random() * roles.length)];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    
    // Check if email already exists
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) continue;
    
    const userId = `generated_user_${String(startingUserNumber + userIdCounter).padStart(3, '0')}`;
    userIdCounter++;
    
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        firstName,
        lastName,
        role,
        password: hashedPassword,
        isActive: Math.random() > 0.1, // 90% active
        isVerified: Math.random() > 0.3, // 70% verified
        avatar: `https://images.unsplash.com/photo-${1500000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date within last year
        profile: {
          create: {
            bio: `${occupation} passionate about connecting with people through travel and deliveries`,
            occupation,
            currentCity: location.city,
            currentCountry: location.country,
            languages: ['English', ...(Math.random() > 0.5 ? ['Spanish', 'French', 'German'].slice(0, Math.floor(Math.random() * 3)) : [])],
            senderRating: Math.random() * 2 + 3, // 3-5 rating
            travelerRating: Math.random() * 2 + 3, // 3-5 rating
            totalTrips: Math.floor(Math.random() * 50),
            totalDeliveries: Math.floor(Math.random() * 30)
          }
        }
      }
    });
    createdUsers.push(user);
    if (i % 10 === 0) console.log(`✅ Generated ${i} users so far...`);
  }
  console.log(`✅ Total users now: ${createdUsers.length}`);

  // Generate 50+ wallets for all users
  console.log('💳 Seeding wallets for all users...');
  for (const user of createdUsers) {
    const existingWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (existingWallet) {
      continue;
    }

    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: Math.random() * 2000 + 50, // Random balance between 50-2050
        currency: "USD",
        pendingIn: Math.random() * 300,
        pendingOut: Math.random() * 150,
        isLocked: Math.random() > 0.95 // 5% locked
      }
    });
  }
  console.log('✅ Wallets created for all users');

  // Generate 50+ diverse payment methods
  console.log('💳 Generating 500+ diverse payment methods...');
  const paymentProviders = ['stripe', 'flutterwave', 'paystack', 'coinbase', 'binance', 'paypal', 'wise'];
  const cardBrands = ['Visa', 'Mastercard', 'Amex', 'Discover'];
  const mobileMoneyProviders = ['MTN Mobile Money', 'Vodacom M-Pesa', 'Airtel Money', 'Orange Money', 'Tigo Pesa'];
  const cryptoTypes = ['Bitcoin Wallet', 'Ethereum Wallet', 'USDT Wallet', 'BNB Wallet'];
  const banks = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'GTBank Nigeria', 'Standard Bank', 'ABSA Bank'];

  const existingPaymentMethods = await prisma.paymentMethod.findMany({ select: { id: true } });
  
  for (let i = existingPaymentMethods.length; i < 70; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const types = ['card', 'bank_account', 'mobile_money', 'crypto', 'digital_wallet'];
    const type = types[Math.floor(Math.random() * types.length)];
    const provider = paymentProviders[Math.floor(Math.random() * paymentProviders.length)];
    
    const pmData: any = {
      id: `pm_gen_${String(i).padStart(3, '0')}`,
      userId: user.id,
      type,
      provider,
      isDefault: Math.random() > 0.8,
      isActive: Math.random() > 0.1
    };

    switch (type) {
      case 'card':
        pmData.last4 = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        pmData.brand = cardBrands[Math.floor(Math.random() * cardBrands.length)];
        pmData.expiryMonth = Math.floor(Math.random() * 12) + 1;
        pmData.expiryYear = 2024 + Math.floor(Math.random() * 5);
        break;
      case 'bank_account':
        pmData.bankName = banks[Math.floor(Math.random() * banks.length)];
        pmData.accountNumber = `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        break;
      case 'mobile_money':
        pmData.bankName = mobileMoneyProviders[Math.floor(Math.random() * mobileMoneyProviders.length)];
        pmData.accountNumber = `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        break;
      case 'crypto':
        pmData.bankName = cryptoTypes[Math.floor(Math.random() * cryptoTypes.length)];
        pmData.accountNumber = pmData.bankName.includes('Bitcoin') ? 
          `bc1q****${Math.random().toString(36).substr(2, 6)}` :
          `0x****${Math.random().toString(36).substr(2, 6)}`;
        break;
    }

    pmData.gatewayId = `${provider}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await prisma.paymentMethod.create({ data: pmData });
      if (i % 15 === 0) console.log(`✅ Generated ${i} payment methods so far...`);
    } catch (_error) {
      // Skip if duplicate
      continue;
    }
  }
  console.log('✅ Payment methods generated');

  // Generate verification documents - ensuring each user has all 5 required types
  console.log('📄 Generating verification documents (5 per user)...');
  const requiredDocTypes = [
    { type: 'email', category: 'email' },
    { type: 'phone', category: 'phone' },
    { type: 'national_id', category: 'id' },
    { type: 'utility_bill', category: 'address' },
    { type: 'facial_photo', category: 'facial' }
  ];
  
  const additionalDocTypes = [
    { type: 'drivers_license', category: 'id' },
    { type: 'passport', category: 'id' },
    { type: 'bank_statement', category: 'address' },
    { type: 'lease_agreement', category: 'address' }
  ];
  
  const verificationStatuses = [VerificationStatus.VERIFIED, VerificationStatus.PENDING, VerificationStatus.REJECTED];
  
  // Get the next available verification document ID
  let verificationIdCounter = 0;
  const nextVerificationIdBase = await getNextSequentialId('verificationDocument', 'vdoc_req_');
  const startingVerificationNumber = parseInt(nextVerificationIdBase.replace('vdoc_req_', ''));

  // First, ensure each user has all 5 required verification types
  for (const user of createdUsers) {
    for (const docInfo of requiredDocTypes) {
      const status = verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)];
      
      const docData: any = {
        id: `vdoc_req_${String(startingVerificationNumber + verificationIdCounter).padStart(4, '0')}`,
        userId: user.id,
        type: docInfo.type,
        documentUrl: docInfo.type === 'email' 
          ? null 
          : docInfo.type === 'phone' 
          ? null 
          : `https://example.com/docs/${docInfo.type}_${user.id}_${startingVerificationNumber + verificationIdCounter}.jpg`,
        status,
        metadata: {
          uploadSource: Math.random() > 0.5 ? "mobile_app" : "web_app",
          fileSize: ['email', 'phone'].includes(docInfo.type) ? null : Math.floor(Math.random() * 5000000) + 1000000,
          documentType: docInfo.type,
          category: docInfo.category,
          hasBackDocument: ["national_id", "drivers_license"].includes(docInfo.type),
          // For email/phone, store verification codes and timestamps
          ...(docInfo.type === 'email' && {
            verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
            verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null
          }),
          ...(docInfo.type === 'phone' && {
            verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
            verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
            phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
          })
        }
      };

      // Add back document URL for IDs and licenses
      if (["national_id", "drivers_license"].includes(docInfo.type)) {
        docData.backDocumentUrl = `https://example.com/docs/${docInfo.type}_${user.id}_${startingVerificationNumber + verificationIdCounter}_back.jpg`;
      }

      try {
        await prisma.verificationDocument.create({ data: docData });
        verificationIdCounter++;
      } catch (_error) {
        console.log(`⚠️  Skipped duplicate verification document for user ${user.id}`);
        continue;
      }
    }
    
    if (verificationIdCounter % 25 === 0) console.log(`✅ Generated ${verificationIdCounter} verification documents so far...`);
  }

  // Add some additional random documents to reach our target
  const remainingDocs = Math.max(0, 50 - verificationIdCounter);
  for (let i = 0; i < remainingDocs; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const docInfo = additionalDocTypes[Math.floor(Math.random() * additionalDocTypes.length)];
    const status = verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)];
    
    const docData: any = {
      id: `vdoc_ext_${String(startingVerificationNumber + verificationIdCounter).padStart(4, '0')}`,
      userId: user.id,
      type: docInfo.type,
      documentUrl: `https://example.com/docs/${docInfo.type}_${user.id}_${startingVerificationNumber + verificationIdCounter}.jpg`,
      status,
      metadata: {
        uploadSource: Math.random() > 0.5 ? "mobile_app" : "web_app",
        fileSize: Math.floor(Math.random() * 5000000) + 1000000,
        documentType: docInfo.type,
        category: docInfo.category,
        hasBackDocument: ["national_id", "drivers_license"].includes(docInfo.type)
      }
    };

    // Add back document URL for IDs and licenses
    if (["national_id", "drivers_license"].includes(docInfo.type)) {
      docData.backDocumentUrl = `https://example.com/docs/${docInfo.type}_${user.id}_${startingVerificationNumber + verificationIdCounter}_back.jpg`;
    }

    try {
      await prisma.verificationDocument.create({ data: docData });
      verificationIdCounter++;
    } catch (_error) {
      continue;
    }
  }
  console.log('✅ Verification documents generated');

  // Generate disputes for realistic testing
  console.log('⚖️ Generating disputes...');
  const disputeTypes = ['non_delivery', 'damaged_package', 'payment_issue', 'package_mismatch', 'late_delivery'];
  const disputeStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'] as const;
  
  // Get the next available dispute ID
  let disputeIdCounter = 0;
  const nextDisputeIdBase = await getNextSequentialId('dispute', 'dispute_');
  const startingDisputeNumber = parseInt(nextDisputeIdBase.replace('dispute_', ''));
  
  // Create 10-15 disputes from random users about packages/trips
  const numberOfDisputes = Math.floor(Math.random() * 6) + 10; // 10-15 disputes
  
  for (let i = 0; i < numberOfDisputes; i++) {
    const reporter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const involved = createdUsers.filter(u => u.id !== reporter.id)[Math.floor(Math.random() * (createdUsers.length - 1))];
    const disputeType = disputeTypes[Math.floor(Math.random() * disputeTypes.length)];
    const status = disputeStatuses[Math.floor(Math.random() * disputeStatuses.length)];
    
    const disputeDescriptions = {
      'non_delivery': [
        'Package was never delivered despite showing as completed',
        'Traveler marked as delivered but I never received the package',
        'No communication from traveler, package whereabouts unknown'
      ],
      'damaged_package': [
        'Package arrived severely damaged with broken contents',
        'Items were wet and damaged during transport',
        'Package was crushed and contents are unusable'
      ],
      'payment_issue': [
        'Payment was processed but service was not provided',
        'Requesting refund for cancelled delivery',
        'Double charged for the same package delivery'
      ],
      'package_mismatch': [
        'Received wrong package, not what I sent',
        'Package contents different from what was agreed',
        'Missing items from the original package'
      ],
      'late_delivery': [
        'Package delivered 2 weeks after promised date',
        'Urgent delivery was significantly delayed',
        'Missed important deadline due to late delivery'
      ]
    };
    
    const description = disputeDescriptions[disputeType as keyof typeof disputeDescriptions][
      Math.floor(Math.random() * disputeDescriptions[disputeType as keyof typeof disputeDescriptions].length)
    ];
    
    const evidence = [
      `https://example.com/evidence/dispute_${startingDisputeNumber + disputeIdCounter}_photo1.jpg`,
      `https://example.com/evidence/dispute_${startingDisputeNumber + disputeIdCounter}_photo2.jpg`
    ];
    
    const disputeData = {
      id: `dispute_${String(startingDisputeNumber + disputeIdCounter).padStart(3, '0')}`,
      reporterId: reporter.id,
      involvedId: involved.id,
      packageId: Math.random() > 0.3 ? null : null, // We'll link to packages later if needed
      tripId: Math.random() > 0.3 ? null : null,    // We'll link to trips later if needed
      type: disputeType,
      description,
      evidence,
      status,
      resolution: status === 'RESOLVED' || status === 'CLOSED' ? 
        'Issue resolved through mediation. Both parties satisfied with outcome.' : null,
      assignedAdminId: Math.random() > 0.5 ? adminUser.id : null,
      resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? 
        new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) : null,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
    };
    
    try {
      await prisma.dispute.create({ data: disputeData });
      disputeIdCounter++;
      console.log(`✅ Created dispute: ${disputeType} - ${status}`);
    } catch (error) {
      console.error(`⚠️  Failed to create dispute:`, error);
      continue;
    }
  }
  
  console.log(`✅ Generated ${disputeIdCounter} disputes`);

  // Seed original packages from listings
  console.log('📦 Seeding original packages...');
  const createdPackages = [];
  
  for (const packageData of packages) {
    // Ensure unique ID - if it exists, generate a new one
    const uniqueId = await ensureUniqueId('package', packageData.id, 'pkg_orig_');
    
    const pkg = await prisma.package.create({
      data: {
        id: uniqueId,
        senderId: packageData.senderId,
        title: packageData.title,
        description: packageData.description,
        category: packageData.category,
        value: packageData.value,
        isFragile: packageData.isFragile,
        requiresSignature: packageData.requiresSignature,
        pickupLatitude: packageData.pickupLatitude,
        pickupLongitude: packageData.pickupLongitude,
        deliveryLatitude: packageData.deliveryLatitude,
        deliveryLongitude: packageData.deliveryLongitude,
        offeredPrice: packageData.offeredPrice,
        currency: packageData.currency,
        status: packageData.status as PackageStatus,
        priority: packageData.priority,
        specialInstructions: packageData.specialInstructions,
        images: packageData.images,
        createdAt: new Date(packageData.createdAt),
        pickupDate: new Date(packageData.pickupDate),
        deliveryDate: new Date(packageData.deliveryDate),
        dimensions: packageData.dimensions,
        pickupAddress: packageData.pickupAddress,
        deliveryAddress: packageData.deliveryAddress
      }
    });
    createdPackages.push(pkg);
  }

  // Generate 50+ additional packages
  console.log('📦 Generating 150+ additional packages...');
  const categories = ['Electronics', 'Documents', 'Fashion', 'Books', 'Food', 'Gifts', 'Toys', 'Sports', 'Medical', 'Art'];
  const priorities = ['low', 'normal', 'high', 'urgent'];
  const packageStatuses = [PackageStatus.DRAFT, PackageStatus.POSTED, PackageStatus.MATCHED, PackageStatus.IN_TRANSIT, PackageStatus.DELIVERED];
  
  let packageIdCounter = 0;
  // Get the next available package ID
  const nextPackageIdBase = await getNextSequentialId('package', 'pkg_gen_');
  const startingPackageNumber = parseInt(nextPackageIdBase.replace('pkg_gen_', ''));
  
  for (let i = 0; i < 500; i++) {
    const sender = createdUsers.find(u => u.role === 'SENDER') || createdUsers[0];
    const pickupLocation = generateRandomCity();
    const deliveryLocation = generateRandomCity();
    const pickupCoords = generateCoordinates();
    const deliveryCoords = generateCoordinates();
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const packageData = {
      id: `pkg_gen_${String(startingPackageNumber + packageIdCounter).padStart(3, '0')}`,
      senderId: sender.id,
      title: `${category} Package #${startingPackageNumber + packageIdCounter}`,
      description: `Reliable delivery needed for ${category.toLowerCase()} items. Handle with care.`,
      category,
      value: Math.random() * 1000 + 50,
      isFragile: Math.random() > 0.7,
      requiresSignature: Math.random() > 0.6,
      pickupLatitude: pickupCoords.latitude,
      pickupLongitude: pickupCoords.longitude,
      deliveryLatitude: deliveryCoords.latitude,
      deliveryLongitude: deliveryCoords.longitude,
      offeredPrice: Math.random() * 200 + 20,
      currency: 'USD',
      status: packageStatuses[Math.floor(Math.random() * packageStatuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      specialInstructions: Math.random() > 0.5 ? 'Handle with care, fragile contents' : null,
      images: [`https://images.unsplash.com/photo-${1500000000 + Math.floor(Math.random() * 100000000)}?w=400&h=300&fit=crop`],
      pickupDate: new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Next 30 days
      deliveryDate: new Date(Date.now() + Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)), // Next 60 days
      dimensions: {
        length: Math.floor(Math.random() * 50) + 10,
        width: Math.floor(Math.random() * 40) + 10,
        height: Math.floor(Math.random() * 30) + 5,
        weight: Math.random() * 20 + 1
      },
      pickupAddress: {
        street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
        city: pickupLocation.city,
        state: pickupLocation.state,
        country: pickupLocation.country,
        postalCode: String(Math.floor(Math.random() * 99999) + 10000)
      },
      deliveryAddress: {
        street: `${Math.floor(Math.random() * 9999) + 1} Oak Ave`,
        city: deliveryLocation.city,
        state: deliveryLocation.state,
        country: deliveryLocation.country,
        postalCode: String(Math.floor(Math.random() * 99999) + 10000)
      }
    };

    try {
      const pkg = await prisma.package.create({ data: packageData });
      createdPackages.push(pkg);
      packageIdCounter++;
      if (i % 15 === 0) console.log(`✅ Generated ${i} packages so far...`);
    } catch (_error) {
      continue;
    }
  }
  console.log(`✅ Total packages: ${createdPackages.length}`);

  // Seed original trips from listings
  console.log('✈️ Seeding original trips...');
  const createdTrips = [];
  
  for (const tripData of trips) {
    // Ensure unique ID - if it exists, generate a new one
    const uniqueId = await ensureUniqueId('trip', tripData.id, 'trip_orig_');

    const trip = await prisma.trip.create({
      data: {
        id: uniqueId,
        title: tripData.title,
        travelerId: tripData.travelerId,
        originLatitude: tripData.originLatitude,
        originLongitude: tripData.originLongitude,
        destinationLatitude: tripData.destinationLatitude,
        destinationLongitude: tripData.destinationLongitude,
        maxWeight: tripData.maxWeight,
        availableSpace: tripData.availableSpace,
        transportMode: tripData.transportMode,
        pricePerKg: tripData.pricePerKg,
        minimumPrice: tripData.minimumPrice,
        maximumPrice: tripData.maximumPrice,
        status: tripData.status as TripStatus,
        packageTypes: tripData.packageTypes,
        restrictions: tripData.restrictions,
        images: tripData.images,
        createdAt: new Date(tripData.createdAt),
        departureDate: new Date(tripData.departureDate),
        arrivalDate: new Date(tripData.arrivalDate),
        maxDimensions: tripData.maxDimensions,
        originAddress: tripData.originAddress,
        destinationAddress: tripData.destinationAddress,
        flexibleDates: false
      }
    });
    createdTrips.push(trip);
  }

  // Generate 50+ additional trips
  console.log('✈️ Generating 500+ additional trips...');
  const transportModes = ['plane', 'car', 'train', 'bus', 'ship'];
  const tripStatuses = [TripStatus.POSTED, TripStatus.ACTIVE, TripStatus.COMPLETED, TripStatus.CANCELLED];
  const packageTypesOptions = [
    ['Electronics', 'Documents'],
    ['Fashion', 'Books'],
    ['Food', 'Gifts'],
    ['Electronics', 'Fashion', 'Documents'],
    ['All types accepted']
  ];
  
  let tripIdCounter = 0;
  // Get the next available trip ID
  const nextTripIdBase = await getNextSequentialId('trip', 'trip_gen_');
  const startingTripNumber = parseInt(nextTripIdBase.replace('trip_gen_', ''));
  
  for (let i = 0; i < 500; i++) {
    const traveler = createdUsers.find(u => u.role === 'TRAVELER') || createdUsers[1];
    const originLocation = generateRandomCity();
    const destLocation = generateRandomCity();
    const originCoords = generateCoordinates();
    const destCoords = generateCoordinates();
    const transportMode = transportModes[Math.floor(Math.random() * transportModes.length)];
    
    const tripData = {
      id: `trip_gen_${String(startingTripNumber + tripIdCounter).padStart(3, '0')}`,
      title: `${transportMode.charAt(0).toUpperCase() + transportMode.slice(1)} Trip: ${originLocation.city} to ${destLocation.city}`,
      travelerId: traveler.id,
      originLatitude: originCoords.latitude,
      originLongitude: originCoords.longitude,
      destinationLatitude: destCoords.latitude,
      destinationLongitude: destCoords.longitude,
      maxWeight: Math.floor(Math.random() * 30) + 5,
      availableSpace: Math.floor(Math.random() * 25) + 3,
      transportMode,
      pricePerKg: Math.random() * 15 + 5,
      minimumPrice: Math.random() * 50 + 25,
      maximumPrice: Math.random() * 200 + 100,
      status: tripStatuses[Math.floor(Math.random() * tripStatuses.length)],
      packageTypes: packageTypesOptions[Math.floor(Math.random() * packageTypesOptions.length)],
      restrictions: Math.random() > 0.5 ? ['No liquids', 'No hazardous materials'] : [],
      images: [`https://images.unsplash.com/photo-${1400000000 + Math.floor(Math.random() * 200000000)}?w=400&h=300&fit=crop`],
      departureDate: new Date(Date.now() + Math.floor(Math.random() * 45 * 24 * 60 * 60 * 1000)),
      arrivalDate: new Date(Date.now() + Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)),
      flexibleDates: Math.random() > 0.6,
      maxDimensions: {
        length: Math.floor(Math.random() * 80) + 20,
        width: Math.floor(Math.random() * 60) + 20,
        height: Math.floor(Math.random() * 40) + 10
      },
      originAddress: {
        street: `${Math.floor(Math.random() * 999) + 1} ${transportMode} Terminal`,
        city: originLocation.city,
        state: originLocation.state,
        country: originLocation.country,
        postalCode: String(Math.floor(Math.random() * 99999) + 10000)
      },
      destinationAddress: {
        street: `${Math.floor(Math.random() * 999) + 1} Arrival Terminal`,
        city: destLocation.city,
        state: destLocation.state,
        country: destLocation.country,
        postalCode: String(Math.floor(Math.random() * 99999) + 10000)
      }
    };

    try {
      const trip = await prisma.trip.create({ data: tripData });
      createdTrips.push(trip);
      tripIdCounter++;
      if (i % 15 === 0) console.log(`✅ Generated ${i} trips so far...`);
    } catch (_error) {
      continue;
    }
  }
  console.log(`✅ Total trips: ${createdTrips.length}`);

  // Generate 50+ transactions
  console.log('💰 Generating 800+ transactions...');
  const txnTypes = [TransactionType.PAYMENT, TransactionType.PAYOUT, TransactionType.DEPOSIT, TransactionType.WITHDRAWAL, TransactionType.REFUND];
  const txnStatuses = [PaymentStatus.COMPLETED, PaymentStatus.PENDING, PaymentStatus.FAILED];
  
  for (let i = 0; i < 800; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const type = txnTypes[Math.floor(Math.random() * txnTypes.length)];
    const status = txnStatuses[Math.floor(Math.random() * txnStatuses.length)];
    const amount = Math.random() * 500 + 10;
    
    try {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type,
          amount,
          currency: 'USD',
          status,
          netAmount: amount * 0.97,
          platformFee: amount * 0.025,
          gatewayFee: amount * 0.005,
          description: `${type.toLowerCase()} transaction`,
          processedAt: status === PaymentStatus.COMPLETED ? new Date() : null
        }
      });
      if (i % 20 === 0) console.log(`✅ Generated ${i} transactions so far...`);
    } catch (_error) {
      continue;
    }
  }
  console.log('✅ Transactions generated');

  // Generate 100+ comprehensive chats with lengthy conversations
  console.log('💬 Generating 100+ comprehensive chats with extensive conversations...');
  
  const chatTemplates = [
    {
      type: 'PACKAGE_NEGOTIATION',
      scenario: 'package_delivery_inquiry',
      messages: [
        { role: 'sender', content: "Hi there! I noticed you're traveling from {origin} to {destination} on {date}. I have a package that needs to be delivered on that route. Are you available to help?" },
        { role: 'traveler', content: "Hello! Yes, I'm traveling on that date. I'd be happy to help with your package delivery. Can you tell me more about what you need to send?" },
        { role: 'sender', content: "It's a {category} package, approximately {weight}kg and dimensions are {dimensions}. The value is around ${value} so I need someone reliable. The pickup is from {pickup_address} and delivery to {delivery_address}." },
        { role: 'traveler', content: "That sounds manageable! I have experience with {category} deliveries and I'm very careful with valuable items. What's your timeline for pickup and delivery?" },
        { role: 'sender', content: "I need it picked up by {pickup_time} and delivered within 24 hours of your arrival. The package is {fragile_status} so please handle with care. I'm offering ${price} for this delivery." },
        { role: 'traveler', content: "Perfect! I can definitely accommodate that timeline. For {fragile_status} items, I always use extra padding and secure storage in my luggage. The price works for me. Do you need any special handling instructions?" },
        { role: 'sender', content: "Yes, please keep it upright during transport and avoid extreme temperatures. The recipient will need to show ID for pickup. I'll also need photo confirmation when you collect and deliver the package." },
        { role: 'traveler', content: "Absolutely! I always provide photo updates during pickup and delivery. I'll make sure to keep it upright and climate-controlled. When would be a good time to meet for the handover?" },
        { role: 'sender', content: "How about {pickup_time} at {pickup_location}? I'll bring the package properly packaged with all necessary documentation. Should we exchange contact numbers for coordination?" },
        { role: 'traveler', content: "That works perfectly! Yes, let's exchange contacts. My number is +1-555-0123. I'll send you updates throughout the journey and confirm safe delivery. Looking forward to helping you out!" },
        { role: 'sender', content: "Excellent! My number is +1-555-0456. I really appreciate your help with this delivery. I'll have everything ready for pickup at the agreed time. Thank you so much!" },
        { role: 'traveler', content: "You're very welcome! I'll make sure your package gets there safely and on time. See you at {pickup_time} tomorrow. Have a great day!" }
      ]
    },
    {
      type: 'TRIP_COORDINATION',
      scenario: 'multiple_packages_coordination',
      messages: [
        { role: 'traveler', content: "Hi everyone! I'm coordinating my trip from {origin} to {destination} on {date}. I have space for {available_space}kg of packages. Who's interested in sending items?" },
        { role: 'sender1', content: "Hi! I have a {category1} package that's about {weight1}kg. It's going to {destination_area}. Would that work for your trip?" },
        { role: 'sender2', content: "I'm also interested! I have some {category2} items, roughly {weight2}kg total. They're {fragile_status} so need careful handling. Can you accommodate?" },
        { role: 'traveler', content: "Great! I can definitely handle both packages. @sender1, {destination_area} is very close to my final destination, so no problem there. @sender2, I have experience with {fragile_status} items and always pack them with extra protection." },
        { role: 'sender1', content: "Perfect! What's your rate for the {weight1}kg package? Also, I need it delivered by {deadline}. Is that feasible with your travel schedule?" },
        { role: 'traveler', content: "For {weight1}kg, my rate is ${rate1}. Given your deadline of {deadline}, that's definitely achievable. I'm arriving a day before that, so plenty of buffer time." },
        { role: 'sender2', content: "What about my {category2} items? They're more delicate and I'm willing to pay a premium for extra careful handling. What would you charge for {weight2}kg?" },
        { role: 'traveler', content: "For {fragile_status} {category2} items, I charge ${rate2} for {weight2}kg. This includes special packaging materials I bring and extra insurance coverage. Sound reasonable?" },
        { role: 'sender1', content: "That works for me! When and where can we meet for the handover? I'm flexible with timing but prefer somewhere public and convenient." },
        { role: 'sender2', content: "I'm also good with the price. I can meet whenever works best for everyone. I'll have the items professionally packed and labeled." },
        { role: 'traveler', content: "How about we all meet at {meeting_location} at {meeting_time}? It's central for all of us and has good parking. I'll bring receipts for both packages and we can exchange contact details." },
        { role: 'sender1', content: "Perfect location! I'll be there with my package and payment. Should we do cash or digital payment? Also, do you need any special documentation from me?" },
        { role: 'traveler', content: "I prefer digital payment - Venmo or PayPal work best. Just bring a copy of your ID and the recipient's contact information. I'll handle the rest of the documentation." },
        { role: 'sender2', content: "Sounds great! I'll prepare digital payment as well. My package has some customs declarations since it's international delivery - I'll bring all those documents too." },
        { role: 'traveler', content: "Excellent preparation! For international items, I always carry them in my carry-on to avoid any baggage handling issues. See you both at {meeting_time} tomorrow!" }
      ]
    },
    {
      type: 'SUPPORT',
      scenario: 'delivery_issue_resolution',
      messages: [
        { role: 'sender', content: "Hello, I need help with a delivery issue. My package was supposed to be delivered yesterday but I haven't received any updates from the traveler. Order #PKG-{package_id}." },
        { role: 'support', content: "Hi there! I'm sorry to hear about the delay with your package delivery. Let me look up order #PKG-{package_id} and see what's happening. I'll get this resolved for you right away." },
        { role: 'sender', content: "Thank you! The traveler was supposed to arrive on {expected_date} but I haven't heard anything since they confirmed pickup. I'm getting worried about my {category} package." },
        { role: 'support', content: "I understand your concern completely. I've located your order and I can see the traveler confirmed pickup on {pickup_date}. Let me contact them directly to get an immediate status update on your {category} package." },
        { role: 'support', content: "Good news! I just spoke with your traveler. Their flight was delayed by 6 hours due to weather, but they've now landed safely in {destination}. They'll be contacting you within the next 2 hours to arrange delivery." },
        { role: 'sender', content: "Oh thank goodness! I was so worried something had happened. Weather delays make perfect sense. Will they still be able to deliver today or should I expect it tomorrow?" },
        { role: 'support', content: "They confirmed they can still deliver today! They're heading to their hotel first to freshen up, then they'll reach out to coordinate the delivery time. Since it's a {fragile_status} {category} package, they want to ensure they're alert for the handover." },
        { role: 'sender', content: "That's so professional of them! I really appreciate you tracking this down for me. This was an important {category} item for my {occasion}. Should I expect any compensation for the delay?" },
        { role: 'support', content: "Absolutely! Since this was due to circumstances beyond anyone's control, we'll issue a 25% refund to your original payment method. You should see it within 3-5 business days. We also appreciate your patience!" },
        { role: 'traveler', content: "Hi! This is {traveler_name}, your traveler. I sincerely apologize for the communication gap - my phone died during the flight delay and I couldn't find a charger until now. I have your {category} package safe and sound!" },
        { role: 'sender', content: "No worries at all! Travel delays happen. I'm just glad you and my package made it safely! When would be a good time for delivery? I'm available anytime today." },
        { role: 'traveler', content: "Thank you for understanding! I'm at {hotel_location} now. I could deliver anytime between 2-8 PM today. The package is in perfect condition - I kept it in my carry-on the entire time." },
        { role: 'sender', content: "Perfect! How about 4 PM at {delivery_location}? That gives you time to rest and me time to get there. I'll bring ID and have the digital tip ready for your excellent service!" },
        { role: 'traveler', content: "4 PM at {delivery_location} works perfectly! Thank you so much for your patience and understanding. I'll see you then with your package. Have a great rest of your day!" },
        { role: 'support', content: "Wonderful to see this resolved! Thank you both for your patience and cooperation. {sender_name}, please don't hesitate to reach out if you need anything else. We're always here to help!" }
      ]
    }
  ];

  const conversationStarters = [
    "Hey! I saw your trip posting and I'm very interested in your delivery service.",
    "Hello there! I have a package that needs to go exactly where you're traveling.",
    "Hi! Your travel route is perfect for my delivery needs. Are you available to help?",
    "Good morning! I noticed you're a highly rated traveler. I have an important package to send.",
    "Hi! I'm looking for a reliable traveler for my valuable package. Can you help?",
    "Hello! Your trip timing matches perfectly with my delivery deadline. Interested?",
    "Hey! I saw your excellent reviews and would love to use your delivery service.",
    "Hi there! I have an urgent package that needs to reach your destination city."
  ];

  const responseTemplates = [
    "Hi! Thanks for reaching out. I'd be happy to help with your package delivery. Can you share more details?",
    "Hello! I do have space available for your package. What are you looking to send?",
    "Hi there! I specialize in careful package deliveries. Tell me about your item.",
    "Good to hear from you! I can definitely help. What's the package details?",
    "Hello! I'd love to assist with your delivery. What are the specifics?",
    "Hi! I have experience with valuable packages. What do you need to send?",
    "Thanks for considering me! I can accommodate your delivery. Details please?",
    "Hello! I'm very reliable with deliveries. What's your package like?"
  ];

  let chatCount = 0;

  // Generate chats for package negotiations
  for (let i = 0; i < 50; i++) {
    const sender = createdUsers.find(u => u.role === 'SENDER' || u.role === 'ADMIN') || createdUsers[0];
    const traveler = createdUsers.find(u => u.role === 'TRAVELER') || createdUsers[1];
    const package_item = createdPackages[Math.floor(Math.random() * Math.min(createdPackages.length, 20))];
    
    if (!package_item) continue;

    try {
      const chat = await prisma.chat.create({
        data: {
          type: 'PACKAGE_NEGOTIATION',
          packageId: package_item.id,
          isActive: Math.random() > 0.3
        }
      });

      // Add participants
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: sender.id, joinedAt: new Date() }
      });
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: traveler.id, joinedAt: new Date() }
      });

      // Generate 8-20 messages per chat for lengthy conversations
      const messageCount = Math.floor(Math.random() * 13) + 8; // 8-20 messages
      const template = chatTemplates[Math.floor(Math.random() * chatTemplates.length)];
      
      for (let j = 0; j < messageCount; j++) {
        let content;
        let senderId;

        if (j === 0) {
          content = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
          senderId = sender.id;
        } else if (j === 1) {
          content = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
          senderId = traveler.id;
        } else {
          // Use template messages or generate contextual responses
          const messageTemplate = template.messages[j % template.messages.length];
          const role = j % 2 === 0 ? 'sender' : 'traveler';
          senderId = role === 'sender' ? sender.id : traveler.id;
          
          content = messageTemplate.content
            .replace('{category}', package_item.category)
            .replace('{weight}', `${Math.floor(Math.random() * 10) + 1}`)
            .replace('{value}', package_item.value?.toString() || '100')
            .replace('{price}', package_item.offeredPrice.toString())
            .replace('{fragile_status}', package_item.isFragile ? 'fragile' : 'sturdy')
            .replace('{origin}', JSON.parse(package_item.pickupAddress as string).city || 'Origin City')
            .replace('{destination}', JSON.parse(package_item.deliveryAddress as string).city || 'Destination City')
            .replace('{pickup_address}', JSON.parse(package_item.pickupAddress as string).street || 'Pickup Location')
            .replace('{delivery_address}', JSON.parse(package_item.deliveryAddress as string).street || 'Delivery Location')
            .replace('{date}', package_item.pickupDate.toDateString())
            .replace('{pickup_time}', `${Math.floor(Math.random() * 12) + 9}:00 AM`)
            .replace('{dimensions}', '30x20x15cm');
        }

        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId,
            content,
            messageType: 'text',
            createdAt: new Date(Date.now() - (messageCount - j) * Math.floor(Math.random() * 60000) + 300000) // Staggered timing
          }
        });
      }

      chatCount++;
      if (chatCount % 10 === 0) console.log(`✅ Generated ${chatCount} package negotiation chats...`);
    } catch (_error) {
      continue;
    }
  }

  // Generate trip coordination chats with multiple participants
  for (let i = 0; i < 30; i++) {
    const traveler = createdUsers.find(u => u.role === 'TRAVELER') || createdUsers[1];
    const trip = createdTrips[Math.floor(Math.random() * Math.min(createdTrips.length, 20))];
    
    if (!trip) continue;

    try {
      const chat = await prisma.chat.create({
        data: {
          type: 'TRIP_COORDINATION',
          tripId: trip.id,
          isActive: Math.random() > 0.2
        }
      });

      // Add multiple participants (traveler + 2-4 senders)
      const participantCount = Math.floor(Math.random() * 3) + 2; // 2-4 participants
      const participants = [traveler];
      
      for (let p = 1; p < participantCount; p++) {
        const sender = createdUsers.filter(u => u.role === 'SENDER')[Math.floor(Math.random() * createdUsers.filter(u => u.role === 'SENDER').length)];
        if (sender) participants.push(sender);
      }

      for (const participant of participants) {
        await prisma.chatParticipant.create({
          data: { chatId: chat.id, userId: participant.id, joinedAt: new Date() }
        });
      }

      // Generate 15-30 messages for group coordination
      const messageCount = Math.floor(Math.random() * 16) + 15; // 15-30 messages
      
      for (let j = 0; j < messageCount; j++) {
        const participant = participants[Math.floor(Math.random() * participants.length)];
        let content;

        if (j === 0) {
          content = `Hi everyone! I'm planning a trip from ${JSON.parse(trip.originAddress as string).city} to ${JSON.parse(trip.destinationAddress as string).city} on ${trip.departureDate.toDateString()}. I have ${trip.availableSpace}kg of space available for packages. Who's interested?`;
        } else {
          const templates = [
            `I have a ${['small', 'medium', 'large'][Math.floor(Math.random() * 3)]} ${['electronics', 'documents', 'clothing', 'gifts', 'books'][Math.floor(Math.random() * 5)]} package that needs to go there.`,
            `What's your rate for a ${Math.floor(Math.random() * 5) + 1}kg package? I need it delivered by ${new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toDateString()}.`,
            `I'm very interested! My package is ${Math.random() > 0.5 ? 'fragile' : 'sturdy'} and worth about $${Math.floor(Math.random() * 500) + 50}. Can you handle that?`,
            `Perfect timing! I've been looking for someone reliable to deliver my ${['important', 'valuable', 'delicate', 'urgent'][Math.floor(Math.random() * 4)]} package.`,
            `What kind of insurance do you provide? My package contains ${['electronics', 'documents', 'jewelry', 'artwork'][Math.floor(Math.random() * 4)]} worth $${Math.floor(Math.random() * 1000) + 100}.`,
            `I can meet you at ${['the airport', 'downtown', 'your hotel', 'a central location'][Math.floor(Math.random() * 4)]} for pickup. What time works best?`,
            `Great! I'll prepare all the documentation and have the package professionally wrapped. Digital payment okay?`,
            `Thank you so much for coordinating this! You're making my delivery so much easier and more affordable.`,
            `I appreciate your professionalism. Looking forward to working with you on this delivery.`,
            `Perfect! I'll see everyone at the meetup. Thanks for organizing this group delivery!`
          ];
          
          content = templates[Math.floor(Math.random() * templates.length)];
        }

        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: participant.id,
            content,
            messageType: 'text',
            createdAt: new Date(Date.now() - (messageCount - j) * Math.floor(Math.random() * 120000) + 600000)
          }
        });
      }

      chatCount++;
      if (chatCount % 5 === 0) console.log(`✅ Generated ${chatCount - 50} trip coordination chats...`);
    } catch (_error) {
      continue;
    }
  }

  // Generate support chats with detailed problem resolution
  for (let i = 0; i < 20; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    
    try {
      const chat = await prisma.chat.create({
        data: {
          type: 'SUPPORT',
          isActive: Math.random() > 0.4
        }
      });

      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: user.id, joinedAt: new Date() }
      });
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: adminUser.id, joinedAt: new Date() }
      });

      // Generate 10-25 support messages with detailed problem resolution
      const messageCount = Math.floor(Math.random() * 16) + 10; // 10-25 messages
      const supportScenarios = [
        'delivery_delay', 'payment_issue', 'package_damage', 'verification_help', 
        'account_problem', 'traveler_communication', 'refund_request', 'booking_confusion'
      ];
      
      const scenario = supportScenarios[Math.floor(Math.random() * supportScenarios.length)];

      for (let j = 0; j < messageCount; j++) {
        let content;
        const senderId = j % 2 === 0 ? user.id : adminUser.id;
        
        if (j === 0) {
          const problemDescriptions = {
            delivery_delay: `Hi, I need help with my package delivery. It's been 3 days past the expected delivery date and I haven't heard from the traveler. Order #PKG-${Math.floor(Math.random() * 10000)}.`,
            payment_issue: `Hello, I'm having trouble with a payment that was supposed to be processed. The money was deducted from my account but the delivery status hasn't updated.`,
            package_damage: `Hi there, I received my package but it appears to be damaged. The box was crushed and some contents are broken. What's the next step?`,
            verification_help: `Hello, I'm having trouble with my identity verification. I've uploaded my documents multiple times but they keep getting rejected.`,
            account_problem: `Hi, I can't access my account anymore. When I try to log in, it says my account is temporarily suspended but I don't know why.`,
            traveler_communication: `Hello, the traveler who was supposed to deliver my package isn't responding to messages and missed our scheduled meetup.`,
            refund_request: `Hi, I need to request a refund for a delivery that was cancelled by the traveler at the last minute. Can you help me with this?`,
            booking_confusion: `Hello, I'm confused about my booking. I thought I confirmed a delivery but now I can't find it in my orders list.`
          };
          content = problemDescriptions[scenario as keyof typeof problemDescriptions];
        } else {
          const supportResponses = [
            "Thank you for contacting us. I understand your concern and I'm here to help resolve this issue quickly.",
            "I've looked into your account and I can see the issue. Let me work on getting this resolved for you right away.",
            "I sincerely apologize for this inconvenience. This is definitely not the experience we want for our users.",
            "I've escalated this to our specialized team and they're investigating the issue now. I'll keep you updated every step of the way.",
            "Great news! I've found a solution for your issue. Here's what we're going to do to make this right...",
            "I've processed a full refund for you, which should appear in your account within 3-5 business days.",
            "Thank you so much for your patience while we worked through this. Is there anything else I can help you with today?",
            "I really appreciate your understanding throughout this process. We value your trust in our platform."
          ];
          
          const userResponses = [
            "Thank you for the quick response! I really appreciate you looking into this so promptly.",
            "That makes sense. I understand these things can happen. What are the next steps?",
            "I'm relieved to hear you're working on it. This package is quite important to me.",
            "Perfect! That solution works great for me. You've been incredibly helpful.",
            "Thank you so much for resolving this! Your customer service is excellent.",
            "I really appreciate your patience and thorough help. This is why I love using this platform!",
            "No other issues at the moment. Thanks again for your outstanding support!",
            "You've exceeded my expectations with this service. Thank you for making it right!"
          ];
          
          content = senderId === adminUser.id ? 
            supportResponses[Math.floor(Math.random() * supportResponses.length)] :
            userResponses[Math.floor(Math.random() * userResponses.length)];
        }

        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId,
            content,
            messageType: 'text',
            createdAt: new Date(Date.now() - (messageCount - j) * Math.floor(Math.random() * 180000) + 900000)
          }
        });
      }

      chatCount++;
      if (chatCount % 5 === 0) console.log(`✅ Generated ${chatCount - 80} support chats...`);
    } catch (_error) {
      continue;
    }
  }

  console.log(`✅ Total chats generated: ${chatCount} with extensive conversations`);

  // Generate 50+ Admin-initiated chats and interventions
  console.log('👨‍💼 Generating 50+ admin interactions and communications...');
  
  // Admin dispute resolution chats
  for (let i = 0; i < 15; i++) {
    const reporter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const involved = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const package_item = createdPackages[Math.floor(Math.random() * Math.min(createdPackages.length, 10))];
    
    if (reporter.id === involved.id) continue;

    try {
      const chat = await prisma.chat.create({
        data: {
          type: 'SUPPORT',
          packageId: package_item?.id,
          isActive: true
        }
      });

      // Add all participants (reporter, involved, admin)
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: reporter.id, joinedAt: new Date() }
      });
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: involved.id, joinedAt: new Date() }
      });
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: adminUser.id, joinedAt: new Date() }
      });

      const disputeMessages = [
        { senderId: reporter.id, content: `Hello admin team, I need to report an issue with my recent delivery. The traveler ${involved.firstName} did not follow the agreed delivery terms. Package ID: ${package_item?.id || 'PKG-' + Math.floor(Math.random() * 1000)}.` },
        { senderId: adminUser.id, content: `Hi ${reporter.firstName}, thank you for reaching out. I'm taking this matter very seriously and will investigate immediately. @${involved.firstName}, could you please provide your side of the story regarding this delivery?` },
        { senderId: involved.id, content: `Hi Admin, I apologize for any confusion. There were some unexpected circumstances during the delivery that I should have communicated better. Let me explain what happened in detail...` },
        { senderId: adminUser.id, content: `Thank you both for the information. I've reviewed the delivery timeline and communications. @${involved.firstName}, while I understand there were complications, communication with the sender should have been prioritized.` },
        { senderId: reporter.id, content: `I appreciate you looking into this admin. The lack of communication was really stressful, especially since it was a valuable and time-sensitive package.` },
        { senderId: adminUser.id, content: `@${reporter.firstName}, I completely understand your frustration. Here's what we're going to do to resolve this: 1) Full refund of delivery fees, 2) Compensation for the delay, and 3) Priority handling for your next delivery.` },
        { senderId: involved.id, content: `I sincerely apologize to both ${reporter.firstName} and the admin team. I take full responsibility and will ensure better communication in all future deliveries. This won't happen again.` },
        { senderId: adminUser.id, content: `@${involved.firstName}, I appreciate your accountability. I'm issuing a formal warning and requiring you to complete our enhanced communication training before your next delivery. @${reporter.firstName}, your refund is being processed now.` },
        { senderId: reporter.id, content: `Thank you so much for handling this professionally and fairly. The resolution is perfect and I feel confident using the platform again.` },
        { senderId: adminUser.id, content: `Excellent! I'm glad we could resolve this to everyone's satisfaction. Remember, our platform thrives on trust and communication. Thank you both for working with me on this resolution.` }
      ];

      for (let j = 0; j < disputeMessages.length; j++) {
        const msgData = disputeMessages[j];
        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: msgData.senderId,
            content: msgData.content,
            messageType: 'text',
            createdAt: new Date(Date.now() - (disputeMessages.length - j) * 300000) // 5 minutes apart
          }
        });
      }

      chatCount++;
    } catch (_error) {
      continue;
    }
  }

  // Admin broadcast messages to travelers
  for (let i = 0; i < 10; i++) {
    const travelers = createdUsers.filter(u => u.role === 'TRAVELER').slice(0, 5); // Broadcast to 5 travelers
    
    try {
      const chat = await prisma.chat.create({
        data: {
          type: 'SUPPORT',
          isActive: true
        }
      });

      // Add admin and multiple travelers
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: adminUser.id, joinedAt: new Date() }
      });
      
      for (const traveler of travelers) {
        await prisma.chatParticipant.create({
          data: { chatId: chat.id, userId: traveler.id, joinedAt: new Date() }
        });
      }

      const broadcastTopics = [
        'Policy Update Announcement',
        'New Safety Guidelines',
        'Holiday Season Delivery Tips',
        'Insurance Coverage Changes',
        'Platform Feature Updates',
        'Traveler Recognition Program',
        'Emergency Contact Procedures',
        'Quality Service Reminders'
      ];

      const topic = broadcastTopics[Math.floor(Math.random() * broadcastTopics.length)];

      const broadcastMessages = [
        { senderId: adminUser.id, content: `🔔 Important ${topic} - Hello valued travelers! I hope you're all doing well. I'm reaching out today to share some important updates that will affect your deliveries going forward.` },
        { senderId: adminUser.id, content: `📋 Details: We've been working hard to improve our platform based on your feedback and changing industry standards. These updates are designed to make deliveries safer, more efficient, and more profitable for you.` },
        { senderId: adminUser.id, content: `⭐ Key Changes: 1) Enhanced insurance coverage for all deliveries over $500, 2) New real-time tracking requirements, 3) Updated communication protocols with senders, 4) Streamlined payout processes.` },
        { senderId: travelers[0].id, content: `Thanks for the update admin! The enhanced insurance coverage sounds great. Will this affect our delivery fees or is it covered by the platform?` },
        { senderId: adminUser.id, content: `Great question! The insurance enhancement is completely covered by the platform - no additional cost to you. We're investing in this because we value your partnership and want to protect both you and our senders.` },
        { senderId: travelers[1].id, content: `I love the real-time tracking update! I've had senders ask about this feature before. How exactly will this work during deliveries?` },
        { senderId: adminUser.id, content: `The tracking system will be integrated into the app. You'll simply tap 'Update Location' at key milestones - pickup, airport/transit points, and delivery. It's designed to be simple and non-intrusive to your travel.` },
        { senderId: travelers[2].id, content: `The streamlined payouts sound promising! Currently it takes 3-5 days to receive payments. Will this be faster now?` },
        { senderId: adminUser.id, content: `Absolutely! We're reducing payout time to 24-48 hours after delivery confirmation. We know faster payments help with your travel expenses and cash flow.` },
        { senderId: travelers[3].id, content: `This all sounds fantastic! When do these changes take effect? Do we need to do anything to prepare?` },
        { senderId: adminUser.id, content: `Implementation starts next Monday. You'll receive detailed guides via email, and we're offering optional training sessions this weekend. The transition should be seamless for most deliveries.` },
        { senderId: travelers[4].id, content: `I appreciate how you always keep us informed about platform changes. It shows you value us as partners in this business. Thank you admin!` },
        { senderId: adminUser.id, content: `Thank you all for being such dedicated travelers! Your feedback shapes these improvements. Please don't hesitate to reach out if you have questions about any of these changes. Safe travels everyone! 🛫✈️` }
      ];

      for (let j = 0; j < broadcastMessages.length; j++) {
        const msgData = broadcastMessages[j];
        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: msgData.senderId,
            content: msgData.content,
            messageType: 'text',
            createdAt: new Date(Date.now() - (broadcastMessages.length - j) * 240000) // 4 minutes apart
          }
        });
      }

      chatCount++;
    } catch (_error) {
      continue;
    }
  }

  // Admin guidance chats for new users
  for (let i = 0; i < 15; i++) {
    const newUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    
    try {
      const chat = await prisma.chat.create({
        data: {
          type: 'SUPPORT',
          isActive: Math.random() > 0.3
        }
      });

      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: newUser.id, joinedAt: new Date() }
      });
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: adminUser.id, joinedAt: new Date() }
      });

      const guidanceMessages = [
        { senderId: newUser.id, content: `Hi! I'm new to the platform and I'm a bit overwhelmed by all the options. Could someone help me understand how to ${newUser.role === 'SENDER' ? 'post a package for delivery' : 'start accepting delivery requests'}?` },
        { senderId: adminUser.id, content: `Hello ${newUser.firstName}! Welcome to our platform! I'm here to help you get started successfully. As a ${newUser.role.toLowerCase()}, you have some great opportunities ahead of you.` },
        { senderId: adminUser.id, content: `Let me walk you through the basics step by step: ${newUser.role === 'SENDER' ? '1) Create detailed package listings, 2) Set realistic pricing, 3) Choose reliable travelers, 4) Communicate clearly about requirements' : '1) Complete your traveler profile, 2) Post your travel routes, 3) Set competitive pricing, 4) Maintain good communication with senders'}` },
        { senderId: newUser.id, content: `That's really helpful! I'm particularly concerned about ${newUser.role === 'SENDER' ? 'package safety and insurance. How do I know my valuable items will be protected?' : 'handling valuable packages and what happens if something goes wrong during delivery?'}` },
        { senderId: adminUser.id, content: `${newUser.role === 'SENDER' ? 'Excellent question! We have comprehensive insurance coverage up to $5,000 per package, plus our travelers go through verification processes. Always use our in-app messaging for accountability.' : 'Great concern to have! All packages over $500 are automatically insured. Always document package condition with photos at pickup and delivery. We provide full support if issues arise.'}` },
        { senderId: newUser.id, content: `That's reassuring! What about ${newUser.role === 'SENDER' ? 'pricing - how do I know what to offer for delivery? I don\'t want to overpay or underpay.' : 'pricing my delivery services? I want to be competitive but also fairly compensated for my time and effort.'}` },
        { senderId: adminUser.id, content: `${newUser.role === 'SENDER' ? 'Our platform has a pricing guide based on distance, package size, and urgency. Generally, $3-8 per kg depending on route complexity. Check similar listings for market rates.' : 'I recommend starting with $5-10 per kg for standard routes, more for urgent or complex deliveries. Check what other travelers charge for similar routes to stay competitive.'}` },
        { senderId: newUser.id, content: `Perfect! One more question - what's the best way to build a good reputation on the platform? I want to be successful and trusted.` },
        { senderId: adminUser.id, content: `${newUser.role === 'SENDER' ? 'Great attitude! Be detailed in your package descriptions, responsive in communications, flexible with pickup times, and always rate travelers fairly. Good senders attract the best travelers!' : 'Wonderful question! Always communicate proactively, handle packages with extreme care, meet deadlines, provide photo updates, and go the extra mile. Happy senders become repeat customers!'}` },
        { senderId: newUser.id, content: `Thank you so much for taking the time to explain everything! I feel much more confident about getting started now. The platform seems really well-organized and supportive.` },
        { senderId: adminUser.id, content: `You're very welcome ${newUser.firstName}! I'm always here if you have questions. Remember, successful ${newUser.role.toLowerCase()}s focus on communication, reliability, and customer service. I'm excited to see you succeed on our platform! 🚀` }
      ];

      for (let j = 0; j < guidanceMessages.length; j++) {
        const msgData = guidanceMessages[j];
        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: msgData.senderId,
            content: msgData.content,
            messageType: 'text',
            createdAt: new Date(Date.now() - (guidanceMessages.length - j) * 420000) // 7 minutes apart
          }
        });
      }

      chatCount++;
    } catch (_error) {
      continue;
    }
  }

  // Admin follow-up chats for service quality
  for (let i = 0; i < 10; i++) {
    const user1 = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const user2 = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    
    if (user1.id === user2.id) continue;

    try {
      const chat = await prisma.chat.create({
        data: {
          type: 'SUPPORT',
          isActive: Math.random() > 0.4
        }
      });

      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: user1.id, joinedAt: new Date() }
      });
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: user2.id, joinedAt: new Date() }
      });
      await prisma.chatParticipant.create({
        data: { chatId: chat.id, userId: adminUser.id, joinedAt: new Date() }
      });

      const followUpMessages = [
        { senderId: adminUser.id, content: `Hi ${user1.firstName} and ${user2.firstName}! I hope your recent delivery went smoothly. I'm following up to ensure everything met your expectations and to gather any feedback you might have.` },
        { senderId: user1.id, content: `Hi admin! Yes, the delivery went really well. ${user2.firstName} was very professional and kept me updated throughout the entire process. I'm very satisfied with the service.` },
        { senderId: user2.id, content: `Thank you ${user1.firstName}! It was a pleasure working with you too. The package was well-prepared and the pickup/delivery instructions were crystal clear. Made my job much easier!` },
        { senderId: adminUser.id, content: `Wonderful to hear! This is exactly the kind of positive experience we strive for. ${user1.firstName}, was there anything about the process that could have been improved from your perspective?` },
        { senderId: user1.id, content: `Honestly, everything exceeded my expectations. The real-time updates were fantastic, and ${user2.firstName} even sent photos at key points. If anything, maybe more travelers like ${user2.firstName}! 😊` },
        { senderId: adminUser.id, content: `${user2.firstName}, from your side as the traveler, any suggestions for how we could make the delivery process smoother or more efficient for you?` },
        { senderId: user2.id, content: `The process was quite smooth overall. Maybe having a standardized checklist for package handovers would be helpful? Sometimes senders forget to mention important details that come up during pickup.` },
        { senderId: adminUser.id, content: `That's brilliant feedback! We're actually developing a digital handover checklist feature. Your suggestion validates that this would be valuable. Thank you both for the constructive input!` },
        { senderId: user1.id, content: `I'd love to use ${user2.firstName}'s services again in the future! Is there a way to request specific travelers for my deliveries?` },
        { senderId: adminUser.id, content: `Absolutely! We have a 'Preferred Traveler' feature where you can bookmark travelers you've had great experiences with. I'll send you both information about this and other loyalty features.` },
        { senderId: user2.id, content: `That sounds great! ${user1.firstName}, I'd be happy to help with your future deliveries. You make the job enjoyable with your clear communication and flexibility.` },
        { senderId: adminUser.id, content: `This is what our platform is all about - building lasting, trustworthy relationships! Thank you both for being exemplary users. Keep up the excellent work! 🌟` }
      ];

      for (let j = 0; j < followUpMessages.length; j++) {
        const msgData = followUpMessages[j];
        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: msgData.senderId,
            content: msgData.content,
            messageType: 'text',
            createdAt: new Date(Date.now() - (followUpMessages.length - j) * 360000) // 6 minutes apart
          }
        });
      }

      chatCount++;
    } catch (_error) {
      continue;
    }
  }

  console.log(`✅ Admin interactions generated: ${chatCount - 100} additional admin chats`);
  console.log(`✅ Total comprehensive chats: ${chatCount} with admin involvement`);

  // Generate 200+ diverse notifications including admin broadcasts
  console.log('🔔 Generating 200+ diverse notifications including admin broadcasts...');
  
  // First generate admin broadcast notifications for all users
  console.log('📢 Creating admin broadcast notifications for community updates...');
  
  const adminBroadcastTemplates = [
    {
      title: "🚀 New Feature: Real-Time Package Tracking",
      message: "We're excited to announce our new real-time tracking feature! Now you can follow your packages every step of the way with live GPS updates, estimated delivery times, and instant notifications. This enhancement provides complete transparency and peace of mind for both senders and travelers. Update your app to access this feature today!",
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "🛡️ Enhanced Security Measures",
      message: "Your safety is our top priority! We've implemented advanced security features including enhanced identity verification, secure payment processing with escrow protection, and improved fraud detection. All users are required to complete ID verification within 30 days. Thank you for helping us maintain a trusted community!",
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "🏆 Q4 Community Awards & Recognition",
      message: "Celebrating our amazing community! This quarter's top performers: 🥇 Sarah Chen (500+ successful deliveries), 🥈 Marcus Rodriguez (Perfect 5.0 rating), 🥉 Lisa Thompson (Community Helper Award). Thank you to all 10,000+ active members who make SendMame the most trusted delivery network. Keep up the excellent work!",
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "📱 Mobile App Update 3.2.1 Available",
      message: "Update now for the best SendMame experience! New features: Dark mode, Push notification customization, Enhanced chat interface with photo sharing, Improved search filters, Bug fixes and performance improvements. Download from your app store today. Older versions will be deprecated in 60 days.",
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "⚠️ Holiday Season Safety Guidelines",
      message: "As we enter the busy holiday season, please follow these safety tips: 📋 Always verify package contents before pickup, 💰 Use our secure payment system only, 📸 Take photos of package condition, 🚫 Never share personal financial information, ⏰ Confirm delivery windows in advance. Report any suspicious activity immediately. Safe travels everyone!",
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "💰 Referral Program: Earn $25 Per Friend!",
      message: "Spread the word and earn rewards! Our referral program now offers $25 for each friend who joins and completes their first successful delivery. Your friends get $10 off their first transaction too! Share your unique referral code in the app and start earning. No limit on referrals - some users have earned over $500 this month!",
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "🌍 Expanding to 15 New Cities!",
      message: "We're growing! SendMame is now available in Atlanta, Denver, Seattle, Miami, Boston, Austin, Portland, Nashville, Charlotte, San Antonio, Orlando, Pittsburgh, Cincinnati, Kansas City, and Las Vegas! More routes mean more opportunities for both travelers and senders. Start exploring new delivery possibilities today!",
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "📊 Community Impact Report 2024",
      message: "Together we've achieved amazing milestones! 📦 250,000+ packages delivered safely, 🌱 Reduced carbon footprint by 40% through shared travel, 💰 $2.5M earned by our traveler community, ⭐ 98.7% customer satisfaction rate, 🚀 Average delivery time: 3.2 days. Thank you for being part of our sustainable delivery revolution!",
      type: NotificationType.SYSTEM_ALERT
    }
  ];

  // Send broadcasts to all users (simulating admin broadcast functionality)
  for (const broadcast of adminBroadcastTemplates) {
    // Select random subset of users for each broadcast (simulate phased rollouts)
    const broadcastUsers = createdUsers
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(createdUsers.length * (0.7 + Math.random() * 0.3))); // 70-100% of users
    
    for (const user of broadcastUsers) {
      try {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: broadcast.type,
            title: broadcast.title,
            message: broadcast.message,
            isRead: Math.random() > 0.6, // 40% read rate for broadcasts (lower than personal notifications)
            sentAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)), // Within last 14 days
            metadata: {
              priority: 'normal',
              category: 'broadcast',
              source: 'admin',
              actionRequired: broadcast.title.includes('Update') || broadcast.title.includes('Security')
            }
          }
        });
      } catch (_error) {
        continue;
      }
    }
    console.log(`📢 Broadcast sent: ${broadcast.title} (${broadcastUsers.length} recipients)`);
  }

  // Generate personalized admin notifications for specific user actions
  console.log('👤 Creating personalized admin notifications...');
  
  const personalizedAdminNotifications = [
    {
      title: "🎉 Welcome to SendMame!",
      message: "Hi {userName}! Welcome to our trusted delivery community. We're excited to have you aboard! To get started: ✅ Complete your profile verification, 📋 Read our safety guidelines, 💬 Join our community chat for tips and support. Our team is here to help if you have any questions. Happy deliveries!",
      condition: (_user: any) => Math.random() > 0.8, // New user onboarding
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "⭐ Congratulations on Your 5-Star Rating!",
      message: "Amazing work, {userName}! You've maintained a perfect 5.0-star rating across your last 10 deliveries. Your professionalism and reliability make our community stronger. As a token of appreciation, you've earned a 'Trusted Traveler' badge and priority placement in search results. Keep up the excellent service!",
      condition: (_user: any) => Math.random() > 0.9, // High performers
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "🔄 Account Verification Required",
      message: "Hi {userName}, we need to verify some information on your account to ensure continued access to our services. Please upload a clear photo of your government-issued ID within 7 days. This helps us maintain a safe environment for all users. Contact support if you need assistance with the verification process.",
      condition: (_user: any) => Math.random() > 0.95, // Account issues
      type: NotificationType.SYSTEM_ALERT
    },
    {
      title: "💝 Special Delivery Bonus Available!",
      message: "Good news, {userName}! You have a special delivery bonus of $20 waiting for you. Complete any delivery this week to claim your bonus. This reward is based on your excellent service history and positive community feedback. Thank you for being such a valuable member of our network!",
      condition: (_user: any) => Math.random() > 0.85, // Rewards and bonuses
      type: NotificationType.SYSTEM_ALERT
    }
  ];

  for (const template of personalizedAdminNotifications) {
    for (const user of createdUsers) {
      if (template.condition(user)) {
        try {
          const message = template.message.replace('{userName}', `${user.firstName} ${user.lastName}`);
          
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: template.type,
              title: template.title,
              message,
              isRead: Math.random() > 0.5, // 50% read rate for personalized admin messages
              sentAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within last 7 days
              metadata: {
                priority: template.title.includes('Required') ? 'high' : 'normal',
                category: 'admin_personal',
                source: 'admin',
                actionRequired: template.title.includes('Required') || template.title.includes('Welcome')
              }
            }
          });
        } catch (_error) {
          continue;
        }
      }
    }
  }

  console.log('✅ Admin broadcast and personalized notifications created');

  const detailedNotificationTemplates = {
    [NotificationType.PACKAGE_MATCH]: [
      "🎉 Great news! Your package '{packageTitle}' has been matched with traveler {travelerName}. They have excellent ratings and will take great care of your delivery!",
      "✅ Package Match Found! A verified traveler is ready to deliver your {category} package from {origin} to {destination}. Check your chat for coordination details.",
      "🚀 Your delivery request has been accepted! {travelerName} will be handling your package delivery and has confirmed availability for your timeline.",
      "📦 Perfect match! We've found an experienced traveler for your {category} package. They specialize in {category} deliveries and have 5-star ratings.",
      "⭐ Excellent news! Your valuable package has been matched with one of our top-rated travelers. They'll contact you soon to arrange pickup."
    ],
    [NotificationType.TRIP_REQUEST]: [
      "📬 New delivery request for your trip from {origin} to {destination}! A sender wants you to deliver their {category} package worth ${value}.",
      "🚨 Urgent delivery request! Someone needs their {category} package delivered on your route with a generous tip included for priority handling.",
      "💼 Business delivery opportunity! A professional sender has a valuable {category} package that matches your travel schedule perfectly.",
      "🎁 Gift delivery request! Help make someone's day special by delivering their {category} gift package during your travel.",
      "📋 Document delivery needed! Important {category} documents need secure delivery on your exact travel route with premium compensation."
    ],
    [NotificationType.PAYMENT_RECEIVED]: [
      "💰 Payment confirmed! You've received ${amount} for delivering {senderName}'s package. The funds are now available in your wallet.",
      "✅ Transaction successful! ${amount} has been credited to your account for the {category} package delivery. Thank you for your excellent service!",
      "🏦 Payment processed! Your delivery fee of ${amount} plus ${tip} tip has been deposited. Your outstanding service is truly appreciated!",
      "💳 Funds received! ${amount} is now in your wallet for the completed delivery. Your professionalism made this transaction smooth and secure.",
      "🎊 Payment complete! You've earned ${amount} for your reliable delivery service. Keep up the excellent work!"
    ],
    [NotificationType.DELIVERY_CONFIRMATION]: [
      "✅ Delivery confirmed! Your {category} package has been successfully delivered to {recipientName} at {destination}. They've confirmed receipt and condition.",
      "🎯 Mission accomplished! Your package arrived safely and on time. The recipient was very pleased with the condition and punctual delivery.",
      "📦 Package delivered successfully! {travelerName} has completed the delivery and provided photo confirmation. Your item is now with {recipientName}.",
      "🌟 Perfect delivery! Your {category} package was delivered exactly as requested. The traveler maintained excellent communication throughout.",
      "✨ Delivery complete! Your valuable package has reached its destination safely. Both parties have confirmed successful completion."
    ],
    [NotificationType.MESSAGE_RECEIVED]: [
      "💬 New message from {senderName} about your {origin} → {destination} trip: 'I have an urgent {category} package that needs delivery...'",
      "📱 Message alert! {travelerName} sent an update about your package delivery: 'Currently in transit, estimated delivery in 2 hours...'",
      "🔔 Chat notification! You have a new message regarding your {category} package delivery. Please check for important coordination details.",
      "📧 Important message! {userName} needs to discuss special handling instructions for your {fragile} {category} package.",
      "💭 New conversation! A potential delivery partner wants to discuss your {category} package requirements and pricing."
    ],
    [NotificationType.SYSTEM_ALERT]: [
      "🔒 Security alert! We detected an unusual login attempt on your account from {location}. If this wasn't you, please secure your account immediately.",
      "⚠️ Account update required! Please verify your identity documents to continue using our delivery services. This helps keep our community safe.",
      "🔧 Maintenance notification! Our system will undergo scheduled maintenance from {time} to {time}. Services may be temporarily unavailable.",
      "📋 Policy update! We've updated our terms of service to better protect users and improve service quality. Please review the changes.",
      "🎉 New feature alert! We've added real-time package tracking and enhanced chat features to improve your delivery experience!"
    ]
  };

  const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'London, UK', 'Paris, France', 'Tokyo, Japan'];
  const amounts = [25, 30, 45, 50, 75, 85, 100, 120, 150, 200];
  const tips = [5, 10, 15, 20, 25];
  
  for (let i = 0; i < 250; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const notificationTypes = Object.values(NotificationType);
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const templates = detailedNotificationTemplates[type];
    
    if (!templates) continue;
    
    const title = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let message = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace template variables with random data
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const randomPackage = createdPackages[Math.floor(Math.random() * Math.min(createdPackages.length, 10))];
    const randomTrip = createdTrips[Math.floor(Math.random() * Math.min(createdTrips.length, 10))];
    
    message = message
      .replace('{packageTitle}', randomPackage?.title || 'Electronics Package')
      .replace('{travelerName}', `${randomUser.firstName} ${randomUser.lastName}`)
      .replace('{senderName}', `${randomUser.firstName} ${randomUser.lastName}`)
      .replace('{recipientName}', `${randomUser.firstName} ${randomUser.lastName}`)
      .replace('{userName}', `${randomUser.firstName} ${randomUser.lastName}`)
      .replace('{category}', randomPackage?.category || 'Electronics')
      .replace('{origin}', locations[Math.floor(Math.random() * locations.length)])
      .replace('{destination}', locations[Math.floor(Math.random() * locations.length)])
      .replace('{value}', randomPackage?.value?.toString() || '150')
      .replace('{amount}', amounts[Math.floor(Math.random() * amounts.length)].toString())
      .replace('{tip}', tips[Math.floor(Math.random() * tips.length)].toString())
      .replace('{location}', locations[Math.floor(Math.random() * locations.length)])
      .replace('{time}', `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`)
      .replace('{fragile}', Math.random() > 0.5 ? 'fragile' : 'valuable');

    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type,
          title,
          message,
          packageId: type === NotificationType.PACKAGE_MATCH || type === NotificationType.DELIVERY_CONFIRMATION ? randomPackage?.id : undefined,
          tripId: type === NotificationType.TRIP_REQUEST ? randomTrip?.id : undefined,
          isRead: Math.random() > 0.4, // 60% read rate
          sentAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Within last 30 days
          metadata: {
            priority: Math.random() > 0.8 ? 'high' : 'normal',
            category: type.toLowerCase(),
            actionRequired: Math.random() > 0.7
          }
        }
      });
      
      if (i % 50 === 0) console.log(`✅ Generated ${i} detailed notifications...`);
    } catch (_error) {
      continue;
    }
  }
  
  console.log('✅ Comprehensive notifications generated with realistic content');

  // Generate additional chat participants and group conversations
  console.log('👥 Adding participants to existing chats for group conversations...');
  
  const existingChats = await prisma.chat.findMany({
    where: { type: 'TRIP_COORDINATION' },
    take: 20
  });

  for (const chat of existingChats) {
    // Add 1-3 additional participants to make group chats more realistic
    const additionalParticipants = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < additionalParticipants; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      try {
        await prisma.chatParticipant.create({
          data: {
            chatId: chat.id,
            userId: user.id,
            joinedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
          }
        });

        // Add some join messages
        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: user.id,
            content: `Hi everyone! Just joined this group. I'm also interested in coordinating deliveries on this route. Any space left?`,
            messageType: 'text',
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 6 * 24 * 60 * 60 * 1000))
          }
        });
      } catch (_error) {
        continue;
      }
    }
  }

  console.log('✅ Enhanced chat groups with additional participants');
  
  // Add final count of chats and messages for better insight
  const chatSummary = {
    chats: await prisma.chat.count(),
    messages: await prisma.message.count(),
    chatParticipants: await prisma.chatParticipant.count()
  };

  console.log(`💬 Chat System Summary:`);
  console.log(`   🗣️ Total Chats: ${chatSummary.chats}`);
  console.log(`   💭 Total Messages: ${chatSummary.messages}`);
  console.log(`   👥 Chat Participants: ${chatSummary.chatParticipants}`);
  console.log(`   🎯 Admin Involvement: Dispute resolution, broadcasts, user guidance, quality follow-ups`);
  console.log(`   📊 Message Variety: 8-30 messages per chat with realistic conversation flows`);

  console.log('🎉 Comprehensive database seeding completed!');
  
  // Generate final summary
  const summary = {
    users: await prisma.user.count(),
    packages: await prisma.package.count(),
    trips: await prisma.trip.count(),
    wallets: await prisma.wallet.count(),
    paymentMethods: await prisma.paymentMethod.count(),
    verificationDocs: await prisma.verificationDocument.count(),
    transactions: await prisma.transaction.count(),
    notifications: await prisma.notification.count()
  };

  console.log(`📊 Final Summary:`);
  console.log(`   👥 Users: ${summary.users}`);
  console.log(`   📦 Packages: ${summary.packages}`);
  console.log(`   ✈️ Trips: ${summary.trips}`);
  console.log(`   💳 Wallets: ${summary.wallets}`);
  console.log(`   💳 Payment Methods: ${summary.paymentMethods}`);
  console.log(`   📄 Verification Documents: ${summary.verificationDocs}`);
  console.log(`   💰 Transactions: ${summary.transactions}`);
  console.log(`   🔔 Notifications: ${summary.notifications}`);
  console.log(`   🔑 Default password for all users: password123`);
  console.log(`   🔧 Admin email: admin@sendmame.com`);
}

main()
  .catch((e) => {
    console.error('❌ Error during comprehensive seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
