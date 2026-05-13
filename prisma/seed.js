import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const airlines = [
  {
    code: 'AT',
    name: 'Royal Air Maroc',
    fares: [
      {
        fareName: 'Light',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 10,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: false,
      },
      {
        fareName: 'Classic',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 10,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: true,
        checkedWeightKg: 23,
        checkedCount: 1,
      },
      {
        fareName: 'Confort',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 10,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: true,
        checkedWeightKg: 23,
        checkedCount: 2,
      },
    ],
  },
  {
    code: 'FR',
    name: 'Ryanair',
    fares: [
      {
        fareName: 'Basic',
        personalItem: true,
        personalItemDimensions: '40 x 20 x 25 cm',
        cabinAllowed: false,
        checkedAllowed: false,
      },
      {
        fareName: 'Regular',
        personalItem: true,
        personalItemDimensions: '40 x 20 x 25 cm',
        cabinAllowed: true,
        cabinWeightKg: 10,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: false,
      },
      {
        fareName: 'Plus',
        personalItem: true,
        personalItemDimensions: '40 x 20 x 25 cm',
        cabinAllowed: true,
        cabinWeightKg: 10,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: true,
        checkedWeightKg: 20,
        checkedCount: 1,
      },
    ],
  },
  {
    code: 'PC',
    name: 'Pegasus Airlines',
    fares: [
      {
        fareName: 'Eco',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 8,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: false,
      },
      {
        fareName: 'Advantage',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 8,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: true,
        checkedWeightKg: 20,
        checkedCount: 1,
      },
      {
        fareName: 'Flex',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 8,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: true,
        checkedWeightKg: 20,
        checkedCount: 1,
      },
    ],
  },
  {
    code: 'TK',
    name: 'Turkish Airlines',
    fares: [
      {
        fareName: 'Eco Saver',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 8,
        cabinDimensions: '55 x 40 x 23 cm',
        checkedAllowed: true,
        checkedWeightKg: 23,
        checkedCount: 1,
      },
      {
        fareName: 'Eco',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 8,
        cabinDimensions: '55 x 40 x 23 cm',
        checkedAllowed: true,
        checkedWeightKg: 23,
        checkedCount: 1,
      },
      {
        fareName: 'Eco Flex',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 8,
        cabinDimensions: '55 x 40 x 23 cm',
        checkedAllowed: true,
        checkedWeightKg: 23,
        checkedCount: 2,
      },
    ],
  },
  {
    code: '3O',
    name: 'Air Arabia Maroc',
    fares: [
      {
        fareName: 'Value',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 10,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: false,
      },
      {
        fareName: 'Flex',
        personalItem: true,
        personalItemDimensions: '40 x 30 x 15 cm',
        cabinAllowed: true,
        cabinWeightKg: 10,
        cabinDimensions: '55 x 40 x 20 cm',
        checkedAllowed: true,
        checkedWeightKg: 20,
        checkedCount: 1,
      },
    ],
  },
];

const testDeals = [
  {
    title: '[TEST] Casa - Istanbul avec Pegasus Eco',
    slug: 'test-casa-istanbul-pegasus-eco',
    fromAirport: 'CMN',
    toAirport: 'SAW',
    fromCity: 'Casablanca',
    toCity: 'Istanbul',
    countryCode: 'TR',
    priceMad: 1490,
    airlineCode: 'PC',
    fareName: 'Eco',
    departureDate: new Date('2026-07-12'),
    returnDate: new Date('2026-07-19'),
    bookingUrl: 'https://www.flypgs.com/',
    tags: ['bon prix', 'transit:SAW'],
    score: 82,
  },
  {
    title: '[TEST] Casa - Dubai avec Air Arabia Maroc Flex',
    slug: 'test-casa-dubai-air-arabia-flex',
    fromAirport: 'CMN',
    toAirport: 'SHJ',
    fromCity: 'Casablanca',
    toCity: 'Dubai',
    countryCode: 'AE',
    priceMad: 2890,
    airlineCode: '3O',
    fareName: 'Flex',
    departureDate: new Date('2026-08-04'),
    returnDate: new Date('2026-08-12'),
    bookingUrl: 'https://www.airarabia.com/',
    tags: ['offre speciale !'],
    score: 78,
  },
  {
    title: '[TEST] Casa - Paris avec Royal Air Maroc Light',
    slug: 'test-casa-paris-ram-light',
    fromAirport: 'CMN',
    toAirport: 'ORY',
    fromCity: 'Casablanca',
    toCity: 'Paris',
    countryCode: 'FR',
    priceMad: 1190,
    airlineCode: 'AT',
    fareName: 'Light',
    departureDate: new Date('2026-06-18'),
    returnDate: new Date('2026-06-24'),
    bookingUrl: 'https://www.royalairmaroc.com/',
    tags: ['bon deal'],
    score: 86,
  },
];

async function main() {
  for (const airline of airlines) {
    const savedAirline = await prisma.airline.upsert({
      where: { code: airline.code },
      update: { name: airline.name },
      create: { code: airline.code, name: airline.name },
    });

    for (const fare of airline.fares) {
      await prisma.airlineFare.upsert({
        where: {
          airlineId_fareName: {
            airlineId: savedAirline.id,
            fareName: fare.fareName,
          },
        },
        update: fare,
        create: {
          ...fare,
          airlineId: savedAirline.id,
        },
      });
    }
  }

  for (const deal of testDeals) {
    const airline = await prisma.airline.findUniqueOrThrow({
      where: { code: deal.airlineCode },
    });
    const fare = await prisma.airlineFare.findUniqueOrThrow({
      where: {
        airlineId_fareName: {
          airlineId: airline.id,
          fareName: deal.fareName,
        },
      },
    });

    await prisma.deal.upsert({
      where: { slug: deal.slug },
      update: {
        priceMad: deal.priceMad,
        airlineName: airline.name,
        airlineId: airline.id,
        fareId: fare.id,
        lastCheckedAt: new Date(),
        isTest: true,
      },
      create: {
        title: deal.title,
        slug: deal.slug,
        fromAirport: deal.fromAirport,
        toAirport: deal.toAirport,
        fromCity: deal.fromCity,
        toCity: deal.toCity,
        countryCode: deal.countryCode,
        priceMad: deal.priceMad,
        airlineName: airline.name,
        airlineId: airline.id,
        fareId: fare.id,
        departureDate: deal.departureDate,
        returnDate: deal.returnDate,
        bookingUrl: deal.bookingUrl,
        tags: deal.tags,
        isActive: true,
        isFeatured: false,
        isTest: true,
        score: deal.score,
        lastCheckedAt: new Date(),
      },
    });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
