import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

import { createDatabaseConnection } from "@/db/connection";
import { adminProfiles } from "@/db/schema";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

async function provisionAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!databaseUrl || !supabaseUrl || !serviceRoleKey || !adminEmail) {
    throw new Error(
      "DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_EMAIL are required.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  const user = data.users.find(
    (candidate) => candidate.email?.toLowerCase() === adminEmail,
  );

  if (!user) {
    throw new Error(
      `No Supabase Auth user exists for ${adminEmail}. Create it in Authentication > Users first.`,
    );
  }

  const displayName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : adminEmail.split("@")[0];
  const connection = createDatabaseConnection(databaseUrl);

  try {
    await connection.db
      .insert(adminProfiles)
      .values({
        id: user.id,
        role: "admin",
        displayName,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: adminProfiles.id,
        set: {
          displayName,
          role: "admin",
          isActive: true,
          updatedAt: new Date(),
        },
      });

    process.stdout.write(`Administrator provisioned for ${adminEmail}.\n`);
  } finally {
    await connection.close();
  }
}

provisionAdmin().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown administrator setup error";
  process.stderr.write(`Administrator setup failed: ${message}\n`);
  process.exitCode = 1;
});
