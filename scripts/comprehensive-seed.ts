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
  DisputeStatus,
  ChatType,
  VerificationStatus
} from '@prisma/client';

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // Check existing data instead of clearing
  console.log('📊 Checking existing data...');
  const existingUsers = await prisma.user.findMany({ select: { id: true } });
  const existingPackages = await prisma.package.findMany({ select: { id: true } });
  const existingTrips = await prisma.trip.findMany({ select: { id: true } });
  
  console.log(`📈 Current data: ${existingUsers.length} users, ${existingPackages.length} packages, ${existingTrips.length} trips`);

  // Hash password for all users
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  // Seed Users with profiles (check for existing users first)
  console.log('👥 Seeding users...');
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
    console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
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

  // Seed Wallets for all users (check for existing wallets)
  console.log('💳 Seeding wallets...');
  for (const user of createdUsers) {
    const existingWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (existingWallet) {
      console.log(`⏭️ Wallet already exists for ${user.firstName}: $${existingWallet.balance.toFixed(2)}`);
      continue;
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: Math.random() * 1000 + 100, // Random balance between 100-1100
        currency: "USD",
        pendingIn: Math.random() * 200,
        pendingOut: Math.random() * 100,
        isLocked: false
      }
    });
    console.log(`✅ Created wallet for ${user.firstName}: $${wallet.balance.toFixed(2)}`);
  }

  // Seed Payment Methods (expanded variety)
  console.log('💳 Seeding payment methods...');
  const paymentMethodsData = [
    // Traditional Cards
    { id: "pm_001", userId: "user_001", type: "card", provider: "stripe", last4: "4242", brand: "Visa", expiryMonth: 12, expiryYear: 2025, gatewayId: "pm_stripe_001" },
    { id: "pm_002", userId: "user_002", type: "card", provider: "stripe", last4: "5555", brand: "Mastercard", expiryMonth: 8, expiryYear: 2026, gatewayId: "pm_stripe_002" },
    { id: "pm_003", userId: "user_003", type: "bank_account", provider: "stripe", bankName: "Chase Bank", accountNumber: "****1234", routingNumber: "021000021", gatewayId: "ba_stripe_003" },
    
    // African Payment Methods
    { id: "pm_004", userId: "user_001", type: "mobile_money", provider: "flutterwave", bankName: "MTN Mobile Money", accountNumber: "****5678", gatewayId: "fw_momo_001" },
    { id: "pm_005", userId: "user_002", type: "mobile_money", provider: "flutterwave", bankName: "Vodacom M-Pesa", accountNumber: "****9012", gatewayId: "fw_mpesa_001" },
    { id: "pm_006", userId: "user_004", type: "bank_account", provider: "flutterwave", bankName: "GTBank Nigeria", accountNumber: "****3456", gatewayId: "fw_bank_001" },
    { id: "pm_007", userId: "user_005", type: "mobile_money", provider: "paystack", bankName: "Airtel Money", accountNumber: "****7890", gatewayId: "ps_airtel_001" },
    
    // Cryptocurrency
    { id: "pm_008", userId: "user_003", type: "crypto", provider: "coinbase", bankName: "Bitcoin Wallet", accountNumber: "bc1q****xyz", gatewayId: "cb_btc_001" },
    { id: "pm_009", userId: "user_006", type: "crypto", provider: "binance", bankName: "Ethereum Wallet", accountNumber: "0x****abc", gatewayId: "bn_eth_001" },
    { id: "pm_010", userId: "user_007", type: "crypto", provider: "metamask", bankName: "USDT Wallet", accountNumber: "0x****def", gatewayId: "mm_usdt_001" },
    
    // Digital Wallets
    { id: "pm_011", userId: "user_008", type: "digital_wallet", provider: "paypal", accountNumber: "user008@email.com", gatewayId: "pp_wallet_001" },
    { id: "pm_012", userId: "user_009", type: "digital_wallet", provider: "apple_pay", last4: "8765", brand: "Apple Card", gatewayId: "ap_card_001" },
    { id: "pm_013", userId: "user_010", type: "digital_wallet", provider: "google_pay", last4: "4321", brand: "Google Pay", gatewayId: "gp_card_001" },
    
    // Additional African/Global Methods
    { id: "pm_014", userId: "admin_001", type: "bank_account", provider: "wise", bankName: "Wise Multi-Currency", accountNumber: "****wise01", gatewayId: "wise_001" },
    { id: "pm_015", userId: "user_004", type: "mobile_money", provider: "orange_money", bankName: "Orange Money", accountNumber: "****orange", gatewayId: "om_001" }
  ];

  const existingPaymentMethods = await prisma.paymentMethod.findMany({ select: { id: true } });
  const existingPmIds = new Set(existingPaymentMethods.map(pm => pm.id));

  for (const pmData of paymentMethodsData) {
    if (existingPmIds.has(pmData.id)) {
      console.log(`⏭️ Payment method already exists: ${pmData.id} for ${pmData.userId}`);
      continue;
    }

    const { id, ...pmDataWithoutId } = pmData;
    const _pm = await prisma.paymentMethod.create({
      data: {
        id,
        ...pmDataWithoutId,
        isDefault: pmData.userId === "user_001" && pmData.id === "pm_001", // First one is default for user_001
        isActive: true
      }
    });
    console.log(`✅ Created payment method: ${pmData.type} (${pmData.provider}) for ${pmData.userId}`);
  }

  // Seed Verification Documents (proper document types with back URLs where applicable)
  console.log('📄 Seeding verification documents...');
  const verificationDocs = [
    // National IDs (with back document URLs)
    { id: "vdoc_001", userId: "user_001", type: "national_id", documentUrl: "https://example.com/docs/national_id_001_front.jpg", backDocumentUrl: "https://example.com/docs/national_id_001_back.jpg", status: VerificationStatus.VERIFIED },
    { id: "vdoc_002", userId: "user_002", type: "national_id", documentUrl: "https://example.com/docs/national_id_002_front.jpg", backDocumentUrl: "https://example.com/docs/national_id_002_back.jpg", status: VerificationStatus.VERIFIED },
    { id: "vdoc_003", userId: "user_003", type: "national_id", documentUrl: "https://example.com/docs/national_id_003_front.jpg", backDocumentUrl: "https://example.com/docs/national_id_003_back.jpg", status: VerificationStatus.PENDING },
    
    // Driver's Licenses (with back document URLs)
    { id: "vdoc_004", userId: "user_004", type: "drivers_license", documentUrl: "https://example.com/docs/drivers_license_004_front.jpg", backDocumentUrl: "https://example.com/docs/drivers_license_004_back.jpg", status: VerificationStatus.VERIFIED },
    { id: "vdoc_005", userId: "user_005", type: "drivers_license", documentUrl: "https://example.com/docs/drivers_license_005_front.jpg", backDocumentUrl: "https://example.com/docs/drivers_license_005_back.jpg", status: VerificationStatus.REJECTED },
    
    // Passports (no back document URL needed)
    { id: "vdoc_006", userId: "user_006", type: "passport", documentUrl: "https://example.com/docs/passport_006.jpg", status: VerificationStatus.VERIFIED },
    { id: "vdoc_007", userId: "user_007", type: "passport", documentUrl: "https://example.com/docs/passport_007.jpg", status: VerificationStatus.PENDING },
    
    // Address Proof Documents
    { id: "vdoc_008", userId: "user_001", type: "utility_bill", documentUrl: "https://example.com/docs/utility_bill_001.pdf", status: VerificationStatus.VERIFIED },
    { id: "vdoc_009", userId: "user_002", type: "bank_statement", documentUrl: "https://example.com/docs/bank_statement_002.pdf", status: VerificationStatus.VERIFIED },
    { id: "vdoc_010", userId: "user_003", type: "lease_agreement", documentUrl: "https://example.com/docs/lease_agreement_003.pdf", status: VerificationStatus.PENDING },
    { id: "vdoc_011", userId: "user_008", type: "utility_bill", documentUrl: "https://example.com/docs/utility_bill_008.pdf", status: VerificationStatus.VERIFIED },
    
    // Facial Photos
    { id: "vdoc_012", userId: "user_001", type: "facial_photo", documentUrl: "https://example.com/docs/facial_photo_001.jpg", status: VerificationStatus.VERIFIED },
    { id: "vdoc_013", userId: "user_002", type: "facial_photo", documentUrl: "https://example.com/docs/facial_photo_002.jpg", status: VerificationStatus.VERIFIED },
    { id: "vdoc_014", userId: "user_003", type: "facial_photo", documentUrl: "https://example.com/docs/facial_photo_003.jpg", status: VerificationStatus.PENDING },
    { id: "vdoc_015", userId: "user_004", type: "facial_photo", documentUrl: "https://example.com/docs/facial_photo_004.jpg", status: VerificationStatus.VERIFIED },
    
    // Additional Documents
    { id: "vdoc_016", userId: "admin_001", type: "passport", documentUrl: "https://example.com/docs/admin_passport.jpg", status: VerificationStatus.VERIFIED },
    { id: "vdoc_017", userId: "admin_001", type: "facial_photo", documentUrl: "https://example.com/docs/admin_facial_photo.jpg", status: VerificationStatus.VERIFIED }
  ];

  const existingVerificationDocs = await prisma.verificationDocument.findMany({ select: { id: true } });
  const existingDocIds = new Set(existingVerificationDocs.map(doc => doc.id));

  for (const docData of verificationDocs) {
    if (existingDocIds.has(docData.id)) {
      console.log(`⏭️ Verification document already exists: ${docData.type} for ${docData.userId}`);
      continue;
    }

    const { id, ...docDataWithoutId } = docData;
    const _doc = await prisma.verificationDocument.create({
      data: {
        id,
        ...docDataWithoutId,
        metadata: { 
          uploadSource: "mobile_app", 
          fileSize: Math.floor(Math.random() * 5000000) + 1000000,
          documentType: docData.type,
          hasBackDocument: ["national_id", "drivers_license"].includes(docData.type)
        }
      }
    });
    console.log(`✅ Created verification document: ${docData.type} for ${docData.userId}`);
  }

  // Seed Packages (check for existing packages)
  console.log('📦 Seeding packages...');
  const createdPackages = [];
  const existingPackageIds = new Set(existingPackages.map(p => p.id));
  
  for (const packageData of packages) {
    if (existingPackageIds.has(packageData.id)) {
      console.log(`⏭️ Package already exists: ${packageData.title}`);
      const existingPackage = await prisma.package.findUnique({ where: { id: packageData.id } });
      createdPackages.push(existingPackage!);
      continue;
    }

    const pkg = await prisma.package.create({
      data: {
        id: packageData.id,
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
    console.log(`✅ Created package: ${pkg.title}`);
  }

  // Seed Trips (check for existing trips)
  console.log('✈️ Seeding trips...');
  const createdTrips = [];
  const existingTripIds = new Set(existingTrips.map(t => t.id));
  
  for (const tripData of trips) {
    if (existingTripIds.has(tripData.id)) {
      console.log(`⏭️ Trip already exists: ${tripData.title}`);
      const existingTrip = await prisma.trip.findUnique({ where: { id: tripData.id } });
      createdTrips.push(existingTrip!);
      continue;
    }

    const trip = await prisma.trip.create({
      data: {
        id: tripData.id,
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
        flexibleDates: false // Default value since not in source data
      }
    });
    createdTrips.push(trip);
    console.log(`✅ Created trip: ${trip.title}`);
  }

  // Link some packages to trips (for testing matched packages)
  console.log('🔗 Linking packages to trips...');
  const matchedPackages = createdPackages.slice(0, 3); // Match first 3 packages
  const availableTrips = createdTrips.slice(0, 3); // To first 3 trips

  for (let i = 0; i < matchedPackages.length; i++) {
    await prisma.package.update({
      where: { id: matchedPackages[i].id },
      data: { 
        tripId: availableTrips[i].id,
        status: PackageStatus.MATCHED
      }
    });
    console.log(`✅ Matched package ${matchedPackages[i].title} to trip ${availableTrips[i].title}`);
  }

  // Seed Chats and Messages
  console.log('💬 Seeding chats and messages...');
  const chatData = [
    {
      type: ChatType.PACKAGE_NEGOTIATION,
      packageId: createdPackages[0].id,
      participants: [createdPackages[0].senderId, createdTrips[0].travelerId],
      messages: [
        { senderId: createdPackages[0].senderId, content: "Hi! I'm interested in having you deliver my package. Are you available?" },
        { senderId: createdTrips[0].travelerId, content: "Hello! Yes, I can help with your delivery. When do you need it delivered?" },
        { senderId: createdPackages[0].senderId, content: "Perfect! I need it delivered by next Friday. The package is fragile, so please handle with care." },
        { senderId: createdTrips[0].travelerId, content: "No problem! I'll take extra care with fragile items. Let's proceed with the booking." }
      ]
    },
    {
      type: ChatType.TRIP_COORDINATION,
      tripId: createdTrips[1].id,
      participants: [createdTrips[1].travelerId, "user_003"],
      messages: [
        { senderId: "user_003", content: "Hi! I saw your trip to Chicago. Do you have space for a small electronics package?" },
        { senderId: createdTrips[1].travelerId, content: "Yes, I have plenty of space. What are the dimensions and weight?" },
        { senderId: "user_003", content: "It's a laptop, about 2kg and 35x25x3 cm. Very valuable, needs careful handling." }
      ]
    }
  ];

  for (const chatInfo of chatData) {
    // Check if chat already exists for this trip/package combination
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: chatInfo.type,
        ...(chatInfo.packageId && { packageId: chatInfo.packageId }),
        ...(chatInfo.tripId && { tripId: chatInfo.tripId })
      }
    });

    if (existingChat) {
      console.log(`⏭️ Chat already exists for ${chatInfo.type}${chatInfo.packageId ? ` (package)` : ''}${chatInfo.tripId ? ` (trip)` : ''}`);
      continue;
    }

    const chat = await prisma.chat.create({
      data: {
        type: chatInfo.type,
        packageId: chatInfo.packageId || undefined,
        tripId: chatInfo.tripId || undefined,
        isActive: true
      }
    });

    // Add participants
    for (const participantId of chatInfo.participants) {
      const existingParticipant = await prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId: chat.id,
            userId: participantId
          }
        }
      });

      if (!existingParticipant) {
        await prisma.chatParticipant.create({
          data: {
            chatId: chat.id,
            userId: participantId,
            joinedAt: new Date(),
            lastReadAt: new Date()
          }
        });
      }
    }

    // Add messages
    for (let i = 0; i < chatInfo.messages.length; i++) {
      const msgData = chatInfo.messages[i];
      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: msgData.senderId,
          content: msgData.content,
          messageType: "text",
          createdAt: new Date(Date.now() - (chatInfo.messages.length - i) * 60000) // Stagger messages by 1 minute
        }
      });
    }

    console.log(`✅ Created chat with ${chatInfo.messages.length} messages`);
  }

  // Seed Reviews
  console.log('⭐ Seeding reviews...');
  const reviewsData = [
    { giverId: createdPackages[0].senderId, receiverId: createdTrips[0].travelerId, rating: 5, comment: "Excellent service! Package was delivered safely and on time.", category: "delivery", packageId: createdPackages[0].id },
    { giverId: createdTrips[0].travelerId, receiverId: createdPackages[0].senderId, rating: 4, comment: "Good communication throughout the process.", category: "communication", packageId: createdPackages[0].id },
    { giverId: "user_003", receiverId: createdTrips[1].travelerId, rating: 5, comment: "Very reliable traveler, would definitely use again!", category: "reliability" },
    { giverId: createdTrips[1].travelerId, receiverId: "user_003", rating: 4, comment: "Package was well-packaged and easy to handle.", category: "delivery" }
  ];

  for (const reviewData of reviewsData) {
    const _review = await prisma.review.create({
      data: {
        ...reviewData,
        isPublic: true
      }
    });
    console.log(`✅ Created review: ${reviewData.rating} stars from ${reviewData.giverId}`);
  }

  // Seed Transactions
  console.log('💰 Seeding transactions...');
  const wallets = await prisma.wallet.findMany();
  const transactionsData = [
    { userId: "user_001", type: TransactionType.PAYMENT, amount: 25.00, description: "Package delivery payment", packageId: createdPackages[0].id, status: PaymentStatus.COMPLETED },
    { userId: createdTrips[0].travelerId, type: TransactionType.PAYOUT, amount: 20.00, description: "Delivery payout", packageId: createdPackages[0].id, status: PaymentStatus.COMPLETED },
    { userId: "admin_001", type: TransactionType.COMMISSION, amount: 5.00, description: "Platform commission", packageId: createdPackages[0].id, status: PaymentStatus.COMPLETED },
    { userId: "user_002", type: TransactionType.DEPOSIT, amount: 100.00, description: "Wallet top-up", status: PaymentStatus.COMPLETED },
    { userId: "user_003", type: TransactionType.PAYMENT, amount: 30.00, description: "Package delivery payment", status: PaymentStatus.PENDING }
  ];

  for (const txnData of transactionsData) {
    const userWallet = wallets.find(w => w.userId === txnData.userId);
    const _transaction = await prisma.transaction.create({
      data: {
        ...txnData,
        walletId: userWallet?.id,
        currency: "USD",
        netAmount: txnData.amount * 0.97, // Deduct 3% fees
        platformFee: txnData.amount * 0.025,
        gatewayFee: txnData.amount * 0.005,
        processedAt: txnData.status === PaymentStatus.COMPLETED ? new Date() : undefined
      }
    });
    console.log(`✅ Created transaction: ${txnData.type} of $${txnData.amount} for ${txnData.userId}`);
  }

  // Seed Tracking Events
  console.log('📍 Seeding tracking events...');
  const trackingEvents = [
    { packageId: createdPackages[0].id, event: "picked_up", description: "Package picked up by traveler", location: createdPackages[0].pickupAddress as any },
    { packageId: createdPackages[0].id, event: "in_transit", description: "Package in transit", location: { city: "En Route", country: "USA" } as any },
    { packageId: createdPackages[0].id, event: "delivered", description: "Package delivered successfully", location: createdPackages[0].deliveryAddress as any },
    { packageId: createdPackages[1].id, event: "picked_up", description: "Package picked up by traveler", location: createdPackages[1].pickupAddress as any }
  ];

  for (let i = 0; i < trackingEvents.length; i++) {
    const eventData = trackingEvents[i];
    await prisma.trackingEvent.create({
      data: {
        ...eventData,
        timestamp: new Date(Date.now() - (trackingEvents.length - i) * 24 * 60 * 60 * 1000), // Stagger by days
        metadata: { automated: true }
      }
    });
    console.log(`✅ Created tracking event: ${eventData.event} for package ${eventData.packageId}`);
  }

  // Seed Notifications
  console.log('🔔 Seeding notifications...');
  const notificationsData = [
    { userId: "user_001", type: NotificationType.PACKAGE_MATCH, title: "Package Matched!", message: "Your package has been matched with a traveler", packageId: createdPackages[0].id },
    { userId: createdTrips[0].travelerId, type: NotificationType.TRIP_REQUEST, title: "New Package Request", message: "Someone wants you to deliver their package", packageId: createdPackages[0].id, tripId: createdTrips[0].id },
    { userId: "user_001", type: NotificationType.PAYMENT_RECEIVED, title: "Payment Confirmed", message: "Your payment has been processed successfully", packageId: createdPackages[0].id },
    { userId: createdTrips[0].travelerId, type: NotificationType.DELIVERY_CONFIRMATION, title: "Delivery Confirmed", message: "Package delivery has been confirmed by recipient", packageId: createdPackages[0].id },
    { userId: "user_002", type: NotificationType.MESSAGE_RECEIVED, title: "New Message", message: "You have a new message about your trip" },
    { userId: "admin_001", type: NotificationType.SYSTEM_ALERT, title: "System Alert", message: "New user verification request pending" }
  ];

  for (const notifData of notificationsData) {
    const _notification = await prisma.notification.create({
      data: {
        ...notifData,
        isRead: Math.random() > 0.5, // Random read status
        sentAt: new Date()
      }
    });
    console.log(`✅ Created notification: ${notifData.title} for ${notifData.userId}`);
  }

  // Seed Disputes
  console.log('⚠️ Seeding disputes...');
  const disputesData = [
    {
      reporterId: "user_003",
      involvedId: createdTrips[2].travelerId,
      packageId: createdPackages[2].id,
      type: "non_delivery",
      description: "Package was not delivered within the agreed timeframe. Traveler is not responding to messages.",
      status: DisputeStatus.OPEN,
      evidence: ["https://example.com/evidence/screenshot1.png", "https://example.com/evidence/chat_history.pdf"]
    },
    {
      reporterId: createdPackages[3].senderId,
      involvedId: "user_004", // Assuming user_004 exists in your data
      packageId: createdPackages[3].id,
      type: "damaged_package",
      description: "Package arrived damaged. The electronics inside were broken.",
      status: DisputeStatus.IN_REVIEW,
      evidence: ["https://example.com/evidence/damage_photo1.jpg", "https://example.com/evidence/damage_photo2.jpg"],
      assignedAdminId: adminUser.id
    }
  ];

  for (const disputeData of disputesData) {
    const _dispute = await prisma.dispute.create({
      data: disputeData
    });
    console.log(`✅ Created dispute: ${disputeData.type} by ${disputeData.reporterId}`);
  }

  // Seed Safety Confirmations
  console.log('🛡️ Seeding safety confirmations...');
  const safetyConfirmations = [
    {
      packageId: createdPackages[0].id,
      tripId: createdTrips[0].id,
      userId: createdPackages[0].senderId,
      confirmationType: "PICKUP",
      confirmations: {
        identityVerified: true,
        packageCondition: "good",
        meetingLocation: "verified",
        notes: "Everything looks good, proceeding with pickup"
      },
      notes: "Smooth pickup process"
    },
    {
      packageId: createdPackages[0].id,
      tripId: createdTrips[0].id,
      userId: createdTrips[0].travelerId,
      confirmationType: "DELIVERY",
      confirmations: {
        recipientVerified: true,
        packageCondition: "delivered_intact",
        signatureObtained: true,
        notes: "Package delivered successfully to recipient"
      },
      notes: "Successful delivery"
    }
  ];

  for (const safetyData of safetyConfirmations) {
    const _safety = await prisma.safetyConfirmation.create({
      data: safetyData
    });
    console.log(`✅ Created safety confirmation: ${safetyData.confirmationType} for package ${safetyData.packageId}`);
  }

  // Seed System Configuration
  console.log('⚙️ Seeding system configuration...');
  const systemConfigs = [
    { key: "platform_commission_rate", value: "0.025", description: "Platform commission rate (2.5%)" },
    { key: "max_package_weight", value: "50", description: "Maximum package weight in kg" },
    { key: "min_traveler_rating", value: "3.0", description: "Minimum traveler rating required" },
    { key: "verification_required", value: "true", description: "Whether identity verification is required" },
    { key: "auto_dispute_resolution_days", value: "7", description: "Days after which disputes are auto-resolved" },
    { key: "wallet_minimum_balance", value: "10.00", description: "Minimum wallet balance required" },
    { key: "notification_retention_days", value: "30", description: "Days to retain notifications" }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({
      data: config
    });
    console.log(`✅ Created system config: ${config.key} = ${config.value}`);
  }

  // Seed Audit Logs
  console.log('📋 Seeding audit logs...');
  const auditLogs = [
    {
      userId: adminUser.id,
      action: "CREATE_USER",
      entity: "User",
      entityId: "user_001",
      newValues: { firstName: "Alex", lastName: "Smith", email: "alex.smith@email.com" },
      ipAddress: "192.168.1.1"
    },
    {
      userId: "user_001",
      action: "CREATE_PACKAGE",
      entity: "Package", 
      entityId: createdPackages[0].id,
      newValues: { title: createdPackages[0].title, status: "POSTED" },
      ipAddress: "192.168.1.100"
    },
    {
      userId: createdTrips[0].travelerId,
      action: "UPDATE_PACKAGE",
      entity: "Package",
      entityId: createdPackages[0].id,
      oldValues: { status: "POSTED" },
      newValues: { status: "MATCHED", tripId: createdTrips[0].id },
      ipAddress: "192.168.1.101"
    },
    {
      userId: adminUser.id,
      action: "RESOLVE_DISPUTE",
      entity: "Dispute",
      entityId: "dispute_001",
      oldValues: { status: "OPEN" },
      newValues: { status: "RESOLVED", resolution: "Refund issued to sender" },
      ipAddress: "10.0.0.1"
    }
  ];

  for (const logData of auditLogs) {
    await prisma.auditLog.create({
      data: {
        ...logData,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    console.log(`✅ Created audit log: ${logData.action} by ${logData.userId}`);
  }

  console.log('🎉 Comprehensive database seeding completed!');
  
  // Generate summary
  const summary = {
    users: await prisma.user.count(),
    userProfiles: await prisma.userProfile.count(),
    verificationDocs: await prisma.verificationDocument.count(),
    packages: await prisma.package.count(),
    trips: await prisma.trip.count(),
    chats: await prisma.chat.count(),
    messages: await prisma.message.count(),
    reviews: await prisma.review.count(),
    wallets: await prisma.wallet.count(),
    transactions: await prisma.transaction.count(),
    paymentMethods: await prisma.paymentMethod.count(),
    trackingEvents: await prisma.trackingEvent.count(),
    notifications: await prisma.notification.count(),
    disputes: await prisma.dispute.count(),
    safetyConfirmations: await prisma.safetyConfirmation.count(),
    systemConfigs: await prisma.systemConfig.count(),
    auditLogs: await prisma.auditLog.count()
  };

  console.log(`📊 Seeding Summary:`);
  console.log(`   👥 Users: ${summary.users} (including profiles and verification docs)`);
  console.log(`   📦 Packages: ${summary.packages}`);
  console.log(`   ✈️ Trips: ${summary.trips}`);
  console.log(`   💬 Chats: ${summary.chats} (with ${summary.messages} messages)`);
  console.log(`   ⭐ Reviews: ${summary.reviews}`);
  console.log(`   💳 Wallets: ${summary.wallets} (with ${summary.transactions} transactions)`);
  console.log(`   💳 Payment Methods: ${summary.paymentMethods}`);
  console.log(`   📍 Tracking Events: ${summary.trackingEvents}`);
  console.log(`   🔔 Notifications: ${summary.notifications}`);
  console.log(`   ⚠️ Disputes: ${summary.disputes}`);
  console.log(`   🛡️ Safety Confirmations: ${summary.safetyConfirmations}`);
  console.log(`   ⚙️ System Configs: ${summary.systemConfigs}`);
  console.log(`   📋 Audit Logs: ${summary.auditLogs}`);
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
