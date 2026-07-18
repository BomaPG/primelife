/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// F10-AC2: precache the app shell and all bundled content on first load.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Content collections are static JS bundles, not fetched assets, so
  // they're covered by precaching (self.__SW_MANIFEST) rather than
  // runtime caching here. defaultCache's page strategy is network-first
  // with a cache fallback, which is what makes F10-AC3 (every route opens
  // offline after first load) hold once the shell is precached.
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
