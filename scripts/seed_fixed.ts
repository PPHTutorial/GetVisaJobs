import bcrypt from 'bcryptjs';
import { users, packages, trips } from '../lib/data/listings';
import prisma from '@/lib/prisma';
import { UserRole, PackageStatus, TripStatus } from '@prisma/client';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.chatParticipant.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.package.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  // Seed Users with profiles
  console.log('👥 Seeding users...');
  for (const userData of users) {
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
    console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
  }

  // Seed Packages
  console.log('📦 Seeding packages...');
  for (const packageData of packages) {
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
    console.log(`✅ Created package: ${pkg.title} from ${packageData.pickupAddress.city} to ${packageData.deliveryAddress.city}`);
  }

  // Seed Trips
  console.log('✈️ Seeding trips...');
  for (const tripData of trips) {
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
        destinationAddress: tripData.destinationAddress
      }
    });
    console.log(`✅ Created trip: ${trip.title} from ${tripData.originAddress.city} to ${tripData.destinationAddress.city}`);
  }

  console.log('🎉 Database seeding completed!');
  console.log(`📊 Summary:`);
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   📦 Packages: ${packages.length}`);
  console.log(`   ✈️ Trips: ${trips.length}`);
  console.log(`   🔑 Default password for all users: password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
