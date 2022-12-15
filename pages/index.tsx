import Head from "next/head";
import useSWR from "swr";
import { Network, Alchemy, Utils } from "alchemy-sdk";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

const getLatestBlocks = () =>
  alchemy.core
    .getBlockNumber()
    .then((res) =>
      Promise.all(Array.from({ length: 20 }, (item, i) => alchemy.core.getBlock(res - i))).then((res) => res)
    );

const getLatestTransactions = (block) => {
  console.log("getting transactions for block: ", block);
  return alchemy.core.getBlockWithTransactions(block[0]).then((res) => res.transactions);
};

const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
const truncateEthAddress = (address: string) => {
  if (address) {
    const match = address.match(truncateRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  }
};

const DATE_UNITS = {
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
};

const getTimeAgo = (timestamp) => {
  const rtf = new Intl.RelativeTimeFormat();

  const secondsElapsed = Date.now() / 1000 - timestamp;
  let value = 0;
  let unit = "second";

  for (const [_unit, _secondsInUnit] of Object.entries(DATE_UNITS)) {
    if (secondsElapsed >= _secondsInUnit || _unit === "second") {
      value = Math.floor(secondsElapsed / _secondsInUnit) * -1;
      unit = _unit;
      break;
    }
  }

  return rtf.format(value, unit);
};

export default function Home() {
  const { data: latestBlocks } = useSWR("latestBlocks", getLatestBlocks, { revalidateOnFocus: false });
  const { data: latestTransactions, mutate } = useSWR(
    latestBlocks ? [latestBlocks[0].hash, "latestTransactions"] : null,
    getLatestTransactions,
    { revalidateOnFocus: false }
  );

  const handleBlockClick = (block) => {
    getLatestTransactions(block)
  }

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
                                        e.preventDefault();
                                        console.log(block.hash);
                                        mutate([block.hash, "latestTransactions"]);
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
                              {latestTransactions?.map((transaction) => (
                                <tr key={transaction.hash}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    {truncateEthAddress(transaction.from)}
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    {truncateEthAddress(transaction.to)}
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                                    {/* {Utils.formatEther(transaction.value)} */"test"}
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
