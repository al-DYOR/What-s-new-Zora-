// Комментарий: Главная страница приложения
// Используем 'use client' потому что нужна интерактивность (useState, onClick)
// Интерфейс на английском, комментарии на русском

'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [nft, setNft] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomNft = async () => {
    setLoading(true);
    setError(null);
    setNft(null);

    try {
      // Комментарий: GraphQL-запрос к Zora API для свежих минтов/токенов на Base
      // Берем последние 20, сортируем по minted времени DESC
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
                image {
                  url
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://api.zora.co/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const json = await response.json();

      if (json.errors) {
        throw new Error(json.errors[0]?.message || 'GraphQL error');
      }

      const tokens = json.data?.tokens?.nodes || [];

      if (tokens.length === 0) {
        throw new Error('No recent tokens found on Base');
      }

      // Комментарий: Выбираем рандомный из полученных
      const randomIndex = Math.floor(Math.random() * tokens.length);
      const selectedToken = tokens[randomIndex].token;

      setNft({
        name: selectedToken.name || 'Mystery NFT',
        imageUrl: selectedToken.image?.url || '',
        collectionAddress: selectedToken.collectionAddress,
        tokenId: selectedToken.tokenId,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load NFT. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Комментарий: Ссылка на минт — стандартная для Zora на Base
  const mintLink = nft
    ? `https://zora.co/collect/base:${nft.collectionAddress}/${nft.tokenId}`
    : '';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
      <h1 className="text-5xl font-bold mb-6 text-center">Who am I today?</h1>
      <p className="text-xl mb-10 text-center max-w-2xl">
        Discover a random fresh NFT minted on Zora (Base chain)
      </p>

      <button
        onClick={fetchRandomNft}
        disabled={loading}
        className={`px-10 py-5 text-xl font-semibold rounded-full transition-all ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800 shadow-lg'
        }`}
      >
        {loading ? 'Discovering...' : 'Who am I today'}
      </button>

      {error && (
        <p className="mt-8 text-red-600 font-medium">{error}</p>
      )}

      {nft && (
        <div className="mt-12 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          {nft.imageUrl ? (
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{nft.name}</h2>

            <a
              href={mintLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-black text-white text-center font-semibold rounded-lg hover:bg-gray-800 transition"
            >
              Mint on Zora (~0.00001 ETH gas fee)
            </a>
          </div>
        </div>
      )}
    </main>
  );
}