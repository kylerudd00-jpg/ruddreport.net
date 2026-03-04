export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  threat: 'high' | 'med' | 'low';
  content: { heading?: string; body: string }[];
};

export const articles: Article[] = [
  {
    slug: 'what-is-swift',
    title: 'What is the SWIFT Banking System? Why Does It Matter?',
    category: 'Economic Security',
    date: 'MAR 3, 2026',
    excerpt: 'SWIFT is more than a financial messaging network — it is a strategic asset that influences global diplomacy, economic stability, and national security.',
    threat: 'high',
    content: [
      {
        body: 'The SWIFT banking system, officially known as the Society for Worldwide Interbank Financial Telecommunication, is a global messaging network that facilitates secure communication between banks and financial institutions for international transactions. Although SWIFT does not transfer funds directly, it enables the seamless exchange of payment instructions, making it essential for global commerce. Connecting over 11,000 financial institutions in more than 200 countries, SWIFT underpins the infrastructure of international finance.'
      },
      {
        heading: 'SWIFT as a National Security Tool',
        body: 'Beyond its financial function, SWIFT is a strategic tool for national security. Governments, particularly in the United States and Europe, utilize SWIFT to monitor international financial transactions. This surveillance capability is crucial for tracking money flows linked to terrorism, organized crime, and money laundering. By analyzing transaction patterns, intelligence agencies can identify and dismantle financial networks that pose security threats.'
      },
      {
        heading: 'Sanctions Enforcement',
        body: 'SWIFT is also a powerful instrument for enforcing economic sanctions. Nations can disconnect targeted countries or entities from the network, effectively isolating them from the global financial system. This tactic applies economic pressure without military intervention, influencing state behavior on the international stage. The exclusion of Russia and Iran from SWIFT demonstrates how this strategy can be used to uphold international security and political stability.'
      },
      {
        heading: 'Geopolitical Leverage',
        body: 'Control over SWIFT access grants significant geopolitical leverage. Countries such as the United States and EU member states use it as a diplomatic and economic weapon, influencing global politics by regulating financial connectivity. This power allows them to protect national interests and maintain international order.'
      },
      {
        heading: 'A Prime Target for Cyberattacks',
        body: 'Given its strategic importance, SWIFT is a prime target for cyberattacks. State-sponsored hackers and criminal organizations aim to exploit its infrastructure for financial gain or political disruption. A successful attack on SWIFT could destabilize global economies and threaten national security. Therefore, maintaining the cybersecurity of SWIFT is crucial for protecting financial integrity and international stability.'
      },
      {
        heading: 'Conclusion',
        body: 'The SWIFT banking system is more than a financial messaging network — it is a strategic asset that influences global diplomacy, economic stability, and national security. Its role in financial surveillance, sanctions enforcement, and economic leverage underscores its importance in the modern geopolitical landscape. Safeguarding SWIFT is essential for maintaining international security and economic order.'
      },
    ]
  }
];

export function getArticle(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return articles;
}