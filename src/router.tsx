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

  // A route chunk can go missing when the app is redeployed while a tab is
  // still open ("Importing a module script failed"). Reload once to recover.
  if (typeof window !== "undefined") {
    window.addEventListener("vite:preloadError", (event) => {
      const key = "smart-ness:chunk-reload";
      const last = Number(sessionStorage.getItem(key) ?? 0);
      if (Date.now() - last < 10_000) return; // avoid reload loops
      sessionStorage.setItem(key, String(Date.now()));
      event.preventDefault();
      window.location.reload();
    });
  }

  return router;
};
