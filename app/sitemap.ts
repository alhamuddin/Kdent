import type { MetadataRoute } from "next";
import { getSiteUrl } from "./libs/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return [];
  }

  return [
    {
      url: siteUrl.toString(),
      priority: 1,
      changeFrequency: "weekly",
    },
    {
      url: new URL("/book-appointment", siteUrl).toString(),
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: new URL("/services", siteUrl).toString(),
      priority: 0.9,
      changeFrequency: "monthly",
    },
  ];
}
