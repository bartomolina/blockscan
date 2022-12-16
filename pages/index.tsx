import Head from "next/head";
import useSWR from "swr";
import { Network, Alchemy, Utils } from "alchemy-sdk";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { useState, MouseEvent } from "react";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

const getLatestBlocks = () => {
  console.log("Updating blocks...");
  return alchemy.core
    .getBlockNumber()
    .then((res) =>
      Promise.all(Array.from({ length: 20 }, (item, i) => alchemy.core.getBlock(res - i))).then((res) => res)
    );
};

const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
const truncateEthAddress = (address: string) => {
  if (address) {
    const match = address.match(truncateRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  }
};

const units: { unit: Intl.RelativeTimeFormatUnit; secondsInUnit: number }[] = [
  { unit: "year", secondsInUnit: 31536000 },
  { unit: "month", secondsInUnit: 2628000 },
  { unit: "day", secondsInUnit: 86400 },
  { unit: "hour", secondsInUnit: 3600 },
  { unit: "minute", secondsInUnit: 60 },
  { unit: "second", secondsInUnit: 1 },
];

const getTimeAgo = (timestamp: number) => {
  const rtf = new Intl.RelativeTimeFormat();

  const secondsElapsed = Date.now() / 1000 - timestamp;

  for (const { unit, secondsInUnit } of units) {
    if (secondsElapsed >= secondsInUnit || unit === "second") {
      return rtf.format(Math.floor(secondsElapsed / secondsInUnit) * -1, unit);
    }
  }

  return "";
};

export default function Home() {
  const { data: latestBlocks } = useSWR("latestBlocks", getLatestBlocks, { revalidateOnFocus: false });
  const [transactions, setTransactions] = useState<TransactionResponse[]>();

  if (!transactions && latestBlocks) {
    console.log("Updating transactions...");
    alchemy.core.getBlockWithTransactions(latestBlocks[0].hash).then((res) => setTransactions(res.transactions));
  }

  const handleBlockClick = (e: MouseEvent, block: string) => {
    console.log("Updating transactions...");
    e.preventDefault();
    alchemy.core.getBlockWithTransactions(block).then((res) => setTransactions(res.transactions));
  };

  return (
    <div>
      <Head>
        <title>BlockScan</title>
        <meta name="description" content="BlockScan Block Explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Blocks and transactions</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5 lg:gap-8">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="blocks">
                  <div className="overflow-hidden rounded-lg bg-gray-100 shadow">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-900" id="blocks">
                        Blocks
                      </h2>
                      <div className="py-6">
                        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                                >
                                  #
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                                >
                                  Time
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                                >
                                  Gas Used
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                                >
                                  Tx
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {latestBlocks?.map((block) => (
                                <tr key={block.number}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    <a
                                      className="text-blue-500 underline"
                                      href=""
                                      onClick={(e) => {
                                        handleBlockClick(e, block.hash);
                                      }}
                                    >
                                      {block.number}
                                    </a>
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    {getTimeAgo(block.timestamp)}
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {block.gasUsed.toString()}
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {block.transactions.length}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              {/* Right column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-3">
                <section aria-labelledby="transactions">
                  <div className="overflow-hidden rounded-lg bg-gray-100 shadow">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-900" id="transactions">
                        Transactions
                      </h2>
                      <div className="py-6">
                        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                                >
                                  From
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                                >
                                  To
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                                >
                                  Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {transactions?.map((transaction) => (
                                <tr key={transaction.hash}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    {truncateEthAddress(transaction.from)}
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    {transaction.to ? truncateEthAddress(transaction.to) : ""}
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    {Utils.formatEther(transaction.value)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
