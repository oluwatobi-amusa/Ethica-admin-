'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  FileText,
  FilterX,
  LockKeyhole,
  Search,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'sonner';
import {
  DEMO_ADMIN,
  DEMO_AUDIT_EVENTS,
  DEMO_CUSTOMERS,
  DEMO_TRANSACTIONS,
  CUSTOMER_TIERS,
  SERVICES,
  type AuditEvent,
  type Customer,
  type CustomerTier,
  type Transaction
} from './data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

type SupportAction =
  | 'unlock-pin'
  | 'unlock-passcode'
  | 'update-details'
  | 'reset-pin'
  | 'reset-password';

const money = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);

const dateTime = (value: string) =>
  new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));

const shortDate = (value: string) =>
  new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`)
  );

const transactionCustomer = (customerId: string) =>
  DEMO_CUSTOMERS.find((customer) => customer.id === customerId);

const selectedClass =
  'h-11 w-full rounded-[8px] border border-[var(--color-outline)] bg-white px-3 text-sm text-[var(--color-black)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-faded-primary-10)]';

const inputClass = selectedClass;

const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[5px] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50';

const secondaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[5px] border border-[var(--color-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-black)] transition hover:bg-[var(--color-faded-gray-10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50';

const cardClass = 'portal-card min-w-0';

function PageHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[18px] font-extrabold leading-tight text-[var(--color-black)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-5 text-[var(--portal-secondary)]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`${cardClass} ${className}`}>{children}</section>;
}

function SectionTitle({
  title,
  detail,
  action
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-bold text-[var(--color-black)]">{title}</h2>
        {detail && <p className="mt-1 text-xs text-[var(--portal-secondary)]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPositive = status === 'Successful' || status === 'Active';
  const isPending = status === 'Pending';
  const Icon = isPositive ? Check : isPending ? Clock3 : CircleAlert;
  return (
    <span
      className={`inline-flex max-w-full min-w-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        isPositive
          ? 'bg-[var(--color-faded-primary-10)] text-[var(--color-primary)]'
          : 'bg-[var(--color-warning-10)] text-[var(--color-warning-40)]'
      }`}
      title={status}
    >
      <Icon aria-hidden="true" size={13} className="shrink-0" />
      <span className="truncate">{status}</span>
    </span>
  );
}

function TierBadge({ tier }: { tier: CustomerTier }) {
  return (
    <span
      className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full bg-[var(--color-faded-gray-10)] px-2.5 py-1 text-xs font-semibold text-[var(--color-black)]"
      title={tier}
    >
      <BadgeCheck aria-hidden="true" size={13} className="shrink-0 text-[var(--color-primary)]" />
      <span className="truncate">{tier}</span>
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block min-w-[145px] flex-1">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
        {label}
      </span>
      <select
        className={selectedClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option === 'All' ? '' : option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
  label
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="block min-w-[200px] flex-[2]">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
        {label}
      </span>
      <span className="relative block">
        <Search
          aria-hidden="true"
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)]"
        />
        <input
          className={`${inputClass} pl-9`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="search"
        />
      </span>
    </label>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-faded-gray-10)] text-[var(--portal-secondary)]">
        <FilterX size={20} aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-black)]">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-[var(--portal-secondary)]">{detail}</p>
    </div>
  );
}

function TruncatedText({
  children,
  title,
  className = ''
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <span className={`block truncate whitespace-nowrap ${className}`} title={title} tabIndex={0}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="p-5">
      <div>
        <p className="text-xs font-semibold text-[var(--portal-secondary)]">{label}</p>
        <p className="mt-3 text-2xl font-bold tabular-nums text-[var(--color-black)]">{value}</p>
        <p className="mt-1 text-xs text-[var(--portal-secondary)]">{detail}</p>
      </div>
    </Card>
  );
}

function TransactionTable({
  transactions,
  onSelect,
  compact = false
}: {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
  compact?: boolean;
}) {
  if (!transactions.length) {
    return (
      <EmptyState
        title="No transactions found"
        detail="Try changing the search term or clearing one or more filters."
      />
    );
  }

  return (
    <div
      className="overflow-x-auto overscroll-x-contain"
      role="region"
      aria-label={compact ? 'Customer transaction history' : 'Transactions'}
      tabIndex={0}
    >
      <table
        className={`w-full table-fixed border-collapse text-left ${
          compact ? 'min-w-[850px]' : 'min-w-[1020px]'
        }`}
      >
        <colgroup>
          {!compact && <col className="w-[180px]" />}
          <col className="w-[180px]" />
          <col className="w-[130px]" />
          <col className="w-[180px]" />
          <col className="w-[120px]" />
          <col className="w-[160px]" />
          <col className="w-[70px]" />
        </colgroup>
        <thead>
          <tr className="border-y border-[var(--color-outline)] text-xs font-semibold text-[var(--portal-secondary)]">
            {!compact && (
              <th className="px-3 py-3 font-semibold">
                <TruncatedText title="Customer">Customer</TruncatedText>
              </th>
            )}
            <th className="px-3 py-3 font-semibold">
              <TruncatedText title="Service">Service</TruncatedText>
            </th>
            <th className="px-3 py-3 font-semibold">
              <TruncatedText title="Amount">Amount</TruncatedText>
            </th>
            <th className="px-3 py-3 font-semibold">
              <TruncatedText title="Date and time">Date and time</TruncatedText>
            </th>
            <th className="px-3 py-3 font-semibold">
              <TruncatedText title="Status">Status</TruncatedText>
            </th>
            <th className="px-3 py-3 font-semibold">
              <TruncatedText title="Reference">Reference</TruncatedText>
            </th>
            <th className="sticky right-0 z-10 border-l border-[var(--color-outline)] bg-white px-3 py-3 font-semibold">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const customer = transactionCustomer(transaction.customerId);
            return (
              <tr
                key={transaction.reference}
                className="border-b border-[var(--color-outline)] last:border-0"
              >
                {!compact && (
                  <td className="px-3 py-4">
                    <Link
                      className="block truncate whitespace-nowrap font-semibold text-[var(--color-black)] hover:text-[var(--color-primary)]"
                      href={`/customers/${transaction.customerId}`}
                      title={`${customer?.name ?? 'Unknown customer'} · ${transaction.customerId}`}
                    >
                      {customer?.name ?? 'Unknown customer'}{' '}
                      <span className="font-mono text-xs text-[var(--portal-secondary)]">
                        · {transaction.customerId}
                      </span>
                    </Link>
                  </td>
                )}
                <td className="px-3 py-4 text-sm text-[var(--color-black)]">
                  <TruncatedText title={transaction.service}>{transaction.service}</TruncatedText>
                </td>
                <td className="px-3 py-4 text-sm font-semibold tabular-nums text-[var(--color-black)]">
                  <TruncatedText title={money(transaction.amount)}>
                    {money(transaction.amount)}
                  </TruncatedText>
                </td>
                <td className="px-3 py-4 text-sm text-[var(--portal-secondary)]">
                  <TruncatedText title={dateTime(transaction.createdAt)}>
                    {dateTime(transaction.createdAt)}
                  </TruncatedText>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="px-3 py-4 font-mono text-xs text-[var(--portal-secondary)]">
                  <TruncatedText title={transaction.reference}>
                    {transaction.reference}
                  </TruncatedText>
                </td>
                <td className="sticky right-0 bg-white px-3 py-4">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--portal-secondary)] hover:bg-[var(--color-faded-gray-10)] hover:text-[var(--color-black)]"
                    onClick={() => onSelect(transaction)}
                    aria-label={`View transaction ${transaction.reference}`}
                    type="button"
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TransactionDetails({
  transaction,
  onClose
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const customer = transaction ? transactionCustomer(transaction.customerId) : undefined;
  return (
    <Dialog open={Boolean(transaction)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[12px] border-[var(--color-outline)] bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-bold text-[var(--color-black)]">
            Transaction details
          </DialogTitle>
          <DialogDescription className="text-left">
            Review the recorded demo transaction information.
          </DialogDescription>
        </DialogHeader>
        {transaction && (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Reference" value={transaction.reference} />
            <DetailItem label="Status" value={transaction.status} />
            <DetailItem label="Customer" value={customer?.name ?? 'Unknown customer'} />
            <DetailItem label="Customer ID" value={transaction.customerId} />
            <DetailItem label="Service" value={transaction.service} />
            <DetailItem label="Transaction type" value={transaction.type} />
            <DetailItem label="Amount" value={money(transaction.amount)} />
            <DetailItem label="Date and time" value={dateTime(transaction.createdAt)} />
            <DetailItem
              label="Customer account"
              value={customer?.accountNumber ?? 'Not available'}
            />
          </dl>
        )}
        <DialogFooter>
          <button className={secondaryButtonClass} type="button" onClick={onClose}>
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-[var(--portal-secondary)]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-[var(--color-black)]">{value}</dd>
    </div>
  );
}

function DashboardView({
  onTransaction,
  customers
}: {
  onTransaction: (transaction: Transaction) => void;
  customers: Customer[];
}) {
  const totalValue = DEMO_TRANSACTIONS.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );
  const successful = DEMO_TRANSACTIONS.filter(
    (transaction) => transaction.status === 'Successful'
  ).length;
  const failedOrPending = DEMO_TRANSACTIONS.length - successful;
  const serviceSummary = SERVICES.map((service) => ({
    service,
    count: DEMO_TRANSACTIONS.filter((transaction) => transaction.service === service).length
  }));
  const maxServiceCount = Math.max(...serviceSummary.map((item) => item.count), 1);
  const active = customers.filter((customer) => customer.status === 'Active').length;
  const trend = [
    { day: 'Oct 28', volume: 18 },
    { day: 'Oct 29', volume: 24 },
    { day: 'Oct 30', volume: 31 },
    { day: 'Oct 31', volume: 27 },
    { day: 'Nov 1', volume: 38 },
    { day: 'Nov 2', volume: 44 },
    { day: 'Nov 3', volume: 51 }
  ];
  const byTier = CUSTOMER_TIERS.map((tier) => ({
    name: tier,
    value: customers.filter((customer) => customer.tier === tier).length
  }));
  const tierColor = [
    'var(--color-primary)',
    'var(--color-faded-primary-40)',
    'var(--color-warning-40)'
  ];

  return (
    <>
      <PageHeading
        eyebrow="Operations overview"
        title="Welcome back, Ada"
        description="A clear view of customer activity and mobile banking operations. All figures below are fictional demo data."
        action={
          <Link className={secondaryButtonClass} href="/transactions">
            <FileText size={16} aria-hidden="true" />
            View transactions
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total customers"
          value={customers.length.toLocaleString()}
          detail="Across all account statuses"
        />
        <MetricCard
          label="Active customers"
          value={active.toLocaleString()}
          detail="Mobile app accounts in good standing"
        />
        <MetricCard
          label="Transaction value"
          value={money(totalValue)}
          detail="Across all recorded activity"
        />
        <MetricCard
          label="Transaction count"
          value={DEMO_TRANSACTIONS.length.toLocaleString()}
          detail="Successful, failed and pending"
        />
      </div>

      <Card className="mb-6 p-[30px]">
        <SectionTitle
          title="Transaction activity"
          detail="Demo transaction volume per day"
          action={
            <span className="rounded-full bg-[var(--color-faded-gray-10)] px-3 py-1.5 text-xs font-semibold">
              Last 7 days
            </span>
          }
        />
        <div className="mb-5 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-[var(--portal-secondary)]">Successful</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{successful.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--portal-secondary)]">Failed or pending</p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              {failedOrPending.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="h-[230px] w-full" aria-label="Demo transaction volume chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-outline)" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--portal-secondary)', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--portal-secondary)', fontSize: 11 }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="volume"
                name="Transactions"
                stroke="var(--color-primary)"
                fill="url(#volumeFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-[30px]">
          <SectionTitle title="Customers by tier" detail="Distribution of demo customer accounts" />
          <div className="flex flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
            <div className="h-[180px] w-[180px] shrink-0" aria-label="Customers by tier chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byTier}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {byTier.map((entry, index) => (
                      <Cell key={entry.name} fill={tierColor[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3">
              {byTier.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tierColor[index] }}
                    />
                    {item.name}
                  </span>
                  <span className="text-sm font-bold tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-[30px]">
          <SectionTitle
            title="Service usage"
            detail="Transaction volume by mobile banking service"
          />
          <div className="space-y-4">
            {serviceSummary.map((item) => (
              <div key={item.service}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold">{item.service}</span>
                  <span className="tabular-nums text-[var(--portal-secondary)]">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-faded-gray-10)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${(item.count / maxServiceCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-[30px]">
        <SectionTitle
          title="Recent transactions"
          detail="Latest activity in the mobile banking app"
          action={
            <Link
              className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
              href="/transactions"
            >
              All transactions <ArrowRight size={15} aria-hidden="true" />
            </Link>
          }
        />
        <TransactionTable transactions={DEMO_TRANSACTIONS.slice(0, 6)} onSelect={onTransaction} />
      </Card>
    </>
  );
}

function CustomersView({
  customers,
  onOpen
}: {
  customers: Customer[];
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;
  const filtered = useMemo(
    () =>
      customers.filter((customer) => {
        const searchable =
          `${customer.name} ${customer.id} ${customer.phone} ${customer.email}`.toLowerCase();
        return searchable.includes(query.toLowerCase()) && (!tier || customer.tier === tier);
      }),
    [customers, query, tier]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [query, tier]);
  useEffect(() => {
    const initialSearch = new URLSearchParams(window.location.search).get('search');
    if (initialSearch) setQuery(initialSearch);
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="Customer management"
        title="Customers"
        description="Find and review customer accounts. Only fictional sample data is shown in this demo."
        action={
          <span className="rounded-full bg-[var(--color-faded-gray-10)] px-3 py-2 text-xs font-semibold">
            {customers.length} customers
          </span>
        }
      />
      <Card className="p-[30px]">
        <div className="mb-5 flex flex-wrap gap-3">
          <SearchField
            value={query}
            onChange={setQuery}
            label="Search customers"
            placeholder="Name, phone or email"
          />
          <FilterSelect
            label="Customer tier"
            value={tier}
            onChange={setTier}
            options={['All', ...CUSTOMER_TIERS]}
          />
        </div>
        {!visible.length ? (
          <EmptyState
            title="No customers match"
            detail="Try a different search or clear the tier filter."
          />
        ) : (
          <div
            className="overflow-x-auto overscroll-x-contain"
            role="region"
            aria-label="Customer list"
            tabIndex={0}
          >
            <table className="w-full min-w-[860px] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[150px]" />
                <col className="w-[135px]" />
                <col className="w-[190px]" />
                <col className="w-[95px]" />
                <col className="w-[140px]" />
                <col className="w-[150px]" />
              </colgroup>
              <thead>
                <tr className="border-y border-[var(--color-outline)] text-xs font-semibold text-[var(--portal-secondary)]">
                  {['Customer', 'Phone', 'Email', 'Tier', 'Date joined', 'Actions'].map(
                    (title, index) => (
                      <th
                        className={`whitespace-nowrap px-3 py-3 font-semibold ${
                          title === 'Actions'
                            ? 'sticky right-0 z-10 border-l border-[var(--color-outline)] bg-white'
                            : ''
                        }`}
                        key={`${title}-${index}`}
                      >
                        <TruncatedText title={title}>{title}</TruncatedText>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[var(--color-outline)] last:border-0"
                  >
                    <td className="px-3 py-4">
                      <TruncatedText title={customer.name} className="font-semibold">
                        {customer.name}
                      </TruncatedText>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <TruncatedText title={customer.phone}>{customer.phone}</TruncatedText>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <TruncatedText title={customer.email}>{customer.email}</TruncatedText>
                    </td>
                    <td className="px-3 py-4 text-sm font-semibold">
                      {customer.tier.replace('Tier ', '')}
                    </td>
                    <td className="px-3 py-4 text-sm text-[var(--portal-secondary)]">
                      <TruncatedText title={shortDate(customer.joinedAt)}>
                        {shortDate(customer.joinedAt)}
                      </TruncatedText>
                    </td>
                    <td className="sticky right-0 border-l border-[var(--color-outline)] bg-white px-3 py-4">
                      <button
                        className={`${secondaryButtonClass} whitespace-nowrap`}
                        type="button"
                        onClick={() => onOpen(customer.id)}
                        title={`Open profile for ${customer.name}`}
                      >
                        View profile <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-outline)] pt-4">
          <p className="text-xs text-[var(--portal-secondary)]">
            Showing {filtered.length ? (page - 1) * perPage + 1 : 0}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length} customers
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft size={15} aria-hidden="true" /> Previous
            </button>
            <span className="px-2 text-xs font-semibold" aria-live="polite">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Next <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}

function TransactionsView({ onSelect }: { onSelect: (transaction: Transaction) => void }) {
  const [query, setQuery] = useState('');
  const [service, setService] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;
  const filtered = useMemo(
    () =>
      DEMO_TRANSACTIONS.filter((transaction) => {
        const customerRecord = transactionCustomer(transaction.customerId);
        const text =
          `${transaction.reference} ${transaction.customerId} ${customerRecord?.name ?? ''}`.toLowerCase();
        const day = transaction.createdAt.slice(0, 10);
        return (
          text.includes(query.toLowerCase()) &&
          (!service || transaction.service === service) &&
          (!status || transaction.status === status) &&
          (!from || day >= from) &&
          (!to || day <= to)
        );
      }),
    [query, service, status, from, to]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [query, service, status, from, to]);

  return (
    <>
      <PageHeading
        eyebrow="Mobile banking"
        title="Transactions"
        description="Search and review transaction details across all demo customer accounts."
      />
      <Card className="p-[30px]">
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <SearchField
            value={query}
            onChange={setQuery}
            label="Customer or reference"
            placeholder="Search name, ID or reference"
          />
          <FilterSelect
            label="Service"
            value={service}
            onChange={setService}
            options={['All', ...SERVICES]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={['All', 'Successful', 'Failed', 'Pending']}
          />
          <label className="block min-w-[140px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
              From date
            </span>
            <input
              aria-label="From date"
              className={inputClass}
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="block min-w-[140px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
              To date
            </span>
            <input
              aria-label="To date"
              className={inputClass}
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </div>
        {from && to && from > to && (
          <p className="mb-4 text-xs font-semibold text-[var(--color-warning-40)]" role="alert">
            The start date must be on or before the end date.
          </p>
        )}
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--portal-secondary)]">
            {filtered.length} transactions found
          </p>
          <span className="text-xs text-[var(--portal-secondary)]">Demo records only</span>
        </div>
        <TransactionTable transactions={visible} onSelect={onSelect} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-outline)] pt-4">
          <p className="text-xs text-[var(--portal-secondary)]">
            Showing {filtered.length ? (page - 1) * perPage + 1 : 0}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft size={15} aria-hidden="true" /> Previous
            </button>
            <span className="px-2 text-xs font-semibold" aria-live="polite">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Next <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}

function ServiceActivityView() {
  const summaries = SERVICES.map((service) => {
    const records = DEMO_TRANSACTIONS.filter((transaction) => transaction.service === service);
    const successCount = records.filter(
      (transaction) => transaction.status === 'Successful'
    ).length;
    return {
      service,
      count: records.length,
      value: records.reduce((total, transaction) => total + transaction.amount, 0),
      successCount,
      unsuccessful: records.length - successCount
    };
  });
  const maxVolume = Math.max(...summaries.map((item) => item.count), 1);
  return (
    <>
      <PageHeading
        eyebrow="Mobile banking"
        title="Service activity"
        description="Compare usage, transaction value and completion outcomes for each supported service."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Services monitored"
          value={String(SERVICES.length)}
          detail="Across mobile banking"
        />
        <MetricCard
          label="Total transactions"
          value={String(DEMO_TRANSACTIONS.length)}
          detail="Fictional demo records"
        />
        <MetricCard
          label="Successful transactions"
          value={String(
            DEMO_TRANSACTIONS.filter((transaction) => transaction.status === 'Successful').length
          )}
          detail="Across all demo services"
        />
      </div>
      <Card className="mb-6 p-[30px]">
        <SectionTitle
          title="Service usage"
          detail="Relative transaction volumes in the demo dataset"
        />
        <div className="space-y-5">
          {summaries.map((item) => (
            <div
              key={item.service}
              className="grid gap-2 sm:grid-cols-[210px_1fr_80px] sm:items-center"
            >
              <span className="text-sm font-semibold">{item.service}</span>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-[var(--color-faded-gray-10)]"
                role="img"
                aria-label={`${item.count} ${item.service} transactions`}
              >
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${(item.count / maxVolume) * 100}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-[var(--portal-secondary)] sm:text-right">
                {item.count} transactions
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-[30px]">
        <SectionTitle
          title="Volume, value and outcomes by service"
          detail="Only sample transactions are included."
        />
        <div
          className="overflow-x-auto overscroll-x-contain"
          role="region"
          aria-label="Service activity summary"
          tabIndex={0}
        >
          <table className="w-full min-w-[780px] table-fixed text-left">
            <colgroup>
              <col className="w-[220px]" />
              <col className="w-[100px]" />
              <col className="w-[170px]" />
              <col className="w-[120px]" />
              <col className="w-[170px]" />
            </colgroup>
            <thead>
              <tr className="border-y border-[var(--color-outline)] text-xs text-[var(--portal-secondary)]">
                <th className="px-3 py-3">
                  <TruncatedText title="Service">Service</TruncatedText>
                </th>
                <th className="px-3 py-3">
                  <TruncatedText title="Volume">Volume</TruncatedText>
                </th>
                <th className="px-3 py-3">
                  <TruncatedText title="Transaction value">Transaction value</TruncatedText>
                </th>
                <th className="px-3 py-3">
                  <TruncatedText title="Successful">Successful</TruncatedText>
                </th>
                <th className="px-3 py-3">
                  <TruncatedText title="Failed or pending">Failed or pending</TruncatedText>
                </th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((item) => (
                <tr
                  key={item.service}
                  className="border-b border-[var(--color-outline)] last:border-0"
                >
                  <td className="px-3 py-4 text-sm font-semibold">
                    <TruncatedText title={item.service}>{item.service}</TruncatedText>
                  </td>
                  <td className="px-3 py-4 text-sm tabular-nums">
                    <TruncatedText title={String(item.count)}>{item.count}</TruncatedText>
                  </td>
                  <td className="px-3 py-4 text-sm font-semibold tabular-nums">
                    <TruncatedText title={money(item.value)}>{money(item.value)}</TruncatedText>
                  </td>
                  <td className="px-3 py-4 text-sm tabular-nums">
                    <TruncatedText title={String(item.successCount)}>
                      {item.successCount}
                    </TruncatedText>
                  </td>
                  <td className="px-3 py-4 text-sm tabular-nums">
                    <TruncatedText title={String(item.unsuccessful)}>
                      {item.unsuccessful}
                    </TruncatedText>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function actionTitle(action: SupportAction) {
  const titles: Record<SupportAction, string> = {
    'unlock-pin': 'Remove transaction PIN lock',
    'unlock-passcode': 'Remove login passcode lock',
    'update-details': 'Update customer details',
    'reset-pin': 'Request PIN reset',
    'reset-password': 'Request password reset'
  };
  return titles[action];
}

function CustomerProfileView({
  customer,
  onAudit,
  onUpdate
}: {
  customer: Customer;
  onAudit: (event: Omit<AuditEvent, 'id' | 'createdAt' | 'admin'>) => void;
  onUpdate: (details: Pick<Customer, 'phone' | 'email' | 'address'>) => void;
}) {
  const [action, setAction] = useState<SupportAction | null>(null);
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email);
  const [address, setAddress] = useState(customer.address);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyService, setHistoryService] = useState('');
  const [historyStatus, setHistoryStatus] = useState('');
  const [historyType, setHistoryType] = useState('');
  const [historyFrom, setHistoryFrom] = useState('');
  const [historyTo, setHistoryTo] = useState('');
  const [statementFrom, setStatementFrom] = useState('2026-10-01');
  const [statementTo, setStatementTo] = useState('2026-11-03');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    setPhone(customer.phone);
    setEmail(customer.email);
    setAddress(customer.address);
  }, [customer.phone, customer.email, customer.address]);

  const customerTransactions = DEMO_TRANSACTIONS.filter(
    (transaction) => transaction.customerId === customer.id
  );
  const history = customerTransactions.filter((transaction) => {
    const day = transaction.createdAt.slice(0, 10);
    return (
      transaction.reference.toLowerCase().includes(historyQuery.toLowerCase()) &&
      (!historyService || transaction.service === historyService) &&
      (!historyStatus || transaction.status === historyStatus) &&
      (!historyType || transaction.type === historyType) &&
      (!historyFrom || day >= historyFrom) &&
      (!historyTo || day <= historyTo)
    );
  });
  const openAction = (nextAction: SupportAction) => {
    setReason('');
    setAction(nextAction);
  };

  const submitAction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action || reason.trim().length < 10) return;
    const labels: Record<SupportAction, string> = {
      'unlock-pin': 'Transaction PIN lock removal requested',
      'unlock-passcode': 'Login passcode lock removal requested',
      'update-details': 'Customer details update requested',
      'reset-pin': 'PIN reset initiated',
      'reset-password': 'Secure password reset initiated'
    };
    if (action === 'update-details') {
      const phoneValid = /^(\+234|0)?[0-9\s-]{10,14}$/.test(phone.trim());
      if (
        !phoneValid ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        address.trim().length < 8
      ) {
        toast.error('Check the customer details', {
          description: 'Enter a valid phone, email and residential address.'
        });
        return;
      }
      onUpdate({ phone: phone.trim(), email: email.trim(), address: address.trim() });
    }
    onAudit({
      action: labels[action],
      customerId: customer.id,
      customerName: customer.name,
      reason: reason.trim()
    });
    toast.success('Demo request recorded', {
      description: `${labels[action]}. No live account has been changed.`
    });
    setAction(null);
  };

  const downloadStatement = () => {
    if (!statementFrom || !statementTo || statementFrom > statementTo) {
      toast.error('Check the statement date range', {
        description: 'Choose a valid start and end date.'
      });
      return;
    }
    const rows = customerTransactions.filter((transaction) => {
      const day = transaction.createdAt.slice(0, 10);
      return day >= statementFrom && day <= statementTo;
    });
    const csvRows = [
      ['Customer name', customer.name],
      ['Customer ID', customer.id],
      ['Account', customer.accountNumber],
      ['Statement period', `${statementFrom} to ${statementTo}`],
      [],
      ['Date and time', 'Reference', 'Service', 'Type', 'Amount (NGN)', 'Status'],
      ...rows.map((transaction) => [
        dateTime(transaction.createdAt),
        transaction.reference,
        transaction.service,
        transaction.type,
        transaction.amount.toString(),
        transaction.status
      ])
    ];
    const csv = csvRows
      .map((row) => row.map((field) => `"${String(field ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `statement-${customer.id}-${statementFrom}-to-${statementTo}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onAudit({
      action: 'Statement downloaded',
      customerId: customer.id,
      customerName: customer.name,
      reason: `Statement requested for ${statementFrom} to ${statementTo}`
    });
    toast.success('Statement downloaded', {
      description: `${rows.length} demo transactions included.`
    });
  };

  return (
    <>
      <div className="mb-5">
        <Link
          href="/customers"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--portal-secondary)] hover:text-[var(--color-primary)]"
        >
          <ChevronLeft size={16} aria-hidden="true" /> Back to customers
        </Link>
      </div>
      <PageHeading
        eyebrow="Customer profile"
        title={customer.name}
        description={`Customer ID ${customer.id} · Joined ${shortDate(customer.joinedAt)}`}
        action={<StatusBadge status={customer.status} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-[30px]">
          <SectionTitle
            title="Customer information"
            detail="Contact and registration details in the demo account"
            action={<TierBadge tier={customer.tier} />}
          />
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailItem label="Customer ID" value={customer.id} />
            <DetailItem label="Account status" value={customer.status} />
            <DetailItem label="Phone number" value={phone} />
            <DetailItem label="Email address" value={email} />
            <DetailItem label="Residential address" value={address} />
            <DetailItem label="Date joined" value={shortDate(customer.joinedAt)} />
            <DetailItem label="Account number" value={customer.accountNumber} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--color-outline)] pt-5">
            <button
              className={primaryButtonClass}
              type="button"
              onClick={() => openAction('update-details')}
            >
              <UserRound size={15} aria-hidden="true" /> Update details
            </button>
            <button
              className={secondaryButtonClass}
              type="button"
              disabled={!customer.pinLocked}
              onClick={() => openAction('unlock-pin')}
            >
              <LockKeyhole size={15} aria-hidden="true" />{' '}
              {customer.pinLocked ? 'Remove PIN lock' : 'PIN lock is clear'}
            </button>
            <button
              className={secondaryButtonClass}
              type="button"
              disabled={!customer.passcodeLocked}
              onClick={() => openAction('unlock-passcode')}
            >
              <LockKeyhole size={15} aria-hidden="true" />{' '}
              {customer.passcodeLocked ? 'Remove passcode lock' : 'Passcode lock is clear'}
            </button>
            <button
              className={secondaryButtonClass}
              type="button"
              onClick={() => openAction('reset-pin')}
            >
              Request PIN reset
            </button>
            <button
              className={secondaryButtonClass}
              type="button"
              onClick={() => openAction('reset-password')}
            >
              Request password reset
            </button>
          </div>
        </Card>
        <Card className="p-[30px]">
          <SectionTitle
            title="Tier and account access"
            detail="Demo tier overview and support signals"
          />
          <div className="rounded-[8px] bg-[var(--color-faded-primary-10)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--portal-secondary)]">
                  Current customer tier
                </p>
                <p className="mt-1 text-xl font-bold">{customer.tier}</p>
              </div>
              <TierBadge tier={customer.tier} />
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--portal-secondary)]">
              Tier rules and service limits are illustrative only; confirm actual limits in the
              bank’s core system.
            </p>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">Transaction PIN lock</span>
              <StatusBadge status={customer.pinLocked ? 'Locked' : 'Not locked'} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">Mobile app access</span>
              <StatusBadge status={customer.status} />
            </div>
          </div>
          <div className="mt-5 rounded-[8px] border border-[var(--color-outline)] p-3 text-xs leading-5 text-[var(--portal-secondary)]">
            Support actions are simulated and require a reason. No PIN, password or credential is
            displayed or collected.
          </div>
        </Card>
      </div>

      <Card className="mb-6 p-[30px]">
        <SectionTitle
          title="Download statement of account"
          detail="Generate a CSV statement from this customer’s fictional demo transactions."
        />
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[180px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
              Start date
            </span>
            <input
              className={inputClass}
              type="date"
              value={statementFrom}
              onChange={(event) => setStatementFrom(event.target.value)}
            />
          </label>
          <label className="block min-w-[180px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
              End date
            </span>
            <input
              className={inputClass}
              type="date"
              value={statementTo}
              onChange={(event) => setStatementTo(event.target.value)}
            />
          </label>
          <button className={primaryButtonClass} type="button" onClick={downloadStatement}>
            <Download size={16} aria-hidden="true" /> Download CSV statement
          </button>
        </div>
      </Card>

      <Card className="p-[30px]">
        <SectionTitle
          title="Transaction history"
          detail={`Showing ${history.length} of ${customerTransactions.length} transactions for this customer`}
        />
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <SearchField
            value={historyQuery}
            onChange={setHistoryQuery}
            label="Reference"
            placeholder="Search transaction reference"
          />
          <FilterSelect
            label="Transaction type"
            value={historyType}
            onChange={setHistoryType}
            options={['All', 'Debit', 'Credit']}
          />
          <FilterSelect
            label="Service"
            value={historyService}
            onChange={setHistoryService}
            options={['All', ...SERVICES]}
          />
          <FilterSelect
            label="Status"
            value={historyStatus}
            onChange={setHistoryStatus}
            options={['All', 'Successful', 'Failed', 'Pending']}
          />
          <label className="block min-w-[140px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
              From date
            </span>
            <input
              className={inputClass}
              type="date"
              value={historyFrom}
              onChange={(event) => setHistoryFrom(event.target.value)}
            />
          </label>
          <label className="block min-w-[140px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--portal-secondary)]">
              To date
            </span>
            <input
              className={inputClass}
              type="date"
              value={historyTo}
              onChange={(event) => setHistoryTo(event.target.value)}
            />
          </label>
        </div>
        {historyFrom && historyTo && historyFrom > historyTo && (
          <p role="alert" className="mb-3 text-xs font-semibold text-[var(--color-warning-40)]">
            The start date must be on or before the end date.
          </p>
        )}
        <TransactionTable transactions={history} onSelect={setSelectedTransaction} compact />
      </Card>

      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[12px] border-[var(--color-outline)] bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left text-lg font-bold text-[var(--color-black)]">
              {action ? actionTitle(action) : 'Customer support action'}
            </DialogTitle>
            <DialogDescription className="text-left">
              For {customer.name} ({customer.id}). This is a demo request; it will not change a real
              bank account.
            </DialogDescription>
          </DialogHeader>
          {action && (
            <form className="space-y-4" onSubmit={submitAction}>
              {action === 'update-details' && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold">
                      Current phone
                      <input
                        className={`${inputClass} mt-1.5`}
                        value={customer.phone}
                        readOnly
                        aria-label="Current phone number"
                      />
                    </label>
                    <label className="block text-xs font-semibold">
                      New phone
                      <input
                        className={`${inputClass} mt-1.5`}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        type="tel"
                        required
                        aria-label="New phone number"
                      />
                    </label>
                    <label className="block text-xs font-semibold">
                      Current email
                      <input
                        className={`${inputClass} mt-1.5`}
                        value={customer.email}
                        readOnly
                        aria-label="Current email address"
                      />
                    </label>
                    <label className="block text-xs font-semibold">
                      New email
                      <input
                        className={`${inputClass} mt-1.5`}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        required
                        aria-label="New email address"
                      />
                    </label>
                    <label className="block text-xs font-semibold sm:col-span-2">
                      Current residential address
                      <input
                        className={`${inputClass} mt-1.5`}
                        value={customer.address}
                        readOnly
                        aria-label="Current residential address"
                      />
                    </label>
                    <label className="block text-xs font-semibold sm:col-span-2">
                      New residential address
                      <input
                        className={`${inputClass} mt-1.5`}
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        required
                        aria-label="New residential address"
                      />
                    </label>
                  </div>
                </div>
              )}
              {action !== 'update-details' && (
                <div className="rounded-[8px] bg-[var(--color-faded-gray-10)] p-4 text-sm leading-5 text-[var(--portal-secondary)]">
                  {action === 'unlock-pin' &&
                    'This submits a request to remove the transaction PIN lock after verification.'}
                  {action === 'unlock-passcode' &&
                    'This submits a request to remove the login passcode lock after verification.'}
                  {action === 'reset-pin' &&
                    'This initiates a secure PIN reset workflow. A PIN will never be shown or collected here.'}
                  {action === 'reset-password' &&
                    'This simulates a secure password reset initiation. A password will never be shown or collected here.'}
                </div>
              )}
              <label className="block text-xs font-semibold">
                Reason for this action (at least 10 characters)
                <textarea
                  className={`${inputClass} mt-1.5 min-h-24 resize-y py-3`}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  minLength={10}
                  required
                  placeholder="Record the customer request or verification performed."
                />
              </label>
              <div className="flex items-start gap-2 rounded-[8px] bg-[var(--color-warning-10)] p-3 text-xs leading-5 text-[var(--color-black)]">
                <CircleAlert
                  className="mt-0.5 shrink-0 text-[var(--color-warning-40)]"
                  size={15}
                  aria-hidden="true"
                />
                Confirm only after following your bank’s identity verification and approval process.
              </div>
              <DialogFooter>
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={() => setAction(null)}
                >
                  Cancel
                </button>
                <button
                  className={primaryButtonClass}
                  type="submit"
                  disabled={reason.trim().length < 10}
                >
                  Confirm demo request
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <TransactionDetails
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}

function AdminSettingsView({ auditEvents }: { auditEvents: AuditEvent[] }) {
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Admin settings"
        description="Review the current demo role, support permissions and audit history."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-[30px]">
          <SectionTitle
            title="Signed-in administrator"
            detail="Demo identity for this portal preview"
          />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-faded-primary-10)] text-[var(--color-primary)]">
              <UserRound size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold">{DEMO_ADMIN.name}</p>
              <p className="mt-1 text-xs text-[var(--portal-secondary)]">{DEMO_ADMIN.email}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[var(--color-outline)] p-4">
            <div>
              <p className="text-xs text-[var(--portal-secondary)]">Current role</p>
              <p className="mt-1 text-sm font-semibold">{DEMO_ADMIN.role}</p>
            </div>
            <StatusBadge status="Demo permissions" />
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--portal-secondary)]">
            In production, permissions must be enforced by the backend and tied to the signed-in
            staff member. This client-side demo does not grant bank access.
          </p>
        </Card>
        <Card className="p-[30px]">
          <SectionTitle
            title="Support safeguards"
            detail="Sensitive tasks available in the customer profile"
          />
          <ul className="space-y-4">
            {[
              'Require a documented reason for customer changes and unlock requests.',
              'Never display or collect customer PINs or passwords.',
              'Confirm identity and approvals before submitting account actions.',
              'Record action, administrator, customer and timestamp in the audit trail.'
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-5">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="p-[30px]">
        <SectionTitle
          title="Customer support audit log"
          detail="Demo audit records are saved in this browser session."
        />
        {!auditEvents.length ? (
          <EmptyState
            title="No support activity yet"
            detail="Completed demo support requests will be listed here."
          />
        ) : (
          <div
            className="overflow-x-auto overscroll-x-contain"
            role="region"
            aria-label="Customer support audit log"
            tabIndex={0}
          >
            <table className="w-full min-w-[1010px] table-fixed text-left">
              <colgroup>
                <col className="w-[200px]" />
                <col className="w-[180px]" />
                <col className="w-[300px]" />
                <col className="w-[150px]" />
                <col className="w-[180px]" />
              </colgroup>
              <thead>
                <tr className="border-y border-[var(--color-outline)] text-xs text-[var(--portal-secondary)]">
                  <th className="px-3 py-3">
                    <TruncatedText title="Action">Action</TruncatedText>
                  </th>
                  <th className="px-3 py-3">
                    <TruncatedText title="Customer">Customer</TruncatedText>
                  </th>
                  <th className="px-3 py-3">
                    <TruncatedText title="Reason">Reason</TruncatedText>
                  </th>
                  <th className="px-3 py-3">
                    <TruncatedText title="Admin">Admin</TruncatedText>
                  </th>
                  <th className="px-3 py-3">
                    <TruncatedText title="Timestamp">Timestamp</TruncatedText>
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-[var(--color-outline)] last:border-0"
                  >
                    <td className="px-3 py-4 text-sm font-semibold">
                      <TruncatedText title={event.action}>{event.action}</TruncatedText>
                    </td>
                    <td className="px-3 py-4">
                      <Link
                        className="block truncate whitespace-nowrap text-sm font-semibold hover:text-[var(--color-primary)]"
                        href={`/customers/${event.customerId}`}
                        title={`${event.customerName} · ${event.customerId}`}
                      >
                        {event.customerName}{' '}
                        <span className="font-mono text-xs text-[var(--portal-secondary)]">
                          · {event.customerId}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <TruncatedText title={event.reason}>{event.reason}</TruncatedText>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <TruncatedText title={event.admin}>{event.admin}</TruncatedText>
                    </td>
                    <td className="px-3 py-4 text-xs text-[var(--portal-secondary)]">
                      <TruncatedText title={dateTime(event.createdAt)}>
                        {dateTime(event.createdAt)}
                      </TruncatedText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function NotFoundCustomer({ customerId }: { customerId: string }) {
  return (
    <Card className="mx-auto max-w-xl p-[30px] text-center">
      <CircleAlert
        className="mx-auto mb-3 text-[var(--color-warning-40)]"
        size={28}
        aria-hidden="true"
      />
      <h1 className="text-lg font-bold">Customer not found</h1>
      <p className="mt-2 text-sm text-[var(--portal-secondary)]">
        No demo customer exists with ID {customerId}.
      </p>
      <Link href="/customers" className={`${primaryButtonClass} mt-5`}>
        Return to customers
      </Link>
    </Card>
  );
}

function isStoredAuditEvent(value: unknown): value is AuditEvent {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return ['id', 'action', 'customerId', 'customerName', 'reason', 'admin', 'createdAt'].every(
    (key) => typeof record[key] === 'string'
  );
}

function isStoredCustomerDetails(
  value: unknown
): value is Pick<Customer, 'id' | 'phone' | 'email' | 'address'> {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return ['id', 'phone', 'email', 'address'].every((key) => typeof record[key] === 'string');
}

export default function MicrofinancePortal() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(DEMO_AUDIT_EVENTS);
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [sessionDataReady, setSessionDataReady] = useState(false);

  useEffect(() => {
    try {
      const storedAudit = window.sessionStorage.getItem('microfinance-demo-audit');
      const storedCustomers = window.sessionStorage.getItem('microfinance-demo-customers');
      if (storedAudit) {
        const parsedAudit: unknown = JSON.parse(storedAudit);
        if (Array.isArray(parsedAudit)) {
          const validEvents = parsedAudit.filter(isStoredAuditEvent);
          if (validEvents.length !== parsedAudit.length) {
            toast.error('Some demo audit entries could not be read', {
              description: 'Invalid entries were omitted from the session audit log.'
            });
          }
          setAuditEvents(validEvents);
        }
      }
      if (storedCustomers) {
        const parsedCustomers: unknown = JSON.parse(storedCustomers);
        if (Array.isArray(parsedCustomers)) {
          const storedById = new Map(
            parsedCustomers.filter(isStoredCustomerDetails).map((record) => [record.id, record])
          );
          setCustomers((current) =>
            current.map((customerRecord) => {
              const details = storedById.get(customerRecord.id);
              return details ? { ...customerRecord, ...details } : customerRecord;
            })
          );
        }
      }
    } catch {
      toast.error('Could not read the demo session data', {
        description: 'The portal will continue with its sample records.'
      });
    } finally {
      setSessionDataReady(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionDataReady) return;
    try {
      window.sessionStorage.setItem('microfinance-demo-audit', JSON.stringify(auditEvents));
      window.sessionStorage.setItem(
        'microfinance-demo-customers',
        JSON.stringify(
          customers.map(({ id, phone, email, address }) => ({ id, phone, email, address }))
        )
      );
    } catch {
      toast.error('Could not save demo session changes', {
        description: 'This browser could not store the latest audit or profile updates.'
      });
    }
  }, [auditEvents, customers, sessionDataReady]);

  const recordAudit = (event: Omit<AuditEvent, 'id' | 'createdAt' | 'admin'>) => {
    const entry: AuditEvent = {
      ...event,
      id: `AUD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      admin: DEMO_ADMIN.name
    };
    setAuditEvents((current) => [entry, ...current]);
  };

  const updateCustomerDetails = (
    customerId: string,
    details: Pick<Customer, 'phone' | 'email' | 'address'>
  ) => {
    const updatedCustomers = customers.map((customerRecord) =>
      customerRecord.id === customerId ? { ...customerRecord, ...details } : customerRecord
    );
    setCustomers(updatedCustomers);
    try {
      window.sessionStorage.setItem(
        'microfinance-demo-customers',
        JSON.stringify(
          updatedCustomers.map(({ id, phone, email, address }) => ({ id, phone, email, address }))
        )
      );
    } catch {
      toast.error('Could not save the demo profile update', {
        description: 'This browser could not store the latest customer details.'
      });
    }
  };

  const parts = pathname.split('/').filter(Boolean);
  const isProfile = parts[0] === 'customers' && parts.length > 1;
  const customer = isProfile ? customers.find((record) => record.id === parts[1]) : undefined;
  const section = isProfile ? 'customer profile' : (parts[0] || 'dashboard').replaceAll('-', ' ');

  const selectCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  if (isProfile) {
    if (!customer) return <NotFoundCustomer customerId={parts[1]} />;
    return (
      <>
        <CustomerProfileView
          key={customer.id}
          customer={customer}
          onAudit={recordAudit}
          onUpdate={(details) => updateCustomerDetails(customer.id, details)}
        />
      </>
    );
  }

  if (section === 'customers')
    return <CustomersView customers={customers} onOpen={selectCustomer} />;
  if (section === 'transactions')
    return (
      <>
        <TransactionsView onSelect={setSelectedTransaction} />
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </>
    );
  if (section === 'service activity') return <ServiceActivityView />;
  if (section === 'admin settings') return <AdminSettingsView auditEvents={auditEvents} />;
  return (
    <>
      <DashboardView customers={customers} onTransaction={setSelectedTransaction} />
      <TransactionDetails
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}
