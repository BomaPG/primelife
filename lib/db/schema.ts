import Dexie, { type EntityTable } from "dexie";

export type ISODate = string; // "YYYY-MM-DD", local calendar day
export type SleepQuality = "good" | "okay" | "poor";
export type Feeling = "great" | "okay" | "low";
export type MealType = "breakfast" | "lunch" | "dinner";

export interface Profile {
  id: "singleton";
  name?: string;
  createdAt: number; // epoch ms
  onboardedAt?: number;
  disclaimerAcceptedAt?: number;
  waterTargetGlasses: number; // default 8
  remindersEnabled: boolean; // default false
  interestedTopics: string[]; // HealthTopic ids
}

export interface CheckIn {
  id?: number; // auto
  date: ISODate; // unique
  sleepQuality: SleepQuality;
  feeling: Feeling;
  movedYesterday: boolean;
  createdAt: number;
}

export interface WaterLog {
  date: ISODate; // primary key, one row per day
  glasses: number; // running count for the day
  updatedAt: number;
}

export interface MealLog {
  id?: number; // auto
  date: ISODate;
  mealType: MealType; // unique together with date
  done: boolean;
  note?: string;
  recommendedMealId?: string; // Meal.id from content
  createdAt: number;
}

export interface SleepLog {
  date: ISODate; // primary key, one row per day
  hours?: number;
  quality?: SleepQuality; // may be set by check-in
  updatedAt: number;
}

export interface Walk {
  id?: number; // auto
  date: ISODate;
  durationMins: number; // required
  distanceKm?: number; // optional
  note?: string;
  createdAt: number;
}

/**
 * The Dexie/IndexedDB database. This module is the only place in the app
 * allowed to import Dexie — every other module goes through
 * `lib/db/dataAccess.ts` (constraint C6).
 */
export class PrimeLifeDB extends Dexie {
  profile!: EntityTable<Profile, "id">;
  checkins!: EntityTable<CheckIn, "id">;
  waterLogs!: EntityTable<WaterLog, "date">;
  mealLogs!: EntityTable<MealLog, "id">;
  sleepLogs!: EntityTable<SleepLog, "date">;
  walks!: EntityTable<Walk, "id">;

  constructor() {
    super("primelife");
    this.version(1).stores({
      profile: "id",
      checkins: "++id, &date",
      waterLogs: "date",
      mealLogs: "++id, date, [date+mealType]",
      sleepLogs: "date",
      walks: "++id, date",
    });
  }
}

let dbInstance: PrimeLifeDB | undefined;

/**
 * Lazily-constructed singleton. Dexie touches IndexedDB at construction
 * time, which doesn't exist during server-side rendering, so the instance
 * is created on first access rather than at module load.
 */
export function getDB(): PrimeLifeDB {
  if (!dbInstance) {
    dbInstance = new PrimeLifeDB();
  }
  return dbInstance;
}
