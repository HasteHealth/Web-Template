import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "react-router";
import {
  HasteHealthProvider,
  Loading,
  ProfileDropdown,
  SideBar,
  Toaster,
  useHasteHealth,
} from "@haste-health/components";
import "@haste-health/components/dist/index.css";

import type { Route } from "./+types/root";
import "./app.css";
import { CLIENT_ID, FHIR_URL, PROJECT_ID, TENANT_ID } from "./config";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-orange-50 h-screen">
        <div className="p-4 border-b "></div>
        <div className="mt-16 container mx-auto">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Services() {
  const hasteHealth = useHasteHealth();
  if (!hasteHealth.isAuthenticated || hasteHealth.loading) {
    return (
      <div className="flex flex-col justify-center items-center space-y-2">
        <Loading />
        <span>Authorizing App</span>
      </div>
    );
  }
  return <Outlet />;
}

export default function App() {
  const navigate = useNavigate();

  return (
    <HasteHealthProvider
      refresh
      authorize_method="GET"
      scope="offline_access openid email profile fhirUser user/*.*"
      domain={FHIR_URL}
      tenant={TENANT_ID}
      project={PROJECT_ID}
      clientId={CLIENT_ID}
      redirectUrl={window.location.origin}
      onRedirectCallback={(initialPath: string) => {
        navigate(initialPath);
      }}
    >
      <Services />
    </HasteHealthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
