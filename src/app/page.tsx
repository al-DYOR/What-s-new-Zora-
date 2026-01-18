// Комментарий: Главная страница приложения
// 'use client' нужен для useState и onClick

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
      // Комментарий: Теперь запрашиваем свой серверный API-роут, а не Zora напрямую
      // Это решает проблему CORS и 503 preflight
      const response = await fetch('/api/random-nft');

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setNft({
        name: data.name,
        imageUrl: data.imageUrl,
        collectionAddress: data.collectionAddress,
        tokenId: data.tokenId,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Не удалось загрузить NFT. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  // Комментарий: Ссылка на минт на Zora
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

      {error && <p className="mt-8 text-red-600 font-medium">{error}</p>}

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
              <p className="text-gray-500">Изображение отсутствует</p>
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