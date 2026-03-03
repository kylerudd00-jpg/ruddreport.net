export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          The Rudd Report
        </h1>

        <p className="text-lg text-gray-600 mb-12">
          Foreign policy. Security. Intelligence. Strategic analysis.
        </p>

        <div className="space-y-8">
          <article>
            <h2 className="text-2xl font-semibold">
              <a href="#" className="hover:underline">
                Why Semiconductor Supply Chains Define Modern Power
              </a>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              February 23, 2026
            </p>
            <p className="mt-2 text-gray-700">
              Semiconductors are the backbone of modern national security.
              Here’s why the global supply chain is the most important geopolitical battleground today.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">
              <a href="#" className="hover:underline">
                The Intelligence Failure That Wasn’t
              </a>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              February 20, 2026
            </p>
            <p className="mt-2 text-gray-700">
              Not all strategic surprises are intelligence failures. Sometimes they are policy failures.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}