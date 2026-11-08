import { createInitialTillState, loadTillState, saveTillState } from './repository';
import {
  ADMIN_ACTOR_ID,
  CreateTillAccountInput,
  CreateTillUserInput,
  TillAccount,
  TillState,
  TillSweepRecord,
  TillUser,
  SweepType
} from './types';

const findAccount = (state: TillState, tillId: string) => {
  const account = state.accounts.find((item) => item.id === tillId);
  if (!account) throw new Error('Till account could not be found.');
  return account;
};

const findUser = (state: TillState, userId: string) => {
  const user = state.users.find((item) => item.id === userId);
  if (!user) throw new Error('Till user could not be found.');
  return user;
};

const requireAdministrator = (actorId: string, userId?: string) => {
  if (actorId !== ADMIN_ACTOR_ID) throw new Error('Only an authorised administrator can do this.');
  if (userId && actorId === userId) throw new Error('A till user cannot manage their own access.');
};

const commit = (state: TillState) => saveTillState(state);

const getLagosEndOfDayTimestamp = (now = new Date()) => {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const datePart = (type: string) => dateParts.find((part) => part.type === type)?.value ?? '';
  const localEndOfDayAsUtc = Date.UTC(
    Number(datePart('year')),
    Number(datePart('month')) - 1,
    Number(datePart('day')),
    23,
    59
  );
  const lagosParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(localEndOfDayAsUtc));
  const lagosPart = (type: string) => Number(lagosParts.find((part) => part.type === type)?.value);
  const representedAsUtc = Date.UTC(
    lagosPart('year'),
    lagosPart('month') - 1,
    lagosPart('day'),
    lagosPart('hour'),
    lagosPart('minute'),
    lagosPart('second')
  );
  return new Date(localEndOfDayAsUtc - (representedAsUtc - localEndOfDayAsUtc)).toISOString();
};

export const tillService = {
  load(): TillState {
    return loadTillState();
  },

  resetDemo(): TillState {
    return commit(createInitialTillState());
  },

  createAccount(
    state: TillState,
    input: CreateTillAccountInput,
    actorId = ADMIN_ACTOR_ID
  ): TillState {
    requireAdministrator(actorId);
    const enteredName = input.name.trim().replace(/^demoprefix\s*/i, '');
    if (enteredName.length < 2)
      throw new Error('Enter a till account name with at least 2 characters.');
    if (enteredName.length > 60)
      throw new Error('Till account name must be 60 characters or fewer.');

    const name = `DemoPrefix ${enteredName}`;
    if (state.accounts.some((account) => account.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('A till account with that name already exists.');
    }

    let accountNumber = '';
    do {
      accountNumber = String(Math.floor(1_000_000_000 + Math.random() * 9_000_000_000));
    } while (state.accounts.some((account) => account.accountNumber === accountNumber));

    const account: TillAccount = {
      id: `till-${crypto.randomUUID()}`,
      name,
      accountNumber,
      shiftBalance: 0,
      assignedUserIds: [],
      activeShift: null
    };

    return commit({ ...state, accounts: [...state.accounts, account] });
  },

  createUser(state: TillState, input: CreateTillUserInput, actorId = ADMIN_ACTOR_ID): TillState {
    requireAdministrator(actorId);
    const fullName = input.fullName.trim();
    const username = input.username.trim().toLowerCase();
    if (fullName.length < 2) throw new Error('Enter the till user’s full name.');
    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
      throw new Error(
        'Username must be 3–30 characters using letters, numbers, dots, hyphens or underscores.'
      );
    }
    if (input.password.length < 8) throw new Error('Password must be at least 8 characters.');
    const account = findAccount(state, input.tillId);
    if (state.users.some((user) => user.username.toLowerCase() === username)) {
      throw new Error('That username is already in use.');
    }

    const user: TillUser = {
      id: `user-${crypto.randomUUID()}`,
      fullName,
      username,
      tillId: account.id,
      createdAt: new Date().toISOString()
    };
    const nextState = {
      ...state,
      users: [...state.users, user],
      accounts: state.accounts.map((item) =>
        item.id === account.id
          ? { ...item, assignedUserIds: [...item.assignedUserIds, user.id] }
          : item
      )
    };
    return commit(nextState);
  },

  reassignUser(
    state: TillState,
    userId: string,
    tillId: string,
    actorId = ADMIN_ACTOR_ID
  ): TillState {
    requireAdministrator(actorId, userId);
    const user = findUser(state, userId);
    const targetAccount = findAccount(state, tillId);
    const currentAccount = findAccount(state, user.tillId);
    if (currentAccount.activeShift?.userId === user.id) {
      throw new Error('Close this user’s active shift before reassigning them.');
    }
    if (currentAccount.id === targetAccount.id) return state;

    const nextState = {
      ...state,
      users: state.users.map((item) => (item.id === user.id ? { ...item, tillId } : item)),
      accounts: state.accounts.map((item) => {
        if (item.id === currentAccount.id) {
          return { ...item, assignedUserIds: item.assignedUserIds.filter((id) => id !== user.id) };
        }
        if (item.id === targetAccount.id) {
          return { ...item, assignedUserIds: [...item.assignedUserIds, user.id] };
        }
        return item;
      })
    };
    return commit(nextState);
  },

  removeUser(state: TillState, userId: string, actorId = ADMIN_ACTOR_ID): TillState {
    requireAdministrator(actorId, userId);
    const user = findUser(state, userId);
    const account = findAccount(state, user.tillId);
    if (account.activeShift?.userId === user.id) {
      throw new Error('Close this user’s active shift before removing them.');
    }
    return commit({
      ...state,
      users: state.users.filter((item) => item.id !== userId),
      accounts: state.accounts.map((item) =>
        item.id === account.id
          ? { ...item, assignedUserIds: item.assignedUserIds.filter((id) => id !== userId) }
          : item
      )
    });
  },

  activateUser(
    state: TillState,
    tillId: string,
    userId: string,
    actorId = ADMIN_ACTOR_ID
  ): TillState {
    requireAdministrator(actorId, userId);
    const account = findAccount(state, tillId);
    const user = findUser(state, userId);
    if (user.tillId !== account.id || !account.assignedUserIds.includes(user.id)) {
      throw new Error('Only a user assigned to this till can be activated.');
    }
    if (account.activeShift) {
      throw new Error('Close the current user’s shift before activating another user.');
    }
    if (state.accounts.some((item) => item.activeShift?.userId === user.id)) {
      throw new Error('This user already has an open shift.');
    }

    return commit({
      ...state,
      accounts: state.accounts.map((item) =>
        item.id === account.id
          ? {
              ...item,
              shiftBalance: 0,
              activeShift: {
                userId: user.id,
                activatedAt: new Date().toISOString(),
                openingBalance: 0
              }
            }
          : item
      )
    });
  },

  addCollection(state: TillState, tillId: string, amount: number): TillState {
    const account = findAccount(state, tillId);
    if (!account.activeShift)
      throw new Error('A shift must be open before a collection can be recorded.');
    if (!Number.isFinite(amount) || amount <= 0)
      throw new Error('Enter a collection amount greater than zero.');
    return commit({
      ...state,
      accounts: state.accounts.map((item) =>
        item.id === account.id ? { ...item, shiftBalance: item.shiftBalance + amount } : item
      )
    });
  },

  deactivateUser(state: TillState, tillId: string, actorId = ADMIN_ACTOR_ID): TillState {
    requireAdministrator(actorId);
    const account = findAccount(state, tillId);
    if (!account.activeShift) throw new Error('There is no open shift on this till.');
    return commit(this.closeShift(state, account, 'manual'));
  },

  simulateEndOfDaySweep(state: TillState, actorId = ADMIN_ACTOR_ID): TillState {
    requireAdministrator(actorId);
    const activeAccounts = state.accounts.filter((account) => account.activeShift);
    if (activeAccounts.length === 0) throw new Error('There are no open shifts to sweep.');
    const simulatedDeactivationTime = getLagosEndOfDayTimestamp();
    return commit(
      activeAccounts.reduce(
        (currentState, account) =>
          this.closeShift(currentState, account, 'automatic', simulatedDeactivationTime),
        state
      )
    );
  },

  closeShift(
    state: TillState,
    account: TillAccount,
    sweepType: SweepType,
    deactivatedAt = new Date().toISOString()
  ): TillState {
    if (!account.activeShift) return state;
    const shift = account.activeShift;
    const record: TillSweepRecord = {
      id: `sweep-${crypto.randomUUID()}`,
      tillId: account.id,
      userId: shift.userId,
      activatedAt: shift.activatedAt,
      deactivatedAt,
      openingBalance: shift.openingBalance,
      balanceBeforeSweep: account.shiftBalance,
      sweepType
    };
    return {
      ...state,
      accounts: state.accounts.map((item) =>
        item.id === account.id ? { ...item, shiftBalance: 0, activeShift: null } : item
      ),
      sweeps: [record, ...state.sweeps]
    };
  }
};
