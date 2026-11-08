import { TillState, TILL_STORAGE_KEY } from './types';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const createInitialTillState = (): TillState => ({
  accounts: [
    {
      id: 'till-greenfield',
      name: 'Greenfield Ventures',
      accountNumber: '1029384756',
      shiftBalance: 482500,
      assignedUserIds: ['user-amina', 'user-chidi'],
      activeShift: { userId: 'user-amina', activatedAt: hoursAgo(4), openingBalance: 0 }
    },
    {
      id: 'till-brightstone',
      name: 'Brightstone Solutions',
      accountNumber: '2145678390',
      shiftBalance: 0,
      assignedUserIds: ['user-tunde', 'user-nneka'],
      activeShift: null
    },
    {
      id: 'till-crestview',
      name: 'Crestview Technologies',
      accountNumber: '3256789014',
      shiftBalance: 0,
      assignedUserIds: ['user-chidi', 'user-sola'],
      activeShift: null
    },
    {
      id: 'till-adeyemi',
      name: 'Adeyemi Retail',
      accountNumber: '4378901256',
      shiftBalance: 0,
      assignedUserIds: ['user-sola'],
      activeShift: null
    }
  ],
  users: [
    {
      id: 'user-amina',
      fullName: 'Amina Yusuf',
      username: 'amina.yusuf',
      tillId: 'till-greenfield',
      createdAt: hoursAgo(24 * 20)
    },
    {
      id: 'user-chidi',
      fullName: 'Chidi Okafor',
      username: 'chidi.okafor',
      tillId: 'till-greenfield',
      createdAt: hoursAgo(24 * 16)
    },
    {
      id: 'user-tunde',
      fullName: 'Tunde Bakare',
      username: 'tunde.bakare',
      tillId: 'till-brightstone',
      createdAt: hoursAgo(24 * 13)
    },
    {
      id: 'user-nneka',
      fullName: 'Nneka Eze',
      username: 'nneka.eze',
      tillId: 'till-brightstone',
      createdAt: hoursAgo(24 * 9)
    },
    {
      id: 'user-sola',
      fullName: 'Sola Adeyemi',
      username: 'sola.adeyemi',
      tillId: 'till-crestview',
      createdAt: hoursAgo(24 * 5)
    }
  ],
  sweeps: [
    {
      id: 'sweep-demo-1',
      tillId: 'till-brightstone',
      userId: 'user-tunde',
      activatedAt: hoursAgo(24 * 2 + 8),
      deactivatedAt: hoursAgo(24 * 2),
      openingBalance: 0,
      balanceBeforeSweep: 285000,
      sweepType: 'manual'
    },
    {
      id: 'sweep-demo-2',
      tillId: 'till-crestview',
      userId: 'user-sola',
      activatedAt: hoursAgo(24 * 1 + 9),
      deactivatedAt: hoursAgo(24 * 1),
      openingBalance: 0,
      balanceBeforeSweep: 97500,
      sweepType: 'automatic'
    }
  ]
});

export const loadTillState = (): TillState => {
  if (typeof window === 'undefined') return createInitialTillState();

  const savedState = window.localStorage.getItem(TILL_STORAGE_KEY);
  if (!savedState) {
    const initialState = createInitialTillState();
    window.localStorage.setItem(TILL_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    return JSON.parse(savedState) as TillState;
  } catch {
    const initialState = createInitialTillState();
    window.localStorage.setItem(TILL_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
};

export const saveTillState = (state: TillState): TillState => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TILL_STORAGE_KEY, JSON.stringify(state));
  }
  return state;
};
