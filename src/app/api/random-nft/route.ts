// Комментарий: Серверный роут для запроса к Zora API (без CORS проблем)
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      query RecentTokensOnBase {
        tokens(
          networks: [{network: ETHEREUM, chain: BASE_MAINNET}]
          pagination: {limit: 20}
          sort: {sortKey: MINTED, sortDirection: DESC}
        ) {
          nodes {
            token {
              collectionAddress
              tokenId
              name
              image { url }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.zora.co/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Zora API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    const tokens = data.data?.tokens?.nodes || [];

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No recent NFTs' }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * tokens.length);
    const selected = tokens[randomIndex].token;

    return NextResponse.json({
      name: selected.name || 'Unknown',
      imageUrl: selected.image?.url || '',
      collectionAddress: selected.collectionAddress,
      tokenId: selected.tokenId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch NFT' }, { status: 500 });
  }
}