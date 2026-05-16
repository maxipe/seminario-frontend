/**
 * Capa de abstracción sobre localStorage para MiniMax.
 * Todas las operaciones de persistencia pasan por acá.
 * Nunca llamar a localStorage directamente desde servicios o componentes.
 */

import type { User, Group, UserCommitment } from '../types';
import { mockGroups } from './mocks/groups.mock';

const KEYS = {
  USERS: 'minimax_users',
  CURRENT_USER: 'minimax_current_user',
  COMMITMENTS: 'minimax_commitments',
  GROUPS: 'minimax_groups',
} as const;

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USERS) ?? '[]') as User[];
  } catch {
    return [];
  }
}

export function saveUser(user: User): void {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function updateUser(user: User): void {
  const users = getUsers().map((u) => (u.id === user.id ? user : u));
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | null {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

// ─── Commitments ──────────────────────────────────────────────────────────────

export function getCommitments(): UserCommitment[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.COMMITMENTS) ?? '[]') as UserCommitment[];
  } catch {
    return [];
  }
}

export function getCommitmentsByUser(userEmail: string): UserCommitment[] {
  return getCommitments().filter(
    (c) => c.userEmail.toLowerCase() === userEmail.toLowerCase(),
  );
}

export function saveCommitment(commitment: UserCommitment): void {
  const commitments = getCommitments();
  commitments.push(commitment);
  localStorage.setItem(KEYS.COMMITMENTS, JSON.stringify(commitments));
}

export function updateCommitment(commitment: UserCommitment): void {
  const all = getCommitments().map((c) => (c.id === commitment.id ? commitment : c));
  localStorage.setItem(KEYS.COMMITMENTS, JSON.stringify(all));
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export function getGroups(): Group[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.GROUPS) ?? '[]') as Group[];
  } catch {
    return [];
  }
}

export function saveGroup(group: Group): void {
  const groups = getGroups();
  groups.push(group);
  localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
}

export function updateGroup(group: Group): void {
  const groups = getGroups().map((g) => (g.id === group.id ? group : g));
  localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
}

export function findGroupById(id: string): Group | null {
  return getGroups().find((g) => g.id === id) ?? null;
}

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Siembra los grupos mock en localStorage si todavía no hay ninguno.
 * Llamar en main.tsx antes de renderizar la app.
 */
export function initializeStorage(): void {
  try {
    const existing = localStorage.getItem(KEYS.GROUPS);
    const parsed = existing ? (JSON.parse(existing) as Group[]) : [];
    if (parsed.length === 0) {
      localStorage.setItem(KEYS.GROUPS, JSON.stringify(mockGroups));
    }
  } catch {
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(mockGroups));
  }
}
