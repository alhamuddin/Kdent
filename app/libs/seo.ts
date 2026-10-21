export function getSiteUrl(): URL | undefined {
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kdent.vercel.com";

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
