export interface Organization {
  id: string;
  name: string;
  type: "COMPANY" | "FARM" | "AGRO_ENTERPRISE" | "BRANCH";
  legalName?: string | null;
  taxId?: string | null;
  registrationNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  currency: string;
  currencySymbol: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankIfscSwift?: string | null;
  bankBranch?: string | null;
  upiId?: string | null;
  invoicePrefix: string;
  estimatePrefix: string;
  challanPrefix: string;
  nextInvoiceNumber: number;
  nextEstimateNumber: number;
  logoUrl?: string | null;
  notesTerms?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  companyName?: string | null;
  type: "CUSTOMER" | "VENDOR" | "FARM_BUYER" | "DISTRIBUTOR";
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  creditLimit: number;
  currentBalance: number;
  notes?: string | null;
}

export interface Product {
  id: string;
  organizationId: string;
  categoryId?: string | null;
  sku?: string | null;
  name: string;
  description?: string | null;
  unit: string;
  salePrice: number;
  costPrice: number;
  taxRate: number;
  hsnSacCode?: string | null;
  stockQuantity: number;
  lowStockAlert: number;
  isAgricultural: boolean;
  grade?: string | null;
  trackInventory: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface InvoiceItem {
  id?: string;
  productId?: string | null;
  itemName: string;
  description?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  customerId: string;
  invoiceNumber: string;
  referenceNumber?: string | null;
  issueDate: string;
  dueDate: string;
  status: "DRAFT" | "SENT" | "PAID" | "PARTIAL" | "OVERDUE" | "UNPAID" | "CANCELLED";
  type: string;
  subTotal: number;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  notes?: string | null;
  terms?: string | null;
  customer?: Customer;
  organization?: Organization;
  items?: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
}

export interface EstimateItem {
  id?: string;
  productId?: string | null;
  itemName: string;
  description?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface Estimate {
  id: string;
  organizationId: string;
  customerId: string;
  estimateNumber: string;
  referenceNumber?: string | null;
  issueDate: string;
  expiryDate: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CONVERTED";
  subTotal: number;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  convertedInvoiceId?: string | null;
  notes?: string | null;
  terms?: string | null;
  customer?: Customer;
  organization?: Organization;
  items?: EstimateItem[];
  createdAt: string;
}

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId?: string | null;
  customerId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "UPI" | "CARD" | "ONLINE";
  reference?: string | null;
  notes?: string | null;
  customer?: Customer;
  invoice?: {
    id: string;
    invoiceNumber: string;
  } | null;
  createdAt: string;
}

export interface FarmBatch {
  id: string;
  organizationId: string;
  batchCode: string;
  cropOrLivestock: string;
  fieldLocation?: string | null;
  areaAcres?: number | null;
  plantedDate?: string | null;
  expectedHarvestDate?: string | null;
  harvestDate?: string | null;
  expectedYield?: number | null;
  actualYield?: number | null;
  unit: string;
  status: "PLANNED" | "GROWING" | "HARVESTED" | "SOLD" | "ARCHIVED";
  costIncurred: number;
  revenueEarned: number;
  notes?: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  organizationId: string;
  categoryId?: string | null;
  title: string;
  vendor?: string | null;
  amount: number;
  date: string;
  paymentMethod: string;
  reference?: string | null;
  description?: string | null;
}
