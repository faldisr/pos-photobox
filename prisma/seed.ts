import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Branches
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Cabang Utama',
      code: 'MAIN',
      address: 'Jl. Sudirman No. 123',
      phone: '021-12345678',
      email: 'main@photobox.com',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10110',
      isActive: true,
      operationalHours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '10:00', close: '22:00' },
        sunday: { open: '10:00', close: '22:00' },
      },
    },
  })

  const branch2 = await prisma.branch.upsert({
    where: { code: 'BSD' },
    update: {},
    create: {
      name: 'Cabang BSD',
      code: 'BSD',
      address: 'Jl. BSD Raya No. 456',
      phone: '021-87654321',
      email: 'bsd@photobox.com',
      city: 'Tangerang Selatan',
      province: 'Banten',
      postalCode: '15310',
      isActive: true,
    },
  })

  console.log('✅ Branches created:', mainBranch.name, branch2.name)

  // Create Users
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@photobox.com' },
    update: {},
    create: {
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@photobox.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      branchId: mainBranch.id,
    },
  })

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@photobox.com' },
    update: {},
    create: {
      name: 'Kasir 1',
      username: 'kasir1',
      email: 'cashier@photobox.com',
      password: hashedPassword,
      role: 'CASHIER',
      branchId: mainBranch.id,
    },
  })

  console.log('✅ Users created:', adminUser.email, cashierUser.email)

  // Create Packages
  // paperSize & printType dipindah ke dalam specifications (field Json)
  const packages = [
    {
      name: 'Paket Basic 4R',
      code: 'PKG-BASIC-4R',
      description: 'Paket foto basic dengan ukuran 4R',
      basePrice: 150000,
      photoCount: 4,
      isActive: true,
      specifications: {
        paperSize: '4R',
        printType: 'Glossy',
        duration: 30,
        retake: true,
        softcopy: false,
      },
    },
    {
      name: 'Paket Premium 5R',
      code: 'PKG-PREM-5R',
      description: 'Paket foto premium dengan ukuran 5R dan softcopy',
      basePrice: 250000,
      photoCount: 6,
      isActive: true,
      specifications: {
        paperSize: '5R',
        printType: 'Glossy',
        duration: 45,
        retake: true,
        softcopy: true,
      },
    },
    {
      name: 'Paket Family',
      code: 'PKG-FAMILY',
      description: 'Paket foto keluarga lengkap',
      basePrice: 400000,
      photoCount: 10,
      isActive: true,
      specifications: {
        paperSize: '5R',
        printType: 'Matte',
        duration: 60,
        retake: true,
        softcopy: true,
      },
    },
  ]

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { code: pkg.code },
      update: {},
      create: pkg,
    })
  }

  console.log('✅ Packages created')

  // Create Templates
  const templates = [
    {
      name: 'Birthday Template',
      code: 'TPL-BDAY',
      category: 'Birthday',
      description: 'Template ulang tahun',
      isActive: true,
      isPopular: true,
    },
    {
      name: 'Wedding Template',
      code: 'TPL-WEDDING',
      category: 'Wedding',
      description: 'Template pernikahan',
      isActive: true,
      isPopular: true,
    },
    {
      name: 'Graduation Template',
      code: 'TPL-GRAD',
      category: 'Graduation',
      description: 'Template wisuda',
      isActive: true,
      isPopular: false,
    },
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { code: template.code },
      update: {},
      create: template,
    })
  }

  console.log('✅ Templates created')

  // Create Customers
  const customers = [
    {
      name: 'Budi Santoso',
      email: 'budi@email.com',
      phone: '081234567890',
      dateOfBirth: new Date('1990-05-15'),
      address: 'Jl. Merdeka No. 1',
      loyaltyPoints: 100,
      totalVisits: 5,
      totalSpent: 750000,
    },
    {
      name: 'Siti Nurhaliza',
      email: 'siti@email.com',
      phone: '081234567891',
      dateOfBirth: new Date('1995-08-20'),
      address: 'Jl. Kemerdekaan No. 2',
      loyaltyPoints: 50,
      totalVisits: 2,
      totalSpent: 300000,
    },
    {
      name: 'Ahmad Dahlan',
      email: 'ahmad@email.com',
      phone: '081234567892',
      dateOfBirth: new Date('1988-03-10'),
      address: 'Jl. Diponegoro No. 3',
      loyaltyPoints: 150,
      totalVisits: 8,
      totalSpent: 1200000,
    },
  ]

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: {},
      create: customer,
    })
  }

  console.log('✅ Customers created')

  // Create Inventory Items
  const inventoryItems = [
    {
      name: 'Kertas Foto 4R Glossy',
      code: 'INV-PAPER-4R-G',
      category: 'PAPER' as const,
      unit: 'lembar',
      minStock: 100,
      isActive: true,
      unitCost: 500,
    },
    {
      name: 'Kertas Foto 5R Matte',
      code: 'INV-PAPER-5R-M',
      category: 'PAPER' as const,
      unit: 'lembar',
      minStock: 100,
      isActive: true,
      unitCost: 750,
    },
    {
      name: 'Tinta Printer',
      code: 'INV-INK-001',
      category: 'INK' as const,
      unit: 'botol',
      minStock: 10,
      isActive: true,
      unitCost: 150000,
    },
    {
      name: 'Bingkai Foto Standard',
      code: 'INV-FRAME-001',
      category: 'FRAME' as const,
      unit: 'buah',
      minStock: 20,
      isActive: true,
      unitCost: 25000,
    },
  ]

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    })
  }

  console.log('✅ Inventory items created')

  // Create Add-Ons
  const addOns = [
    {
      name: 'Extra Print 4R',
      code: 'ADDON-XPRINT-4R',
      type: 'EXTRA_PRINT' as const,
      price: 15000,
      description: 'Tambahan cetak foto ukuran 4R',
      isActive: true,
    },
    {
      name: 'Bingkai Foto',
      code: 'ADDON-FRAME-001',
      type: 'FRAME' as const,
      price: 35000,
      description: 'Bingkai foto standard',
      isActive: true,
    },
    {
      name: 'File Digital',
      code: 'ADDON-DIGITAL-001',
      type: 'DIGITAL_FILE' as const,
      price: 25000,
      description: 'Softcopy foto dalam format JPG resolusi tinggi',
      isActive: true,
    },
  ]

  for (const addOn of addOns) {
    await prisma.addOn.upsert({
      where: { code: addOn.code },
      update: {},
      create: addOn,
    })
  }

  console.log('✅ Add-ons created')

  console.log('🎉 Seeding completed!')
  console.log('\n📧 Login credentials:')
  console.log('Super Admin : admin@photobox.com    / admin123 (username: superadmin)')
  console.log('Manager     : manager@photobox.com  / admin123 (username: branchmanager)')
  console.log('Cashier     : cashier@photobox.com  / admin123 (username: kasir1)')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })