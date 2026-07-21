import { config as loadEnv } from "dotenv";

import { validateProductionEnvironment } from "@/domain/deployment/production-environment";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const report = validateProductionEnvironment(process.env);

if (report.errors.length > 0) {
  process.stderr.write("Production environment is not ready:\n");
  for (const issue of report.errors) {
    process.stderr.write(`- ${issue.variable}: ${issue.message}\n`);
  }
}

if (report.warnings.length > 0) {
  process.stdout.write("Provisioning notes:\n");
  for (const issue of report.warnings) {
    process.stdout.write(`- ${issue.variable}: ${issue.message}\n`);
  }
}

if (report.errors.length > 0) {
  process.exitCode = 1;
} else {
  process.stdout.write("Production runtime environment is complete.\n");
}
