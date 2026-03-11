export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Cybersecurity' | 'Intelligence' | 'Geopolitics' | 'National Security' | 'Economic Security';
  date: string;
  relevance: 'HIGH' | 'MED' | 'LOW';
  featured?: boolean;
  content: string;
};

export const ARTICLES: Article[] = [
  {
    slug: 'what-is-swift',
    title: 'What is the SWIFT Banking System? Why Does It Matter?',
    excerpt: 'SWIFT is more than a financial messaging network — it is a strategic asset that influences global diplomacy, economic stability, and national security.',
    category: 'Economic Security',
    date: 'MAR 3, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `The SWIFT banking system, officially known as the Society for Worldwide Interbank Financial Telecommunication, is a global messaging network that facilitates secure communication between banks and financial institutions for international transactions. Although SWIFT does not transfer funds directly, it enables the seamless exchange of payment instructions, making it essential for global commerce. Connecting over 11,000 financial institutions in more than 200 countries, SWIFT underpins the infrastructure of international finance.

## SWIFT as a National Security Tool

Beyond its financial function, SWIFT is a strategic tool for national security. Governments, particularly in the United States and Europe, utilize SWIFT to monitor international financial transactions. This surveillance capability is crucial for tracking money flows linked to terrorism, organized crime, and money laundering. By analyzing transaction patterns, intelligence agencies can identify and dismantle financial networks that pose security threats.

## Sanctions Enforcement

SWIFT is also a powerful instrument for enforcing economic sanctions. Nations can disconnect targeted countries or entities from the network, effectively isolating them from the global financial system. This tactic applies economic pressure without military intervention, influencing state behavior on the international stage. The exclusion of Russia and Iran from SWIFT demonstrates how this strategy can be used to uphold international security and political stability.

## Geopolitical Leverage

Control over SWIFT access grants significant geopolitical leverage. Countries such as the United States and EU member states use it as a diplomatic and economic weapon, influencing global politics by regulating financial connectivity. This power allows them to protect national interests and maintain international order.

## A Prime Target for Cyberattacks

Given its strategic importance, SWIFT is a prime target for cyberattacks. State-sponsored hackers and criminal organizations aim to exploit its infrastructure for financial gain or political disruption. A successful attack on SWIFT could destabilize global economies and threaten national security. Therefore, maintaining the cybersecurity of SWIFT is crucial for protecting financial integrity and international stability.

## Conclusion

The SWIFT banking system is more than a financial messaging network — it is a strategic asset that influences global diplomacy, economic stability, and national security. Its role in financial surveillance, sanctions enforcement, and economic leverage underscores its importance in the modern geopolitical landscape. Safeguarding SWIFT is essential for maintaining international security and economic order.`,
  },
  {
    slug: 'china-already-inside-americas-infrastructure',
    title: "China Is Already Inside America's Infrastructure",
    excerpt: "Volt Typhoon isn't stealing data. It's pre-positioning for war — and it's been inside U.S. critical infrastructure for years.",
    category: 'Cybersecurity',
    date: 'MAR 11, 2026',
    relevance: 'HIGH',
    featured: true,
    content: `The most dangerous cyberattack America may ever face has probably already begun. Not with a bang, not with ransomware demands or data breaches splashed across headlines — but with silence. Patient, deliberate, years-long silence.

That is the operating doctrine of Volt Typhoon, a Chinese state-sponsored hacking group that U.S. intelligence agencies have assessed is not trying to steal data. It is trying to position itself to cause catastrophic disruption to American critical infrastructure at the moment of Beijing's choosing — most likely during a military confrontation over Taiwan.

## Living Off the Land

Volt Typhoon's defining characteristic is what security researchers call "living off the land" — a technique where attackers avoid deploying custom malware and instead use the legitimate tools already present in a target's environment. Windows built-in utilities. Standard network diagnostic commands. Credentials harvested from inside the network itself.

The advantage is near-invisibility. Traditional cybersecurity defenses look for malicious software signatures, unusual programs, foreign code. When an attacker uses the same tools a system administrator would use on a Tuesday afternoon, those defenses generate no alerts. The attacker blends into the noise of normal operations.

Volt Typhoon has been observed inside U.S. networks for at least five years. The FBI, NSA, and CISA issued a joint advisory in 2023 confirming the group had successfully infiltrated communications infrastructure, energy systems, water utilities, and transportation networks across the continental United States and its territories — including Guam, which would be a critical logistics hub in any Pacific military conflict.

They were not stealing anything. They were mapping. Waiting. Building access they could activate later.

## The Target Set

What Volt Typhoon is targeting tells you everything about its strategic intent. This is not a criminal enterprise seeking financial gain or an intelligence operation harvesting diplomatic cables. The target set reads like a list of systems you would want to disable before launching a military operation against an adversary.

Power grids. Water treatment facilities. Telecommunications networks. Ports and rail infrastructure. Emergency services communication systems.

These groups are known for infiltrating high-value targets and laying dormant for months or even years before activating. Once inside, attackers move laterally across networks, jumping from traditional IT systems into operational technology — the actual physical systems that run pumps, turbines, switches, and valves.

That crossover is the critical threshold. A compromised IT network means stolen data. A compromised OT network means a city without water, a region without power, a port that cannot function.

## The Taiwan Timeline

The strategic logic becomes clear when you map it against Beijing's stated objectives. Chinese leadership has made reunification with Taiwan a central national priority. Senior U.S. military officials have assessed the window of greatest risk as the late 2020s, when the PLA's military modernization program is expected to reach peak capability.

Volt Typhoon is not preparing for a cyberwar fought in isolation. It is preparing a supporting campaign for a potential kinetic conflict — one designed to complicate America's ability to mobilize, respond, and sustain operations in the Pacific. If the United States moves to defend Taiwan, and American cities simultaneously experience power outages, communications blackouts, and disruptions to port operations, the calculus for intervention changes.

## The Structural Problem

America's critical infrastructure presents a structural problem that no single policy or technology solution fully addresses. The vast majority of it is privately owned. Power companies, water utilities, telecommunications providers, and port operators are private entities operating under a patchwork of sector-specific regulations with inconsistent security requirements.

Incentive structures in the private sector do not naturally produce the level of security investment required to defend against nation-state adversaries. The cost of hardening operational technology is significant. The cost of a successful attack — measured in public safety, economic disruption, and strategic consequence — is incalculable.

The gap between those two calculations is where Volt Typhoon lives.

## What to Watch

Any significant deterioration in U.S.-China relations over Taiwan should be read as a potential trigger condition. Unexplained outages or anomalies in critical infrastructure warrant scrutiny. Congressional movement on mandatory OT security standards is a lagging but meaningful indicator.

The deeper issue is one of strategic patience. Volt Typhoon has it. American policymakers and private sector operators, operating on quarterly earnings cycles and two-year congressional terms, structurally struggle to match it.

The access is there. The intent has been assessed. The timeline is driven by geopolitical developments outside anyone's full control.

The question is whether the United States will find and remove these footholds before Beijing decides it is time to use them — or whether the first sign that something is wrong will be the lights going out.`,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

export function getArticlesByCategory(category: Article['category']): Article[] {
  return ARTICLES.filter(a => a.category === category).sort((a, b) => b.date.localeCompare(a.date));
}

export function getFeaturedArticle(): Article {
  return ARTICLES.find(a => a.featured) || ARTICLES[0];
}

export function getLatestArticles(count = 6): Article[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}

// Legacy aliases so existing blog pages don't break
export const articles = ARTICLES;
export function getArticle(slug: string): Article | undefined {
  return getArticleBySlug(slug);
}
export function getAllArticles(): Article[] {
  return ARTICLES;
}
