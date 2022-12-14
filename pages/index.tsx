import Head from "next/head";

export default function Home() {
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
              Latest blocks
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
