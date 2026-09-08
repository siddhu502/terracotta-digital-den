import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // A route chunk can go missing or resolve to a stale module when the app is
  // redeployed while a tab is still open. Reload once to recover.
  if (typeof window !== "undefined") {
    const key = "smart-ness:chunk-reload";
    const reloadOnce = (event?: Event) => {
      const last = Number(sessionStorage.getItem(key) ?? 0);
      if (Date.now() - last < 10_000) return; // avoid reload loops
      sessionStorage.setItem(key, String(Date.now()));
      event?.preventDefault();
      window.location.reload();
    };

    window.addEventListener("vite:preloadError", reloadOnce);

    const isStaleModuleError = (message: string) =>
      /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module|e\[n *\?\? *`?['"`]default/.test(
        message,
      ) || /undefined is not an object \(evaluating '.*default.*'\)/.test(message);

    window.addEventListener("error", (event) => {
      if (isStaleModuleError(String(event.message ?? ""))) reloadOnce();
    });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = (event as PromiseRejectionEvent).reason;
      const message = reason instanceof Error ? reason.message : String(reason ?? "");
      if (isStaleModuleError(message)) reloadOnce();
    });
  }


  return router;
};
