'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  ArrowDownToLine,
  Building2,
  Clock3,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tillService } from './service';
import {
  ADMIN_ACTOR_ID,
  CreateTillUserInput,
  CreateTillAccountInput,
  SweepType,
  TillAccount,
  TillState,
  TillSweepRecord,
  TillUser
} from './types';

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 2
});

const lagosDateTime = (date: string) =>
  new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));

const lagosDateKey = (date: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));

interface Confirmation {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

interface UserForm {
  fullName: string;
  username: string;
  password: string;
  tillId: string;
}

const emptyUserForm: UserForm = { fullName: '', username: '', password: '', tillId: '' };

const StatusPill = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-600' : 'bg-gray-400'}`} />
    {children}
  </span>
);

const EmptyState = ({ title, detail }: { title: string; detail: string }) => (
  <div className="px-5 py-12 text-center">
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
      <Search className="h-5 w-5" />
    </div>
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{detail}</p>
  </div>
);

const FieldLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
    {children}
  </label>
);

const TillManagement = () => {
  const [state, setState] = useState<TillState | null>(null);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('accounts');
  const [search, setSearch] = useState('');
  const [accountStatus, setAccountStatus] = useState('all');
  const [historyAccount, setHistoryAccount] = useState('all');
  const [historyUser, setHistoryUser] = useState('all');
  const [historySweepType, setHistorySweepType] = useState('all');
  const [historyFrom, setHistoryFrom] = useState('');
  const [historyTo, setHistoryTo] = useState('');
  const [selectedTillId, setSelectedTillId] = useState<string | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm);
  const [reassignmentDialog, setReassignmentDialog] = useState<{
    userId: string;
    tillId: string;
  } | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [collectionDialog, setCollectionDialog] = useState<{
    tillId: string;
    amount: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const load = () => {
    try {
      setState(tillService.load());
      setLoadError('');
    } catch {
      setLoadError('Till demo data could not be loaded from this browser.');
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const updateState = (operation: (current: TillState) => TillState, successMessage: string) => {
    if (!state) return false;
    try {
      const nextState = operation(state);
      setState(nextState);
      toast.success(successMessage, { closeButton: true, richColors: true });
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The action could not be completed.', {
        closeButton: true,
        richColors: true
      });
      return false;
    }
  };

  const findUser = (userId?: string) => state?.users.find((user) => user.id === userId);
  const findAccount = (tillId?: string) => state?.accounts.find((account) => account.id === tillId);
  const selectedTill = findAccount(selectedTillId ?? undefined);
  const selectedActiveUser = selectedTill ? findUser(selectedTill.activeShift?.userId) : undefined;

  const activeShiftCount = state?.accounts.filter((account) => account.activeShift).length ?? 0;
  const totalShiftBalance =
    state?.accounts.reduce((total, account) => total + account.shiftBalance, 0) ?? 0;

  const filteredAccounts = useMemo(() => {
    if (!state) return [];
    const query = search.trim().toLowerCase();
    return state.accounts.filter((account) => {
      const activeUser = state.users.find((user) => user.id === account.activeShift?.userId);
      const matchesQuery = [account.name, account.accountNumber, activeUser?.fullName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
      const matchesStatus =
        accountStatus === 'all' ||
        (accountStatus === 'open' ? !!account.activeShift : !account.activeShift);
      return matchesQuery && matchesStatus;
    });
  }, [state, search, accountStatus]);

  const filteredUsers = useMemo(() => {
    if (!state) return [];
    const query = search.trim().toLowerCase();
    return state.users.filter((user) => {
      const till = state.accounts.find((account) => account.id === user.tillId);
      return [user.fullName, user.username, till?.name, till?.accountNumber]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  }, [state, search]);

  const filteredHistory = useMemo(() => {
    if (!state) return [];
    const query = search.trim().toLowerCase();
    return state.sweeps.filter((record) => {
      const account = state.accounts.find((item) => item.id === record.tillId);
      const user = state.users.find((item) => item.id === record.userId);
      const dateKey = lagosDateKey(record.deactivatedAt);
      const matchesSearch = [account?.name, account?.accountNumber, user?.fullName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
      return (
        matchesSearch &&
        (historyAccount === 'all' || record.tillId === historyAccount) &&
        (historyUser === 'all' || record.userId === historyUser) &&
        (historySweepType === 'all' || record.sweepType === historySweepType) &&
        (!historyFrom || dateKey >= historyFrom) &&
        (!historyTo || dateKey <= historyTo)
      );
    });
  }, [state, search, historyAccount, historyUser, historySweepType, historyFrom, historyTo]);

  const confirmActivation = (account: TillAccount, user: TillUser) => {
    setConfirmation({
      title: 'Activate till user?',
      description: `${user.fullName} will start a new shift on ${account.name} with a ₦0 opening balance. No other user can operate this till until the shift is closed.`,
      confirmLabel: 'Activate user',
      onConfirm: () => {
        updateState(
          (current) => tillService.activateUser(current, account.id, user.id, ADMIN_ACTOR_ID),
          `${user.fullName} is active on this till.`
        );
      }
    });
  };

  const confirmManualSweep = (account: TillAccount) => {
    const user = findUser(account.activeShift?.userId);
    setConfirmation({
      title: 'Close shift and simulate sweep?',
      description: `${user?.fullName ?? 'The active user'}’s shift will close. ${naira.format(account.shiftBalance)} will be recorded as swept to the business account, and the till balance will reset to ₦0. This is a demo only; no funds move.`,
      confirmLabel: 'Close shift and sweep',
      onConfirm: () => {
        if (
          updateState(
            (current) => tillService.deactivateUser(current, account.id, ADMIN_ACTOR_ID),
            'Shift closed and simulated sweep recorded.'
          )
        ) {
          setSelectedTillId(account.id);
        }
      }
    });
  };

  const confirmEndOfDay = () => {
    setConfirmation({
      title: 'Simulate end-of-day sweep?',
      description: `All ${activeShiftCount} open shift${activeShiftCount === 1 ? '' : 's'} will be closed and timestamped at 11:59 PM Africa/Lagos time today. Each balance will be recorded separately and reset to ₦0. This browser action is for demonstration and does not schedule production sweeps.`,
      confirmLabel: 'Simulate automatic sweep',
      onConfirm: () => {
        if (
          updateState(
            (current) => tillService.simulateEndOfDaySweep(current, ADMIN_ACTOR_ID),
            'End-of-day demo sweep completed.'
          )
        ) {
          setActiveTab('history');
        }
      }
    });
  };

  const handleCreateUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: CreateTillUserInput = userForm;
    if (
      updateState(
        (current) => tillService.createUser(current, input, ADMIN_ACTOR_ID),
        'Till user created and assigned.'
      )
    ) {
      setUserForm(emptyUserForm);
      setUserDialogOpen(false);
    }
  };

  const handleCreateAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: CreateTillAccountInput = { name: accountName };
    if (
      updateState(
        (current) => tillService.createAccount(current, input, ADMIN_ACTOR_ID),
        `DemoPrefix ${accountName.trim().replace(/^demoprefix\s*/i, '')} created.`
      )
    ) {
      setAccountName('');
      setAccountDialogOpen(false);
      setSearch('');
      setAccountStatus('all');
      setActiveTab('accounts');
    }
  };

  const handleCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!collectionDialog) return;
    const amount = Number(collectionDialog.amount);
    if (
      updateState(
        (current) => tillService.addCollection(current, collectionDialog.tillId, amount),
        'Simulated collection added to the active shift.'
      )
    ) {
      setCollectionDialog(null);
    }
  };

  const handleReassignment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reassignmentDialog) return;
    const user = findUser(reassignmentDialog.userId);
    if (!user || reassignmentDialog.tillId === user.tillId) return;
    if (
      updateState(
        (current) =>
          tillService.reassignUser(current, user.id, reassignmentDialog.tillId, ADMIN_ACTOR_ID),
        `${user.fullName} has been reassigned.`
      )
    ) {
      setReassignmentDialog(null);
    }
  };

  const requestRemoval = (user: TillUser) => {
    setConfirmation({
      title: 'Delete till user?',
      description: `${user.fullName} will be deleted from the till user list and their current till assignment.`,
      confirmLabel: 'Delete user',
      destructive: true,
      onConfirm: () => {
        updateState(
          (current) => tillService.removeUser(current, user.id, ADMIN_ACTOR_ID),
          `${user.fullName} has been deleted.`
        );
      }
    });
  };

  const showLoadError = loadError && !state;
  if (!state && !showLoadError) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 rounded-md bg-white px-5 py-4 text-sm text-gray-600 shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
          Loading Till Management…
        </div>
      </div>
    );
  }

  if (showLoadError) {
    return (
      <div className="mx-auto max-w-2xl rounded-md border border-red-200 bg-white p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-6 w-6 text-red-600" />
        <h1 className="font-semibold text-gray-900">Till Management is unavailable</h1>
        <p className="mt-1 text-sm text-gray-600">{loadError}</p>
        <Button className="mt-4" onClick={load}>
          Try again
        </Button>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] space-y-4 rounded-md bg-[#f1f3f5] p-3 sm:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">Till Management</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Demo mode
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Manage till access, shifts and simulated balance sweeps.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <Clock3 className="h-4 w-4 text-gray-400" />
            <span>Africa/Lagos</span>
            <span className="font-medium text-gray-900">
              {currentTime.toLocaleTimeString('en-NG', {
                timeZone: 'Africa/Lagos',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <Button
            variant="outline"
            className="border-emerald-700 bg-white text-emerald-700 hover:bg-emerald-50"
            onClick={confirmEndOfDay}
            disabled={activeShiftCount === 0}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Simulate end-of-day sweep
          </Button>
          <Button
            className="bg-emerald-700 text-white hover:bg-emerald-800"
            onClick={() => setAccountDialogOpen(true)}
          >
            <Building2 className="h-4 w-4" />
            Create till account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Till accounts</p>
            <p className="text-lg font-semibold text-gray-900">{state.accounts.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Open shifts</p>
            <p className="text-lg font-semibold text-gray-900">{activeShiftCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50 text-green-700">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Current shift balances</p>
            <p className="text-lg font-semibold text-gray-900">{naira.format(totalShiftBalance)}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0 text-gray-500">
            <TabsTrigger
              value="accounts"
              className="rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-emerald-700 data-[state=active]:bg-transparent data-[state=active]:text-emerald-800 data-[state=active]:shadow-none"
            >
              Till accounts <span className="ml-1 text-xs">{state.accounts.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-emerald-700 data-[state=active]:bg-transparent data-[state=active]:text-emerald-800 data-[state=active]:shadow-none"
            >
              Till users <span className="ml-1 text-xs">{state.users.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-emerald-700 data-[state=active]:bg-transparent data-[state=active]:text-emerald-800 data-[state=active]:shadow-none"
            >
              Balance history <span className="ml-1 text-xs">{state.sweeps.length}</span>
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full pb-2 sm:w-64 sm:pb-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                activeTab === 'accounts'
                  ? 'Search till accounts...'
                  : activeTab === 'users'
                    ? 'Search till users...'
                    : 'Search till history...'
              }
              aria-label="Search current Till Management view"
              className="bg-white pl-9"
            />
          </div>
        </div>

        <TabsContent value="accounts" className="mt-4">
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  All Till Accounts ({filteredAccounts.length})
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Shift balances are separate from the business account.
                </p>
              </div>
              <select
                aria-label="Filter by shift status"
                value={accountStatus}
                onChange={(event) => setAccountStatus(event.target.value)}
                className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                <option value="all">All shift statuses</option>
                <option value="open">Shift open</option>
                <option value="closed">Shift closed</option>
              </select>
            </div>
            {filteredAccounts.length === 0 ? (
              <EmptyState
                title="No till accounts found"
                detail="Try another account name, number or shift status."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Account name</th>
                      <th className="px-4 py-3">Account number</th>
                      <th className="px-4 py-3">Shift balance</th>
                      <th className="px-4 py-3">Assigned users</th>
                      <th className="px-4 py-3">Active user</th>
                      <th className="px-4 py-3">Shift status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAccounts.map((account) => {
                      const activeUser = findUser(account.activeShift?.userId);
                      const assignedUsers = account.assignedUserIds
                        .map((userId) => findUser(userId))
                        .filter((user): user is TillUser => Boolean(user));
                      return (
                        <tr key={account.id} className="text-gray-700 hover:bg-gray-50/70">
                          <td className="px-4 py-3 font-medium text-gray-900">{account.name}</td>
                          <td className="px-4 py-3 tabular-nums text-gray-500">
                            {account.accountNumber}
                          </td>
                          <td className="px-4 py-3 font-medium tabular-nums">
                            {naira.format(account.shiftBalance)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700">{assignedUsers.length} assigned</span>
                            <span className="ml-1 text-xs text-gray-400">
                              {assignedUsers.map((user) => user.fullName).join(', ') || 'None'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {activeUser?.fullName ?? <span className="text-gray-400">None</span>}
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill active={!!account.activeShift}>
                              {account.activeShift ? 'Shift open' : 'Shift closed'}
                            </StatusPill>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="link"
                              className="h-auto p-0 text-emerald-700"
                              onClick={() => setSelectedTillId(account.id)}
                            >
                              View details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Till Users ({filteredUsers.length})
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Assignment does not activate a user or grant payment access.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-emerald-700 text-white hover:bg-emerald-800"
                onClick={() => setUserDialogOpen(true)}
              >
                <Plus className="h-4 w-4" /> Add user
              </Button>
            </div>
            {filteredUsers.length === 0 ? (
              <EmptyState
                title="No till users found"
                detail="Create a till user or adjust your search."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Assigned till</th>
                      <th className="px-4 py-3">Access status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => {
                      const till = findAccount(user.tillId);
                      const isActive = till?.activeShift?.userId === user.id;
                      return (
                        <tr key={user.id} className="text-gray-700">
                          <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                          <td className="px-4 py-3 text-gray-500">@{user.username}</td>
                          <td className="px-4 py-3">{till?.name ?? 'Unassigned'}</td>
                          <td className="px-4 py-3">
                            <StatusPill active={isActive}>
                              {isActive ? 'Active on till' : 'Inactive'}
                            </StatusPill>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isActive}
                                onClick={() =>
                                  setReassignmentDialog({ userId: user.id, tillId: user.tillId })
                                }
                              >
                                <ArrowRightLeft className="h-4 w-4" /> Reassign to till account
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-700 hover:bg-red-50 hover:text-red-800"
                                disabled={isActive}
                                aria-label={`Delete ${user.fullName}`}
                                onClick={() => requestRemoval(user)}
                              >
                                <X className="h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="space-y-3 border-b border-gray-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Till Balance History ({filteredHistory.length})
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Every record represents a simulated sweep. Times are shown in Africa/Lagos.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <select
                  aria-label="Filter history by till"
                  value={historyAccount}
                  onChange={(event) => setHistoryAccount(event.target.value)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
                >
                  <option value="all">All till accounts</option>
                  {state.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter history by user"
                  value={historyUser}
                  onChange={(event) => setHistoryUser(event.target.value)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
                >
                  <option value="all">All assigned users</option>
                  {state.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter history by sweep type"
                  value={historySweepType}
                  onChange={(event) => setHistorySweepType(event.target.value)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
                >
                  <option value="all">All sweep types</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
                <Input
                  type="date"
                  aria-label="From date"
                  value={historyFrom}
                  onChange={(event) => setHistoryFrom(event.target.value)}
                  className="h-9"
                />
                <Input
                  type="date"
                  aria-label="To date"
                  value={historyTo}
                  onChange={(event) => setHistoryTo(event.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            {filteredHistory.length === 0 ? (
              <EmptyState
                title="No sweep records found"
                detail={
                  state.sweeps.length
                    ? 'Try changing your search or filters.'
                    : 'Completed manual and automatic sweeps will appear here.'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Till account</th>
                      <th className="px-4 py-3">Account number</th>
                      <th className="px-4 py-3">Active user</th>
                      <th className="px-4 py-3">Time activated</th>
                      <th className="px-4 py-3">Time deactivated</th>
                      <th className="px-4 py-3">Balance before activation</th>
                      <th className="px-4 py-3">Balance before sweep</th>
                      <th className="px-4 py-3">Sweep type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHistory.map((record) => (
                      <HistoryRow key={record.id} record={record} state={state} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Isolated demo:</strong> collections and sweeps only change this browser’s demo
          data. The end-of-day action uses Africa/Lagos time when run; it is not a production
          scheduler and no funds are transferred.
        </p>
      </div>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create till user</DialogTitle>
            <DialogDescription>
              Assign the user to a till. Assignment alone does not grant collection access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <FieldLabel htmlFor="till-full-name">Full name</FieldLabel>
              <Input
                id="till-full-name"
                value={userForm.fullName}
                onChange={(event) => setUserForm({ ...userForm, fullName: event.target.value })}
                autoComplete="name"
                required
                minLength={2}
              />
            </div>
            <div>
              <FieldLabel htmlFor="till-username">Username</FieldLabel>
              <Input
                id="till-username"
                value={userForm.username}
                onChange={(event) => setUserForm({ ...userForm, username: event.target.value })}
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9._-]+"
              />
            </div>
            <div>
              <FieldLabel htmlFor="till-password">Password</FieldLabel>
              <Input
                id="till-password"
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                autoComplete="new-password"
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Demo only: this password is validated and discarded; no authentication is performed.
              </p>
            </div>
            <div>
              <FieldLabel htmlFor="assigned-till">Assigned till account</FieldLabel>
              <select
                id="assigned-till"
                value={userForm.tillId}
                onChange={(event) => setUserForm({ ...userForm, tillId: event.target.value })}
                required
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="" disabled>
                  Select a till account
                </option>
                {state.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {account.accountNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-700 text-white hover:bg-emerald-800">
                <UserPlus className="h-4 w-4" /> Create user
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(reassignmentDialog)}
        onOpenChange={(open) => {
          if (!open) setReassignmentDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reassign to till account</DialogTitle>
            <DialogDescription>
              Choose the till account for{' '}
              {findUser(reassignmentDialog?.userId)?.fullName ?? 'this user'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReassignment} className="space-y-4">
            <div>
              <FieldLabel htmlFor="reassignment-till">Till account</FieldLabel>
              <select
                id="reassignment-till"
                aria-label="Till account"
                value={reassignmentDialog?.tillId ?? ''}
                onChange={(event) =>
                  setReassignmentDialog((current) =>
                    current ? { ...current, tillId: event.target.value } : current
                  )
                }
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
                required
              >
                {state.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setReassignmentDialog(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-700 text-white hover:bg-emerald-800"
                disabled={
                  !reassignmentDialog ||
                  reassignmentDialog.tillId === findUser(reassignmentDialog.userId)?.tillId
                }
              >
                Reassign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create till account</DialogTitle>
            <DialogDescription>
              Add a demo till account. It starts with a ₦0 shift balance and no assigned users.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <FieldLabel htmlFor="till-account-name">Till account name</FieldLabel>
              <div className="flex h-10 w-full overflow-hidden rounded-md border border-input bg-white focus-within:ring-2 focus-within:ring-ring">
                <span className="inline-flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600">
                  DemoPrefix
                </span>
                <input
                  id="till-account-name"
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={60}
                  autoFocus
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                The saved account name will begin with “DemoPrefix”.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAccountDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-700 text-white hover:bg-emerald-800">
                <Building2 className="h-4 w-4" /> Create account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!collectionDialog} onOpenChange={(open) => !open && setCollectionDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simulate a collection</DialogTitle>
            <DialogDescription>
              This adds a demo collection to the currently active user’s shift balance only.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCollection} className="space-y-4">
            <div>
              <FieldLabel htmlFor="collection-amount">Collection amount (NGN)</FieldLabel>
              <Input
                id="collection-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                required
                autoFocus
                value={collectionDialog?.amount ?? ''}
                onChange={(event) =>
                  setCollectionDialog((current) =>
                    current ? { ...current, amount: event.target.value } : current
                  )
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCollectionDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-700 text-white hover:bg-emerald-800">
                Add collection
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTillId} onOpenChange={(open) => !open && setSelectedTillId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedTill && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTill.name}</DialogTitle>
                <DialogDescription>
                  Account {selectedTill.accountNumber} · Till details and shift access
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Current shift balance</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {naira.format(selectedTill.shiftBalance)}
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Shift status</p>
                  <div className="mt-2">
                    <StatusPill active={!!selectedTill.activeShift}>
                      {selectedTill.activeShift ? 'Shift open' : 'Shift closed'}
                    </StatusPill>
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Assigned users</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {selectedTill.assignedUserIds.length}
                  </p>
                </div>
              </div>
              {selectedTill.activeShift && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-medium uppercase text-emerald-800">Active shift</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedActiveUser?.fullName ?? 'Unknown user'}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Activated {lagosDateTime(selectedTill.activeShift.activatedAt)} ·
                        Africa/Lagos
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Opening balance: {naira.format(selectedTill.activeShift.openingBalance)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-700 bg-white text-emerald-800"
                        onClick={() => setCollectionDialog({ tillId: selectedTill.id, amount: '' })}
                      >
                        Simulate collection
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-700 text-white hover:bg-emerald-800"
                        onClick={() => confirmManualSweep(selectedTill)}
                      >
                        Close shift &amp; sweep
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 border-t border-emerald-200 pt-2 text-xs text-emerald-900">
                    Only this active user can collect on the till. Deactivation is
                    administrator-controlled.
                  </p>
                </div>
              )}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Assigned users</h3>
                {selectedTill.assignedUserIds.length === 0 ? (
                  <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                    No users are assigned to this till yet.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                    {selectedTill.assignedUserIds.map((userId) => {
                      const user = findUser(userId);
                      if (!user) return null;
                      const isActive = selectedTill.activeShift?.userId === user.id;
                      return (
                        <div
                          key={user.id}
                          className="flex flex-col justify-between gap-3 px-3 py-3 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusPill active={isActive}>
                              {isActive ? 'Active' : 'Inactive'}
                            </StatusPill>
                            {!isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!!selectedTill.activeShift}
                                title={
                                  selectedTill.activeShift
                                    ? 'Close the current shift before activating another user'
                                    : undefined
                                }
                                onClick={() => confirmActivation(selectedTill, user)}
                              >
                                Activate user
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedTill.activeShift && (
                  <p className="mt-2 text-xs text-amber-700">
                    Close the active shift before another assigned user can be activated.
                  </p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Recent sweep history</h3>
                {state.sweeps.filter((record) => record.tillId === selectedTill.id).length === 0 ? (
                  <p className="rounded-md border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500">
                    No sweeps recorded for this till.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                    {state.sweeps
                      .filter((record) => record.tillId === selectedTill.id)
                      .slice(0, 4)
                      .map((record) => (
                        <div
                          key={record.id}
                          className="flex flex-col justify-between gap-1 px-3 py-2.5 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {findUser(record.userId)?.fullName ?? 'Removed user'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {lagosDateTime(record.deactivatedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-800">
                              {naira.format(record.balanceBeforeSweep)}
                            </span>
                            <SweepPill type={record.sweepType} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmation} onOpenChange={(open) => !open && setConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmation?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmation?.destructive
                  ? 'bg-red-700 text-white hover:bg-red-800'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }
              onClick={() => {
                confirmation?.onConfirm();
                setConfirmation(null);
              }}
            >
              {confirmation?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const SweepPill = ({ type }: { type: SweepType }) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-medium ${type === 'automatic' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
  >
    {type === 'automatic' ? 'Automatic' : 'Manual'}
  </span>
);

const HistoryRow = ({ record, state }: { record: TillSweepRecord; state: TillState }) => {
  const account = state.accounts.find((item) => item.id === record.tillId);
  const user = state.users.find((item) => item.id === record.userId);
  return (
    <tr className="text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900">{account?.name ?? 'Removed till'}</td>
      <td className="px-4 py-3 tabular-nums text-gray-500">{account?.accountNumber ?? '—'}</td>
      <td className="px-4 py-3">{user?.fullName ?? 'Removed user'}</td>
      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
        {lagosDateTime(record.activatedAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
        {lagosDateTime(record.deactivatedAt)}
      </td>
      <td className="px-4 py-3 tabular-nums">{naira.format(record.openingBalance)}</td>
      <td className="px-4 py-3 font-medium tabular-nums">
        {naira.format(record.balanceBeforeSweep)}
      </td>
      <td className="px-4 py-3">
        <SweepPill type={record.sweepType} />
      </td>
    </tr>
  );
};

export default TillManagement;
