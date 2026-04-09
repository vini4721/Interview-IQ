import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  ClerkProvider,
} from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import ClerkApiAuth from "./components/ClerkApiAuth.jsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const queryClient = new QueryClient();

function AuthShell() {
  return (
    <>
      <ClerkLoading>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-base-300 text-base-content">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm opacity-70">Loading sign-in…</p>
        </div>
      </ClerkLoading>

      <ClerkFailed>
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-300 text-base-content px-6 text-center max-w-md mx-auto">
          <p className="font-semibold text-error">
            Couldn&apos;t load authentication
          </p>
          <p className="text-sm opacity-80">
            Check your network, confirm this site URL is allowed in the Clerk
            dashboard (e.g. localhost with the correct port), and that{" "}
            <code className="text-xs bg-base-200 px-1 rounded">
              VITE_CLERK_PUBLISHABLE_KEY
            </code>{" "}
            is set.
          </p>
        </div>
      </ClerkFailed>

      <ClerkLoaded>
        <BrowserRouter>
          <ClerkApiAuth />
          <App />
        </BrowserRouter>
      </ClerkLoaded>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AuthShell />
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>,
);
