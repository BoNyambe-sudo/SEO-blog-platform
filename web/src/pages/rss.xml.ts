import { client } from "../lib/sanity";
import { POSTS_LIST_QUERY, safeFetch } from "../lib/queries";

export async function GET(context: { site: string }) {
  const posts = await safeFetch(client, POSTS_LIST_QUERY, { skip: 0, limit: 100 });

  const items = posts
    .map(
      (post: any) => `
    <item>
      <title>${post.title}</title>
      <description>${post.excerpt}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <link>${context.site}/blog/${post.slug.current}/</link>
      <author>${post.author?.name || ""}</author>
      ${post.coverImage?.asset?.url ? `<enclosure url="${post.coverImage.asset.url}" type="image/jpeg" />` : ""}
    </item>
  `,
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SEO Blog Platform</title>
    <description>Content-first blog about web development.</description>
    <link>${context.site}</link>
    <atom:link href="${context.site}/rss.xml" rel="self" />
    <image>
      <url>${context.site}/og-default.png</url>
      <title>SEO Blog Platform</title>
      <link>${context.site}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: { "Content-Type": "application/xml" },
  });
}
