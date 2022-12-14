import Head from "next/head";
import { Network, Alchemy } from 'alchemy-sdk';
import { useState, useEffect } from "react";
import useSWR from "swr";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

const getBlockNumber = () => alchemy.core.getBlockNumber().then((res) => res);

export default function Home() {
  const { data: latestBlock } = useSWR('latestBlock', getBlockNumber);

  return (
    <div>
      <Head>
        <title>BlockScan</title>
        <meta name="description" content="BlockScan Block Explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Latest blocks</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200">
              { latestBlock ? latestBlock : "Loading..." }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
