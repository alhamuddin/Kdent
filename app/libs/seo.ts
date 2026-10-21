export function getSiteUrl(): URL | undefined {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredSiteUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Set NEXT_PUBLIC_SITE_URL to the canonical public origin before building for production.",
      );
    }

    return undefined;
  }

  const siteUrl = new URL(configuredSiteUrl);
  if (
    !["http:", "https:"].includes(siteUrl.protocol) ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an http(s) origin without a path, query, or hash.",
    );
  }

  return new URL(siteUrl.origin);
}
