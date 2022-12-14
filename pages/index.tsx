import Head from "next/head";
import { Network, Alchemy } from "alchemy-sdk";
import { useState, useEffect } from "react";
import useSWR from "swr";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

const getLatestBlocks = () => {
  return alchemy.core.getBlockNumber().then((res) => alchemy.core.getBlock(res));
};

export default function Home() {
  const { data: latestBlocks } = useSWR("latestBlocks", getLatestBlocks);
  console.log(latestBlocks);

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
              {/* {latestBlock ? latestBlock.hash : "Loading..."} */}
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                      >
                        Block
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                        0010
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* End */}
          </div>
        </div>
      </main>
    </div>
  );
}
