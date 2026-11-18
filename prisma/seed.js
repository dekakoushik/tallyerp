const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding production-ready ERP & Farm billing data with INR (₹)...");

  // Clean existing data
  await prisma.payment.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.estimateItem.deleteMany({});
  await prisma.estimate.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.farmBatch.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.organization.deleteMany({});

  // 1. Apex Global Technologies (Enterprise Company - INR)
  const techCompany = await prisma.organization.create({
    data: {
      name: "Apex Global Technologies Pvt Ltd",
      type: "COMPANY",
      legalName: "Apex Global Technologies Private Limited",
      taxId: "29AABCA1234F1Z8", // Indian GSTIN format
      registrationNumber: "U72200KA2020PTC138902", // Indian CIN format
      email: "billing@apexglobal.tech",
      phone: "+91 80 4920 1200",
      website: "https://apexglobal.tech",
      currency: "INR",
      currencySymbol: "₹",
      address: "Prestige Tech Park, Outer Ring Road",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      zipCode: "560103",
      bankName: "HDFC Bank Ltd",
      bankAccount: "50200049281048",
      bankIfscSwift: "HDFC0000240",
      bankBranch: "Koramangala Commercial Branch",
      upiId: "apextech@hdfcbank",
      invoicePrefix: "AG-INV-",
      estimatePrefix: "AG-EST-",
      challanPrefix: "AG-DC-",
      nextInvoiceNumber: 1004,
      nextEstimateNumber: 1003,
      isDefault: true,
      notesTerms: "Payment due within 15 days of invoice date. 18% GST applicable. Remit to HDFC Bank A/C or UPI ID.",
    },
  });

  // 2. GreenValley Organics & Dairy Farm (Agricultural Farm - INR)
  const greenValleyFarm = await prisma.organization.create({
    data: {
      name: "GreenValley Organics & Dairy Farm",
      type: "FARM",
      legalName: "GreenValley Agro Producer Co. Ltd",
      taxId: "03AAGCG8829K1Z5", // Punjab GSTIN
      registrationNumber: "AGRI-PB-FPO-4920",
      email: "accounts@greenvalleyfarms.in",
      phone: "+91 98150 44910",
      website: "https://greenvalleyfarms.in",
      currency: "INR",
      currencySymbol: "₹",
      address: "GT Road Sector 14, Agricultural Complex",
      city: "Ludhiana",
      state: "Punjab",
      country: "India",
      zipCode: "141001",
      bankName: "Punjab National Bank - Agribusiness Branch",
      bankAccount: "0392002100049182",
      bankIfscSwift: "PUNB0039200",
      bankBranch: "PAU Agricultural Center Ludhiana",
      upiId: "greenvalleyfarm@pnb",
      invoicePrefix: "GVF-INV-",
      estimatePrefix: "GVF-EST-",
      challanPrefix: "GVF-DC-",
      nextInvoiceNumber: 2005,
      nextEstimateNumber: 2002,
      isDefault: false,
      notesTerms: "Agricultural produce certified organic. Produce weighed on certified mandi electronic weighbridge. Discrepancies within 24 hours.",
    },
  });

  // 3. Sunshine Agro Wholesale & Trading Co. (INR)
  const agroTrading = await prisma.organization.create({
    data: {
      name: "Sunshine Agro Traders & Fertilizer Co",
      type: "AGRO_ENTERPRISE",
      legalName: "Sunshine Agro Trading LLP",
      taxId: "27AAGCS9912M1Z3", // Maharashtra GSTIN
      email: "sales@sunshineagro.in",
      phone: "+91 94220 88123",
      currency: "INR",
      currencySymbol: "₹",
      address: "Market Yard Commercial Wing, Sector 7",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      zipCode: "411037",
      bankName: "State Bank of India Commercial",
      bankAccount: "38920194820",
      bankIfscSwift: "SBIN0001423",
      invoicePrefix: "SAT-INV-",
      estimatePrefix: "SAT-EST-",
      nextInvoiceNumber: 3001,
      isDefault: false,
      notesTerms: "Payment due within 10 days of delivery. Subject to Pune jurisdiction.",
    },
  });

  console.log("Organizations created with INR (₹)!");

  // Customers for Tech Company
  const clientAcme = await prisma.customer.create({
    data: {
      organizationId: techCompany.id,
      name: "Tata Cloud Analytics Ltd",
      companyName: "Tata Enterprise Solutions",
      type: "CUSTOMER",
      email: "procurement@tatacloud.com",
      phone: "+91 22 6620 9000",
      taxId: "27AAACT2800G1ZP",
      billingAddress: "Bombay House, 24 Homi Mody Street",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400001",
      creditLimit: 500000,
      currentBalance: 125000,
    },
  });

  const clientNexus = await prisma.customer.create({
    data: {
      organizationId: techCompany.id,
      name: "Infosys BPO & Consulting",
      companyName: "Infosys Limited",
      type: "CUSTOMER",
      email: "billing@infosysbpo.in",
      phone: "+91 80 2852 0261",
      taxId: "29AAAAC1234H1Z1",
      billingAddress: "Electronics City, Hosur Road",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      zipCode: "560100",
      creditLimit: 750000,
      currentBalance: 0,
    },
  });

  // Customers for Farm
  const farmBuyerFreshMart = await prisma.customer.create({
    data: {
      organizationId: greenValleyFarm.id,
      name: "Reliance Retail & Fresh Marts",
      companyName: "Reliance Retail Ltd",
      type: "FARM_BUYER",
      email: "procurement.fresh@ril.com",
      phone: "+91 22 3555 3800",
      taxId: "27AAACR1234Q1Z8",
      billingAddress: "Reliance Corporate Park, Thane-Belapur Road",
      shippingAddress: "Central Cold Storage Hub, Sector 18",
      city: "Navi Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400701",
      creditLimit: 800000,
      currentBalance: 84000,
    },
  });

  const farmBuyerMillers = await prisma.customer.create({
    data: {
      organizationId: greenValleyFarm.id,
      name: "Punjab Agro Roller Flour Mills",
      companyName: "Punjab Flour Millers Pvt Ltd",
      type: "FARM_BUYER",
      email: "grain.buying@punjabflour.in",
      phone: "+91 161 249 8810",
      taxId: "03AABCP9012K1Z9",
      billingAddress: "Focal Point Phase 5",
      city: "Ludhiana",
      state: "Punjab",
      country: "India",
      zipCode: "141010",
      creditLimit: 1200000,
      currentBalance: 245000,
    },
  });

  // Farm Categories & Products
  const catCrops = await prisma.category.create({
    data: {
      organizationId: greenValleyFarm.id,
      name: "Crops, Grains & Pulses",
      type: "CROP",
    },
  });

  const catDairy = await prisma.category.create({
    data: {
      organizationId: greenValleyFarm.id,
      name: "Dairy & Livestock Products",
      type: "LIVESTOCK",
    },
  });

  const prodWheat = await prisma.product.create({
    data: {
      organizationId: greenValleyFarm.id,
      categoryId: catCrops.id,
      sku: "WHT-HD2967",
      name: "Sharbati / HD-2967 Wheat (Grade A)",
      description: "Certified organic wheat harvest, moisture content < 11.5%",
      unit: "quintal",
      salePrice: 2850, // ₹ 2,850 per quintal
      costPrice: 1850,
      taxRate: 0, // Agricultural produce exempt under GST
      hsnSacCode: "1001",
      stockQuantity: 650,
      lowStockAlert: 50,
      isAgricultural: true,
      grade: "Grade A Extra Clean",
    },
  });

  const prodBasmati = await prisma.product.create({
    data: {
      organizationId: greenValleyFarm.id,
      categoryId: catCrops.id,
      sku: "RIC-BASM-1121",
      name: "Traditional Basmati Rice (1121)",
      description: "Aged long grain aromatic Basmati paddy harvest",
      unit: "quintal",
      salePrice: 4200, // ₹ 4,200 per quintal
      costPrice: 2700,
      taxRate: 0,
      hsnSacCode: "1006",
      stockQuantity: 400,
      lowStockAlert: 40,
      isAgricultural: true,
      grade: "Export Grade 1121",
    },
  });

  const prodMilk = await prisma.product.create({
    data: {
      organizationId: greenValleyFarm.id,
      categoryId: catDairy.id,
      sku: "DRY-RAW-MLK",
      name: "A2 Gir Cow Raw Whole Milk (Bulk Chilled)",
      description: "Chilled fresh farm milk Fat 4.5%, SNF 8.8%",
      unit: "liter",
      salePrice: 65, // ₹ 65 per liter
      costPrice: 38,
      taxRate: 0,
      hsnSacCode: "0401",
      stockQuantity: 4500,
      lowStockAlert: 500,
      isAgricultural: true,
      grade: "A2 Certified",
    },
  });

  // Farm Batches (INR costs and revenues)
  await prisma.farmBatch.createMany({
    data: [
      {
        organizationId: greenValleyFarm.id,
        batchCode: "BATCH-WHT-2026-01",
        cropOrLivestock: "Wheat (HD-2967)",
        fieldLocation: "North Farm Plot 3A & 3B",
        areaAcres: 45.0,
        plantedDate: new Date("2026-04-10"),
        expectedHarvestDate: new Date("2026-10-15"),
        expectedYield: 650,
        actualYield: 680,
        unit: "quintal",
        status: "HARVESTED",
        costIncurred: 450000, // ₹ 4.5 Lakhs
        revenueEarned: 950000, // ₹ 9.5 Lakhs
        notes: "Certified seed, zero chemical pesticide, drip irrigated.",
      },
      {
        organizationId: greenValleyFarm.id,
        batchCode: "BATCH-BAS-2026-02",
        cropOrLivestock: "Basmati Rice 1121",
        fieldLocation: "Canal Side Basin Plot 2",
        areaAcres: 30.0,
        plantedDate: new Date("2026-06-01"),
        expectedHarvestDate: new Date("2026-11-05"),
        expectedYield: 480,
        unit: "quintal",
        status: "GROWING",
        costIncurred: 320000,
        notes: "Organic bio-fertilizer and vermicompost applied.",
      },
      {
        organizationId: greenValleyFarm.id,
        batchCode: "BATCH-MLK-2026-03",
        cropOrLivestock: "A2 Gir Dairy Herd (60 Cattle)",
        fieldLocation: "Dairy Shed 1 & Pasture Area",
        areaAcres: 12.0,
        plantedDate: new Date("2026-01-01"),
        expectedYield: 18000,
        actualYield: 18450,
        unit: "liter",
        status: "GROWING",
        costIncurred: 280000,
        revenueEarned: 640000,
        notes: "Green fodder silage feed, daily veterinary testing.",
      },
    ],
  });

  // Tech Products (INR)
  const catSoftware = await prisma.category.create({
    data: {
      organizationId: techCompany.id,
      name: "Software & Cloud Licenses",
      type: "SERVICE",
    },
  });

  const catConsulting = await prisma.category.create({
    data: {
      organizationId: techCompany.id,
      name: "IT Architecture & DevOps",
      type: "SERVICE",
    },
  });

  const prodCloudERP = await prisma.product.create({
    data: {
      organizationId: techCompany.id,
      categoryId: catSoftware.id,
      sku: "SW-ERP-ANNUAL",
      name: "Enterprise ERP Cloud Cluster (Annual Subscription)",
      description: "Dedicated cluster with automated GST filing & multi-entity support",
      unit: "unit",
      salePrice: 185000, // ₹ 1,85,000
      costPrice: 35000,
      taxRate: 18, // 18% GST
      hsnSacCode: "998313",
      stockQuantity: 100,
      trackInventory: false,
    },
  });

  const prodConsulting = await prisma.product.create({
    data: {
      organizationId: techCompany.id,
      categoryId: catConsulting.id,
      sku: "SV-ARCH-DAY",
      name: "Solutions Architecture & Cloud Migration",
      description: "Principal Solutions Architect per-day consulting sprint",
      unit: "unit",
      salePrice: 28000, // ₹ 28,000 / day
      costPrice: 12000,
      taxRate: 18,
      hsnSacCode: "998314",
      stockQuantity: 200,
      trackInventory: false,
    },
  });

  // Invoices for Farm (INR)
  const farmInv1 = await prisma.invoice.create({
    data: {
      organizationId: greenValleyFarm.id,
      customerId: farmBuyerFreshMart.id,
      invoiceNumber: "GVF-INV-2001",
      referenceNumber: "PO-RIL-FARM-992",
      issueDate: new Date("2026-09-10"),
      dueDate: new Date("2026-09-25"),
      status: "PAID",
      type: "FARM_SALE",
      subTotal: 171000,
      discountType: "FIXED",
      discountValue: 3000,
      discountAmount: 3000,
      taxAmount: 0,
      totalAmount: 168000,
      paidAmount: 168000,
      balanceAmount: 0,
      notes: "Dispatched in refrigerated van #PB-10-CZ-4921. Weighbridge slip attached.",
      items: {
        create: [
          {
            productId: prodWheat.id,
            itemName: prodWheat.name,
            description: "60 Quintals Organic Sharbati Wheat",
            quantity: 60,
            unit: "quintal",
            unitPrice: 2850,
            taxRate: 0,
            taxAmount: 0,
            total: 171000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      organizationId: greenValleyFarm.id,
      invoiceId: farmInv1.id,
      customerId: farmBuyerFreshMart.id,
      paymentNumber: "PAY-GVF-101",
      amount: 168000,
      paymentMethod: "BANK_TRANSFER",
      reference: "NEFT-HDFC-99281048",
      notes: "Full payment received via NEFT",
    },
  });

  const farmInv2 = await prisma.invoice.create({
    data: {
      organizationId: greenValleyFarm.id,
      customerId: farmBuyerMillers.id,
      invoiceNumber: "GVF-INV-2002",
      referenceNumber: "MILL-GRAIN-2026",
      issueDate: new Date("2026-09-18"),
      dueDate: new Date("2026-10-03"),
      status: "PARTIAL",
      type: "FARM_SALE",
      subTotal: 570000,
      discountType: "PERCENTAGE",
      discountValue: 2,
      discountAmount: 11400,
      taxAmount: 0,
      totalAmount: 558600,
      paidAmount: 200000,
      balanceAmount: 358600,
      notes: "200 Quintals supplied to Focal Point Mill. Moisture 11.1%.",
      items: {
        create: [
          {
            productId: prodWheat.id,
            itemName: prodWheat.name,
            description: "200 Quintals Certified Grade A Wheat",
            quantity: 200,
            unit: "quintal",
            unitPrice: 2850,
            discountPercent: 2,
            taxRate: 0,
            taxAmount: 0,
            total: 558600,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      organizationId: greenValleyFarm.id,
      invoiceId: farmInv2.id,
      customerId: farmBuyerMillers.id,
      paymentNumber: "PAY-GVF-102",
      amount: 200000,
      paymentMethod: "BANK_TRANSFER",
      reference: "RTGS-PNB-481920",
      notes: "First advance payment installment",
    },
  });

  // Estimates for Farm (INR)
  await prisma.estimate.create({
    data: {
      organizationId: greenValleyFarm.id,
      customerId: farmBuyerFreshMart.id,
      estimateNumber: "GVF-EST-2001",
      referenceNumber: "QUO-BASMATI-HARVEST",
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 15 * 86400000),
      status: "PENDING",
      subTotal: 420000,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 420000,
      notes: "Advance contract rate for 100 quintals Basmati 1121 November block.",
      items: {
        create: [
          {
            productId: prodBasmati.id,
            itemName: prodBasmati.name,
            description: "100 Quintals Pure Basmati 1121",
            quantity: 100,
            unit: "quintal",
            unitPrice: 4200,
            taxRate: 0,
            taxAmount: 0,
            total: 420000,
          },
        ],
      },
    },
  });

  // Invoices for Tech Company (INR)
  const techInv1 = await prisma.invoice.create({
    data: {
      organizationId: techCompany.id,
      customerId: clientAcme.id,
      invoiceNumber: "AG-INV-1001",
      referenceNumber: "PO-TATA-2026-9",
      issueDate: new Date("2026-09-01"),
      dueDate: new Date("2026-09-16"),
      status: "PAID",
      type: "TAX_INVOICE",
      subTotal: 370000,
      discountType: "FIXED",
      discountValue: 10000,
      discountAmount: 10000,
      taxAmount: 64800, // 18% GST on 3,60,000 = 64,800
      totalAmount: 424800,
      paidAmount: 424800,
      balanceAmount: 0,
      notes: "Annual Enterprise Cloud License with 18% GST (CGST 9% + SGST 9%).",
      items: {
        create: [
          {
            productId: prodCloudERP.id,
            itemName: prodCloudERP.name,
            description: "Annual Enterprise Tier (2 Cluster Instances)",
            quantity: 2,
            unit: "unit",
            unitPrice: 185000,
            taxRate: 18,
            taxAmount: 64800,
            total: 424800,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      organizationId: techCompany.id,
      invoiceId: techInv1.id,
      customerId: clientAcme.id,
      paymentNumber: "PAY-AG-501",
      amount: 424800,
      paymentMethod: "BANK_TRANSFER",
      reference: "RTGS-HDFC-9941038",
      notes: "Settled in full via RTGS",
    },
  });

  const techInv2 = await prisma.invoice.create({
    data: {
      organizationId: techCompany.id,
      customerId: clientNexus.id,
      invoiceNumber: "AG-INV-1002",
      referenceNumber: "INFY-PO-774",
      issueDate: new Date("2026-09-15"),
      dueDate: new Date("2026-09-30"),
      status: "UNPAID",
      type: "TAX_INVOICE",
      subTotal: 140000,
      discountAmount: 0,
      taxAmount: 25200,
      totalAmount: 165200,
      paidAmount: 0,
      balanceAmount: 165200,
      notes: "5 Days Architecture & Cloud Sprint.",
      items: {
        create: [
          {
            productId: prodConsulting.id,
            itemName: prodConsulting.name,
            description: "5 Days dedicated DevOps & Cloud automation sprint",
            quantity: 5,
            unit: "unit",
            unitPrice: 28000,
            taxRate: 18,
            taxAmount: 25200,
            total: 165200,
          },
        ],
      },
    },
  });

  // Operating Expenses (INR)
  await prisma.expense.createMany({
    data: [
      {
        organizationId: greenValleyFarm.id,
        title: "Drip Irrigation Maintenance & Submersible Pump Service",
        vendor: "Jain Irrigation Systems Ltd",
        amount: 32500, // ₹ 32,500
        date: new Date("2026-09-05"),
        paymentMethod: "UPI",
        description: "Replaced lateral pipes and drippers in Sector 3",
      },
      {
        organizationId: greenValleyFarm.id,
        title: "Certified Neem Cake & Bio-Fertilizer (60 Bags)",
        vendor: "Kisan Suvidha Kendra",
        amount: 48000, // ₹ 48,000
        date: new Date("2026-09-12"),
        paymentMethod: "BANK_TRANSFER",
        description: "Enriched organic compost and bio-fertilizer supply",
      },
      {
        organizationId: techCompany.id,
        title: "AWS Cloud Mumbai (ap-south-1) Production Cluster",
        vendor: "Amazon Internet Services Pvt Ltd",
        amount: 85000, // ₹ 85,000
        date: new Date("2026-09-01"),
        paymentMethod: "CARD",
        description: "Production database cluster and Kubernetes compute",
      },
    ],
  });

  console.log("Seeding with INR (₹) complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
