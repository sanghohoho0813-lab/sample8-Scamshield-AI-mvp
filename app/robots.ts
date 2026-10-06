import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // 검사 결과·기록은 기기마다 다른 개인 데이터라 색인하지 않는다
    rules: { userAgent: "*", allow: "/", disallow: ["/result/", "/history", "/my", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
