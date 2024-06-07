import { User } from './components/UserContext';

const authKey = 'um.auth';

export function saveAuth(user: User, token: string): void {
  sessionStorage.setItem(authKey, JSON.stringify({ user, token }));
}

export function removeAuth(): void {
  sessionStorage.removeItem(authKey);
}

export function readUser(): User | undefined {
  const auth = sessionStorage.getItem(authKey);
  if (!auth) return undefined;
  return JSON.parse(auth).user;
}

export function readToken(): string | undefined {
  const auth = sessionStorage.getItem(authKey);
  if (!auth) return undefined;
  return JSON.parse(auth).token;
}

export type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

async function writeEntry(entry: Entry): Promise<Entry> {
  const token = readToken();
  const body = entry;
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  };
  const response = await fetch(`/api/entries`, req);
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

async function putEntry(entry: Entry): Promise<Entry> {
  const token = readToken();
  const body = entry;
  const req = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  };

  const response = await fetch(`/api/entries/${entry.entryId}`, req);
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

async function deleteEntry(entryId: number): Promise<void> {
  const token = readToken();
  const req = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch(`/api/entries/${entryId}`, req);
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

export async function readEntries(): Promise<Entry[]> {
  const token = readToken();
  const req = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch('/api/entries', req);
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

export async function readEntry(entryId: number): Promise<Entry | undefined> {
  const token = readToken();
  const req = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch(`/api/entries/${entryId}`, req);
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

export async function addEntry(entry: Entry): Promise<Entry> {
  const newEntry = writeEntry(entry);
  return newEntry;
}

export async function updateEntry(entry: Entry): Promise<Entry> {
  const newEntry = putEntry(entry);
  return newEntry;
}

export async function removeEntry(entryId: number): Promise<void> {
  deleteEntry(entryId);
}
