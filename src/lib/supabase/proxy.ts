import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  isAllowedAdminEmail,
  readAdminClaims,
} from "@/domain/auth/admin-identity";
import { getSupabasePublicConfig } from "@/lib/supabase/public-config";

function redirectWithCookies(url: URL, source: NextResponse) {
  const redirect = NextResponse.redirect(url);

  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }

  return redirect;
}

function protectAtelierResponse(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

function loginUrl(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/atelier/login";
  url.search = "";

  if (reason) {
    url.searchParams.set("motiv", reason);
  }

  return url;
}

export async function updateSupabaseSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/atelier/login";
  const isProtectedAtelier = pathname.startsWith("/atelier") && !isLogin;
  const config = getSupabasePublicConfig();
  const adminEmail = process.env.ADMIN_EMAIL;
  const hasRuntimeConfiguration = Boolean(
    config && adminEmail && process.env.DATABASE_URL,
  );

  let response = NextResponse.next({ request });

  if (!hasRuntimeConfiguration || !config) {
    return protectAtelierResponse(
      isProtectedAtelier
        ? redirectWithCookies(loginUrl(request, "configurare"), response)
        : response,
    );
  }

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : readAdminClaims(data?.claims);
  const isAllowed = Boolean(
    claims && isAllowedAdminEmail(claims.email, adminEmail),
  );

  if (isProtectedAtelier && !isAllowed) {
    return protectAtelierResponse(
      redirectWithCookies(loginUrl(request, "autentificare"), response),
    );
  }

  if (isLogin && isAllowed) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/atelier";
    dashboardUrl.search = "";
    return protectAtelierResponse(redirectWithCookies(dashboardUrl, response));
  }

  return protectAtelierResponse(response);
}
