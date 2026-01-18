'use client';
import { useState } from 'react';
import useSWR from 'swr';

interface CreatorCoin {
  name: string;
  symbol: string;
  address: string;
  volume: { total: number; '30d': number; '7d': number; '1d': number };
  image?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [period, setPeriod] = useState<'30d' | '7d' | '1d'>('30d');
  const { data, error, isLoading } = useSWR('/api/zora-creators', fetcher, {
    refreshInterval: 300000
  });

  const rankings = data?.[period === '30d' ? 'thirtyDay' : period === '7d' ? 'sevenDay' : 'oneDay'] || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-12 text-center">
          What's new zora 🔥
        </h1>
        
        <div className="flex justify-center mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-1 mx-auto w-fit">
          {(['30d', '7d', '1d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {p === '30d' ? 'Месяц' : p === '7d' ? '7 дней' : '24ч'}
            </button>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          {isLoading ? (
            <div className="text-center py-20">Загрузка топа...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-300">Ошибка загрузки данных</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="p-4 font-bold text-white">#</th>
                    <th className="p-4 font-bold text-white">Coin</th>
                    <th className="p-4 font-bold text-white">Volume {period}</th>
                    <th className="p-4 font-bold text-white">Total Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((coin, i) => (
                    <tr key={coin.address} className="hover:bg-white/10 transition-colors border-b border-white/10">
                      <td className="p-4 font-bold text-purple-300">{i + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{coin.symbol?.[0]}</span>
                          </div>
                          <div>
                            <div className="font-bold text-white">{coin.name}</div>
                            <div className="text-sm text-gray-300">{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-green-400">
                        ${(coin.volume?.[period] || 0)?.toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-300">
                        ${(coin.volume?.total || 0)?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <button className="px-12 py-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl text-2xl font-bold text-white shadow-2xl hover:scale-105 transition-all duration-300">
            Кто я сегодня ➜
          </button>
        </div>
      </div>
    </main>
  );
}

