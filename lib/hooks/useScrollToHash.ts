"use client";

import { useEffect } from "react";

/**
 * Scrolls to the element matching the current URL's hash once `ready` is
 * true. Every tab page in this app gates its content behind an async
 * profile check (`useRequireOnboardedProfile`, returns null until it
 * resolves), so the element a cross-page `href="/x#id"` link targets isn't
 * in the DOM yet when the browser's native load-time hash-scroll would
 * normally run — this finishes that job once the content actually exists.
 *
 * Also re-scrolls on `hashchange` (not just on mount), so navigating
 * between two hash targets on an already-mounted page instance — e.g. via
 * browser back/forward, which Next's App Router can serve without
 * remounting the page — still lands on the right section.
 */
export function useScrollToHash(ready: boolean) {
  useEffect(() => {
    if (!ready) return;

    function scrollToCurrentHash() {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      document.getElementById(hash)?.scrollIntoView();
    }

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);
    return () => window.removeEventListener("hashchange", scrollToCurrentHash);
  }, [ready]);
}
