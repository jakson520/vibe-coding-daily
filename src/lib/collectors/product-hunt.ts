import type { CollectedArticle, SourceForCollection } from "../types";
import { isRelevantToKeywords } from "../tags";
import { safeUrl } from "../text";
import { fetchJson } from "./http";

type ProductHuntResponse = {
  data?: {
    posts?: {
      edges?: Array<{
        node: {
          id: string;
          name: string;
          tagline?: string;
          url: string;
          votesCount?: number;
          commentsCount?: number;
          createdAt?: string;
          user?: {
            username?: string;
          };
        };
      }>;
    };
  };
};

export async function collectProductHunt(source: SourceForCollection): Promise<CollectedArticle[]> {
  if (!process.env.PRODUCT_HUNT_TOKEN) {
    return [];
  }

  const query = `
    query VibeCodingDailyPosts {
      posts(first: 30, order: VOTES) {
        edges {
          node {
            id
            name
            tagline
            url
            votesCount
            commentsCount
            createdAt
            user { username }
          }
        }
      }
    }
  `;

  const data = await fetchJson<ProductHuntResponse>(
    source.url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
    15000,
  );

  return (
    data.data?.posts?.edges
      ?.map(({ node }) => ({
        sourceId: source.id,
        externalId: node.id,
        title: node.name,
        url: safeUrl(node.url),
        author: node.user?.username,
        publishedAt: node.createdAt ? new Date(node.createdAt) : null,
        rawSummary: node.tagline,
        heat: (node.votesCount ?? 0) + (node.commentsCount ?? 0) * 2,
      }))
      .filter((item) => isRelevantToKeywords(item.title, item.rawSummary)) ?? []
  );
}
