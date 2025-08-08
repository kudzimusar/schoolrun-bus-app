import { Service } from "encore.dev/service";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";

const SentryDSN = secret("SentryDSN");

const svc = new Service("backend");

(async () => {
  const dsn = SentryDSN();
  if (dsn) {
    log.info("Sentry backend DSN configured");
    // Placeholder for Sentry SDK init in Node if desired
  }
})();

export default svc;