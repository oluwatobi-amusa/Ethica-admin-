export type SweepType = 'manual' | 'automatic';

export interface TillUser {
  id: string;
  fullName: string;
  username: string;
  tillId: string;
  createdAt: string;
}

export interface ActiveTillShift {
  userId: string;
  activatedAt: string;
  openingBalance: number;
}

export interface TillAccount {
  id: string;
  name: string;
  accountNumber: string;
  shiftBalance: number;
  assignedUserIds: string[];
  activeShift: ActiveTillShift | null;
}

export interface TillSweepRecord {
  id: string;
  tillId: string;
  userId: string;
  activatedAt: string;
  deactivatedAt: string;
  openingBalance: number;
  balanceBeforeSweep: number;
  sweepType: SweepType;
}

export interface TillState {
  accounts: TillAccount[];
  users: TillUser[];
  sweeps: TillSweepRecord[];
}

export interface CreateTillUserInput {
  fullName: string;
  username: string;
  password: string;
  tillId: string;
}

export interface CreateTillAccountInput {
  name: string;
}

export const TILL_STORAGE_KEY = 'starter-pack:till-management:v1';
export const ADMIN_ACTOR_ID = 'demo-admin';
