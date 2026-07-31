import { openDB, IDBPDatabase } from 'idb';
import { ReportInputs, ReportOutputs } from '../types';

export interface AutoDraftData {
  id: 'current_draft';
  inputs: ReportInputs;
  outputs: ReportOutputs;
  updatedAt: string;
}

const DB_NAME = 'EKinerjaPeksosDB';
const STORE_NAME = 'drafts';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveAutoDraft(inputs: ReportInputs, outputs: ReportOutputs): Promise<void> {
  try {
    const db = await getDB();
    const draft: AutoDraftData = {
      id: 'current_draft',
      inputs,
      outputs,
      updatedAt: new Date().toISOString(),
    };
    await db.put(STORE_NAME, draft);
  } catch (err) {
    console.error('Failed to save draft to IndexedDB:', err);
  }
}

export async function loadAutoDraft(): Promise<AutoDraftData | undefined> {
  try {
    const db = await getDB();
    return await db.get(STORE_NAME, 'current_draft');
  } catch (err) {
    console.error('Failed to load draft from IndexedDB:', err);
    return undefined;
  }
}

export async function clearAutoDraft(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, 'current_draft');
  } catch (err) {
    console.error('Failed to clear draft from IndexedDB:', err);
  }
}
