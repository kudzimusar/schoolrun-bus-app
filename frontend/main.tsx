import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";
import { Auth0Provider } from "@auth0/auth0-react";
import * as Sentry from "@sentry/react";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({ dsn: sentryDsn, tracesSampleRate: 1.0 });
}

function Root() {
  if (auth0Domain && auth0ClientId) {
    return (
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{ redirect_uri: window.location.origin }}
        cacheLocation="localstorage"
      >
        <App />
      </Auth0Provider>
    );
  }
  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <App />
      </ClerkProvider>
    );
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
