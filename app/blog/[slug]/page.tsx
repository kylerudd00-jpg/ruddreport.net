import { notFound } from "next/navigation";

const posts = [
  {
    slug: "semiconductor-supply-chains",
    title: "Why Semiconductor Supply Chains Define Modern Power",
    date: "February 23, 2026",
    content: `
Semiconductors are the backbone of modern national security.

From advanced weapons systems to consumer electronics, supply chain control determines strategic leverage.

This is no longer economic policy. It is geopolitical infrastructure.
    `,
  },
  {
    slug: "intelligence-failure",
    title: "The Intelligence Failure That Wasn’t",
    date: "February 20, 2026",
    content: `
Not all strategic surprises are intelligence failures.

Sometimes information exists. Sometimes warnings are clear.

The failure lies in policy decisions.
    `,
  },
];

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-500 mb-8">{post.date}</p>

        <article className="prose prose-lg whitespace-pre-line">
          {post.content}
        </article>
      </div>
    </main>
  );
}