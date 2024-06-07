export type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

async function writeEntry(entry: Entry): Promise<Entry> {
  const body = entry;
  const response = await fetch(`/api/products/${entry.entryId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

async function putEntry(entry: Entry): Promise<Entry> {
  const body = entry;
  const response = await fetch(`/api/products/${entry.entryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

async function deleteEntry(entryId: number): Promise<void> {
  const response = await fetch(`/api/products/${entryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

export async function readEntries(): Promise<Entry[]> {
  const response = await fetch('/api/entries');
  if (response.ok !== true) {
    throw new Error('fetch error');
  }
  return await response.json();
}

export async function readEntry(entryId: number): Promise<Entry | undefined> {
  const response = await fetch(`/api/products/${entryId}`);
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
