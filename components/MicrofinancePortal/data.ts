export const SERVICES = [
  'Intrabank transfer',
  'Interbank transfer',
  'Airtime',
  'Data',
  'Cable TV subscription',
  'Electricity purchase'
] as const;

export type Service = (typeof SERVICES)[number];
export type CustomerStatus = 'Active' | 'Restricted' | 'Inactive';
export const CUSTOMER_TIERS = ['Tier 1', 'Tier 2', 'Tier 3'] as const;
export type CustomerTier = (typeof CUSTOMER_TIERS)[number];
export type TransactionStatus = 'Successful' | 'Failed' | 'Pending';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tier: CustomerTier;
  status: CustomerStatus;
  joinedAt: string;
  accountNumber: string;
  accountType: string;
  branch: string;
  pinLocked: boolean;
  passcodeLocked: boolean;
}

export interface Transaction {
  reference: string;
  customerId: string;
  service: Service;
  amount: number;
  createdAt: string;
  status: TransactionStatus;
  type: 'Debit' | 'Credit';
}

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'CUS-10482',
    name: 'Amara Okafor',
    phone: '+234 800 000 0142',
    email: 'amara.okafor@example.com',
    address: '14 Cedar Avenue, Ikeja, Lagos',
    tier: 'Tier 3',
    status: 'Active',
    joinedAt: '2024-06-18',
    accountNumber: '•••• 0184',
    accountType: 'Personal savings',
    branch: 'Ikeja service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10483',
    name: 'Tunde Adeyemi',
    phone: '+234 800 000 0276',
    email: 'tunde.adeyemi@example.com',
    address: '8 Palm Street, Ibadan, Oyo',
    tier: 'Tier 2',
    status: 'Active',
    joinedAt: '2024-09-02',
    accountNumber: '•••• 0291',
    accountType: 'Personal savings',
    branch: 'Ibadan service centre',
    pinLocked: true,
    passcodeLocked: false
  },
  {
    id: 'CUS-10484',
    name: 'Zainab Bello',
    phone: '+234 800 000 0381',
    email: 'zainab.bello@example.com',
    address: '22 Unity Road, Kaduna, Kaduna',
    tier: 'Tier 1',
    status: 'Active',
    joinedAt: '2025-01-21',
    accountNumber: '•••• 0337',
    accountType: 'Personal savings',
    branch: 'Kaduna service centre',
    pinLocked: false,
    passcodeLocked: true
  },
  {
    id: 'CUS-10485',
    name: 'Chinedu Eze',
    phone: '+234 800 000 0453',
    email: 'chinedu.eze@example.com',
    address: '5 Garden Close, Enugu, Enugu',
    tier: 'Tier 2',
    status: 'Restricted',
    joinedAt: '2025-03-10',
    accountNumber: '•••• 0412',
    accountType: 'Personal savings',
    branch: 'Enugu service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10486',
    name: 'Bisi Akinola',
    phone: '+234 800 000 0529',
    email: 'bisi.akinola@example.com',
    address: '19 Market Lane, Abeokuta, Ogun',
    tier: 'Tier 1',
    status: 'Active',
    joinedAt: '2025-05-04',
    accountNumber: '•••• 0568',
    accountType: 'Personal savings',
    branch: 'Abeokuta service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10487',
    name: 'Ibrahim Musa',
    phone: '+234 800 000 0634',
    email: 'ibrahim.musa@example.com',
    address: '31 Gidan Road, Kano, Kano',
    tier: 'Tier 3',
    status: 'Active',
    joinedAt: '2025-07-26',
    accountNumber: '•••• 0623',
    accountType: 'Personal savings',
    branch: 'Kano service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10488',
    name: 'Ngozi Nwosu',
    phone: '+234 800 000 0719',
    email: 'ngozi.nwosu@example.com',
    address: '10 River View, Port Harcourt, Rivers',
    tier: 'Tier 2',
    status: 'Inactive',
    joinedAt: '2025-09-13',
    accountNumber: '•••• 0741',
    accountType: 'Personal savings',
    branch: 'Port Harcourt service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10489',
    name: 'Seyi Balogun',
    phone: '+234 800 000 0825',
    email: 'seyi.balogun@example.com',
    address: '7 Meadow Crescent, Lagos, Lagos',
    tier: 'Tier 1',
    status: 'Active',
    joinedAt: '2025-11-08',
    accountNumber: '•••• 0856',
    accountType: 'Personal savings',
    branch: 'Surulere service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10490',
    name: 'Hauwa Garba',
    phone: '+234 800 000 0932',
    email: 'hauwa.garba@example.com',
    address: '12 Hilltop Road, Jos, Plateau',
    tier: 'Tier 2',
    status: 'Active',
    joinedAt: '2026-02-14',
    accountNumber: '•••• 0964',
    accountType: 'Personal savings',
    branch: 'Jos service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10491',
    name: 'Kelechi Obi',
    phone: '+234 800 000 1046',
    email: 'kelechi.obi@example.com',
    address: '3 Sunrise Estate, Owerri, Imo',
    tier: 'Tier 1',
    status: 'Active',
    joinedAt: '2026-05-29',
    accountNumber: '•••• 1075',
    accountType: 'Personal savings',
    branch: 'Owerri service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10492',
    name: 'Fatima Yusuf',
    phone: '+234 800 000 1150',
    email: 'fatima.yusuf@example.com',
    address: '26 Station Road, Ilorin, Kwara',
    tier: 'Tier 3',
    status: 'Active',
    joinedAt: '2026-10-12',
    accountNumber: '•••• 1188',
    accountType: 'Personal savings',
    branch: 'Ilorin service centre',
    pinLocked: false,
    passcodeLocked: false
  },
  {
    id: 'CUS-10493',
    name: 'David Ojo',
    phone: '+234 800 000 1268',
    email: 'david.ojo@example.com',
    address: '9 Orchard Way, Benin City, Edo',
    tier: 'Tier 2',
    status: 'Active',
    joinedAt: '2026-11-01',
    accountNumber: '•••• 1292',
    accountType: 'Personal savings',
    branch: 'Benin service centre',
    pinLocked: false,
    passcodeLocked: false
  }
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    reference: 'MF-8JQ2-1048',
    customerId: 'CUS-10482',
    service: 'Intrabank transfer',
    amount: 125000,
    createdAt: '2026-11-03T13:42:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-2LM5-8273',
    customerId: 'CUS-10483',
    service: 'Airtime',
    amount: 5000,
    createdAt: '2026-11-03T13:16:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-7PW1-6590',
    customerId: 'CUS-10484',
    service: 'Electricity purchase',
    amount: 18500,
    createdAt: '2026-11-03T12:53:00',
    status: 'Pending',
    type: 'Debit'
  },
  {
    reference: 'MF-9XB4-3106',
    customerId: 'CUS-10485',
    service: 'Interbank transfer',
    amount: 42000,
    createdAt: '2026-11-03T12:31:00',
    status: 'Failed',
    type: 'Debit'
  },
  {
    reference: 'MF-4DK8-9451',
    customerId: 'CUS-10486',
    service: 'Data',
    amount: 12000,
    createdAt: '2026-11-03T11:58:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-1FA6-2739',
    customerId: 'CUS-10487',
    service: 'Cable TV subscription',
    amount: 26500,
    createdAt: '2026-11-03T11:21:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-6TN3-8024',
    customerId: 'CUS-10488',
    service: 'Intrabank transfer',
    amount: 78000,
    createdAt: '2026-11-02T16:47:00',
    status: 'Successful',
    type: 'Credit'
  },
  {
    reference: 'MF-3CR7-5162',
    customerId: 'CUS-10489',
    service: 'Airtime',
    amount: 2500,
    createdAt: '2026-11-02T15:22:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-5HY9-4381',
    customerId: 'CUS-10490',
    service: 'Interbank transfer',
    amount: 95000,
    createdAt: '2026-11-02T14:06:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-0QZ2-7615',
    customerId: 'CUS-10491',
    service: 'Electricity purchase',
    amount: 22000,
    createdAt: '2026-11-02T12:18:00',
    status: 'Failed',
    type: 'Debit'
  },
  {
    reference: 'MF-2VE6-1893',
    customerId: 'CUS-10492',
    service: 'Intrabank transfer',
    amount: 175000,
    createdAt: '2026-11-02T10:43:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-7KG4-6028',
    customerId: 'CUS-10493',
    service: 'Data',
    amount: 8500,
    createdAt: '2026-11-01T17:35:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-8NZ5-3917',
    customerId: 'CUS-10482',
    service: 'Interbank transfer',
    amount: 64000,
    createdAt: '2026-11-01T15:11:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-1BR3-8246',
    customerId: 'CUS-10483',
    service: 'Cable TV subscription',
    amount: 12500,
    createdAt: '2026-10-31T14:49:00',
    status: 'Pending',
    type: 'Debit'
  },
  {
    reference: 'MF-4MS8-1572',
    customerId: 'CUS-10484',
    service: 'Airtime',
    amount: 3000,
    createdAt: '2026-10-31T12:27:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-6JP2-4903',
    customerId: 'CUS-10485',
    service: 'Intrabank transfer',
    amount: 230000,
    createdAt: '2026-10-30T16:52:00',
    status: 'Successful',
    type: 'Credit'
  },
  {
    reference: 'MF-9TW7-2864',
    customerId: 'CUS-10486',
    service: 'Interbank transfer',
    amount: 51000,
    createdAt: '2026-10-30T13:34:00',
    status: 'Failed',
    type: 'Debit'
  },
  {
    reference: 'MF-3DL1-7059',
    customerId: 'CUS-10487',
    service: 'Electricity purchase',
    amount: 31500,
    createdAt: '2026-10-29T11:09:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-5AC4-9182',
    customerId: 'CUS-10488',
    service: 'Data',
    amount: 10000,
    createdAt: '2026-10-29T10:22:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-0WU6-3471',
    customerId: 'CUS-10489',
    service: 'Intrabank transfer',
    amount: 89000,
    createdAt: '2026-10-28T15:40:00',
    status: 'Successful',
    type: 'Credit'
  },
  {
    reference: 'MF-2RF8-5630',
    customerId: 'CUS-10490',
    service: 'Airtime',
    amount: 4500,
    createdAt: '2026-10-28T13:16:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-7YM3-2405',
    customerId: 'CUS-10491',
    service: 'Cable TV subscription',
    amount: 18000,
    createdAt: '2026-10-27T17:03:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-6GP5-8719',
    customerId: 'CUS-10492',
    service: 'Interbank transfer',
    amount: 135000,
    createdAt: '2026-10-27T12:48:00',
    status: 'Pending',
    type: 'Debit'
  },
  {
    reference: 'MF-4KX9-1026',
    customerId: 'CUS-10493',
    service: 'Electricity purchase',
    amount: 14000,
    createdAt: '2026-10-26T14:30:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-8FV2-6354',
    customerId: 'CUS-10482',
    service: 'Data',
    amount: 15000,
    createdAt: '2026-10-25T10:57:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-3HA6-7820',
    customerId: 'CUS-10483',
    service: 'Intrabank transfer',
    amount: 112000,
    createdAt: '2026-10-24T16:05:00',
    status: 'Successful',
    type: 'Credit'
  },
  {
    reference: 'MF-5PM1-4963',
    customerId: 'CUS-10484',
    service: 'Interbank transfer',
    amount: 36500,
    createdAt: '2026-10-23T12:13:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-1QG7-3589',
    customerId: 'CUS-10485',
    service: 'Airtime',
    amount: 2000,
    createdAt: '2026-10-22T09:34:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-9XE3-6418',
    customerId: 'CUS-10486',
    service: 'Intrabank transfer',
    amount: 67000,
    createdAt: '2026-10-21T15:51:00',
    status: 'Successful',
    type: 'Credit'
  },
  {
    reference: 'MF-0LD8-9257',
    customerId: 'CUS-10487',
    service: 'Data',
    amount: 9500,
    createdAt: '2026-10-20T13:29:00',
    status: 'Failed',
    type: 'Debit'
  },
  {
    reference: 'MF-6BV4-1702',
    customerId: 'CUS-10488',
    service: 'Interbank transfer',
    amount: 74000,
    createdAt: '2026-10-19T11:42:00',
    status: 'Successful',
    type: 'Debit'
  },
  {
    reference: 'MF-2NJ5-8136',
    customerId: 'CUS-10489',
    service: 'Electricity purchase',
    amount: 27000,
    createdAt: '2026-10-18T10:16:00',
    status: 'Successful',
    type: 'Debit'
  }
];

export const DEMO_ADMIN = {
  name: 'Ada Okonkwo',
  email: 'ada.okonkwo@demo.example',
  role: 'Operations administrator'
};

export interface AuditEvent {
  id: string;
  action: string;
  customerId: string;
  customerName: string;
  reason: string;
  admin: string;
  createdAt: string;
}

export const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'AUD-0003',
    action: 'Statement downloaded',
    customerId: 'CUS-10482',
    customerName: 'Amara Okafor',
    reason: 'Monthly account review',
    admin: DEMO_ADMIN.name,
    createdAt: '2026-11-03T09:15:00'
  },
  {
    id: 'AUD-0002',
    action: 'Customer details updated',
    customerId: 'CUS-10490',
    customerName: 'Hauwa Garba',
    reason: 'Customer requested updated contact information',
    admin: DEMO_ADMIN.name,
    createdAt: '2026-11-02T14:20:00'
  },
  {
    id: 'AUD-0001',
    action: 'Transaction PIN lock removed',
    customerId: 'CUS-10483',
    customerName: 'Tunde Adeyemi',
    reason: 'Identity verified through support callback',
    admin: DEMO_ADMIN.name,
    createdAt: '2026-11-01T10:05:00'
  }
];
