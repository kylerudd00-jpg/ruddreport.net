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

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW ARTICLE
// ─────────────────────────────────────────────────────────────────────────────
// 1. Copy the template below into the ARTICLES array above your other articles.
// 2. Fill in the fields and paste your article text into `content`.
// 3. Use  ## Section Title  (double-hash) to create section headers.
//    Separate all paragraphs and headers with a blank line.
//
// TEMPLATE:
//   {
//     slug: 'your-article-url-slug',          // URL: /articles/your-article-url-slug
//     title: 'Your Article Title Here',
//     excerpt: 'One or two sentence summary shown in previews.',
//     category: 'Cybersecurity',              // Pick one: Cybersecurity | Intelligence | Geopolitics | National Security | Economic Security
//     date: 'MAR 13, 2026',
//     relevance: 'HIGH',                      // HIGH | MED | LOW
//     featured: false,                        // Set true to feature on homepage (only one at a time)
//     content: `Your article opening paragraph here.
//
// ## First Section Header
//
// First section body text here.
//
// ## Second Section Header
//
// Second section body text here.`,
//   },
// ─────────────────────────────────────────────────────────────────────────────

export const ARTICLES: Article[] = [
  // ── GEOPOLITICS ──────────────────────────────────────────────────────────────
  {
    slug: 'south-china-sea-flashpoint',
    title: 'The South China Sea Is the World\'s Most Dangerous Flashpoint',
    excerpt: 'More than $3 trillion in trade passes through the South China Sea annually. China claims nearly all of it. The United States says that claim is illegal. Both sides are moving forces closer.',
    category: 'Geopolitics',
    date: 'MAR 12, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `Draw a line on a map from China's southern coast, sweep it southward past Vietnam, curve it around the Philippines, and bring it back up through the Strait of Malacca. The area enclosed by that line — roughly 1.4 million square miles of ocean — is the subject of one of the most consequential territorial disputes on earth. China calls it the Nine-Dash Line. The United Nations Convention on the Law of the Sea says it has no legal basis. Beijing doesn't care.

The South China Sea sits at the intersection of the world's most critical shipping lanes, carries an estimated $3.4 trillion in annual trade, holds significant oil and natural gas reserves, and provides some of the world's most productive fishing grounds. It is also the arena where Chinese military expansion and American alliance commitments are most likely to produce a direct military confrontation.

## What China Is Building

Since approximately 2013, China has undertaken one of the most ambitious military construction projects in modern history, transforming seven reefs in the Spratly Islands into fully operational military installations. The engineering alone is remarkable — dredging millions of tons of material from the seafloor to create artificial islands where there were none. What has been built on top of them is what matters strategically.

Fiery Cross Reef, Subi Reef, and Mischief Reef now feature airstrips capable of handling military aircraft, hardened hangars, radar installations, anti-ship missile batteries, surface-to-air missile systems, and port facilities capable of servicing naval vessels. These are not research stations or civilian facilities with dual-use potential. They are forward military bases, positioned to extend China's operational reach across the entire South China Sea.

The strategic logic is straightforward: by controlling the sea, China can deny access to adversaries in a conflict, protect its own maritime trade routes, project power toward Taiwan and the broader Pacific, and establish facts on the ground that international law and tribunal rulings cannot easily undo.

## The Legal Backdrop

In 2016, an international arbitration tribunal constituted under UNCLOS ruled decisively against China's Nine-Dash Line claims, finding that China had no legal basis for its historic rights claims within the line and that its island-building activities had violated the Philippines' sovereign rights. China rejected the ruling entirely and has never acknowledged its legitimacy.

This matters because it established that the dispute cannot be resolved through international legal mechanisms — not because the law is unclear, but because one party has explicitly removed itself from the legal framework. What remains are raw power dynamics and the question of which claimants have the will and capability to enforce their positions.

Vietnam, the Philippines, Malaysia, Brunei, and Taiwan all have overlapping claims within the area China asserts. The Philippines, as a U.S. treaty ally, is the most strategically significant. Under the Mutual Defense Treaty, a Chinese attack on Philippine armed forces triggers U.S. treaty obligations — a fact that has become increasingly relevant as Chinese coast guard vessels have engaged in escalating confrontations with Philippine resupply missions.

## U.S. Freedom of Navigation Operations

The United States does not take a position on the competing territorial sovereignty claims. It does take an explicit position on freedom of navigation — the principle, foundational to international maritime law, that no nation can close international waters to other nations' ships. U.S. Navy vessels conduct Freedom of Navigation Operations throughout the South China Sea precisely to challenge what the United States considers excessive maritime claims.

China considers these operations provocative. The United States considers them a legal and strategic necessity. Neither side has shown any inclination to change its position, and the frequency of close encounters between U.S. and Chinese naval and air assets in the region has increased steadily.

## The Escalation Ladder

The danger in the South China Sea is not a sudden large-scale conflict. It is the gradual escalation of incidents — a Philippine vessel rammed, a U.S. aircraft intercepted too aggressively, a miscalculation that produces casualties — that creates pressure on both sides to respond in ways that compound rather than defuse the crisis.

China has demonstrated significant patience in pursuing its objectives incrementally, moving slowly enough that each individual action can be framed as a minor provocation while the cumulative effect is a dramatic shift in the strategic balance. The island bases exist. The military hardware is deployed. The window to contest those facts through anything short of direct military action has largely closed.

What remains is management of a situation that grows more dangerous as China's capabilities improve and its willingness to test U.S. resolve becomes more apparent. The South China Sea is not where the next war will necessarily start. It is where the conditions for one are being most actively constructed.`,
  },
  {
    slug: 'ukraine-war-european-security-order',
    title: 'Ukraine Rewrote the European Security Order',
    excerpt: 'Russia\'s full-scale invasion of Ukraine in 2022 shattered assumptions that had governed European security for three decades. The continent that emerged on the other side looks fundamentally different.',
    category: 'Geopolitics',
    date: 'MAR 10, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `On February 24, 2022, Russia launched the largest ground invasion in Europe since World War II. The assumptions that collapsed in the hours that followed had been built carefully over three decades — that major territorial war in Europe was obsolete, that economic interdependence prevented conflict, that Russia, despite its behavior in Georgia in 2008 and Crimea in 2014, would ultimately calculate that the costs of full-scale war outweighed the benefits.

Every one of those assumptions was wrong. The war that followed has reshaped the European security architecture more profoundly than any event since the Cold War's end, and the reshaping is not finished.

## NATO's Transformation

The most immediate strategic consequence was the acceleration of NATO's eastern flank. Finland and Sweden, nations that had maintained careful neutrality for decades — in Finland's case, through a Cold War that required extraordinary diplomatic delicacy with a Soviet neighbor — applied for NATO membership within months of the invasion. Finland formally joined in April 2023. Sweden followed in March 2024.

The addition of Finland alone fundamentally changes NATO's strategic position. Finland shares an 830-mile border with Russia, more than doubling NATO's direct land border with Russian territory. The military geography of the Baltic Sea shifted overnight — from a body of water with NATO presence to effectively a NATO lake, with Russia's access to it constrained at both the Danish Straits and the Finnish coast.

Within existing NATO members, defense spending increased dramatically. Germany's announcement of a €100 billion special defense fund represented a generational shift in a country that had built its post-war identity partly around restraint in military matters. Poland, which shares borders with both Russia's Kaliningrad exclave and Belarus — effectively a Russian client state after 2020 — accelerated its military buildup to become one of the most capable conventional forces in Europe.

## What the War Revealed

Ukraine's resistance exposed significant weaknesses in Russian conventional military capability that Western intelligence assessments had not fully anticipated. Logistics failures, command and control problems, equipment maintenance shortfalls, and the performance gap between Western-trained Ukrainian forces and Russian units produced early Ukrainian successes that surprised nearly every outside observer.

But the war also revealed Western weaknesses. The scale of ammunition consumption in high-intensity conventional warfare exceeded what NATO stockpiles or defense industrial production rates could sustain. Artillery ammunition that Ukrainian forces expended in days represented months of Western production capacity. The war forced a reckoning with defense industrial bases that had been optimized for post-Cold War assumptions about the nature and tempo of future conflicts.

The lessons are still being processed. Every European military is rethinking force structure, ammunition stockpiles, artillery capacity, air defense requirements, and the relationship between conventional forces and drone warfare. The war in Ukraine became, involuntarily, the most comprehensive test of modern conventional military capabilities in decades.

## The Economic Divorce

Europe's economic relationship with Russia before 2022 represented decades of deepening interdependence — particularly in energy. German grand strategy had placed significant weight on the theory that trade created stability, that a Russia integrated into European economic structures would be a Russia with incentives to preserve those structures. Nordstream exemplified this logic.

The war ended it. European nations undertook a rapid and painful divorce from Russian energy, accepting significant economic costs to eliminate a strategic vulnerability that the invasion had made impossible to ignore. Russian gas exports to Europe collapsed. The diversification that followed — accelerated LNG imports, renewable energy buildout, efficiency measures — was economically disruptive and is strategically irreversible.

## Russia's Strategic Position

Russia achieved none of its original operational objectives. The rapid seizure of Kyiv failed. Ukrainian government and military continuity was maintained. NATO expanded rather than retreated. Western military assistance to Ukraine, while debated and sometimes delayed, continued.

What Russia did achieve was the occupation of approximately 20 percent of Ukrainian territory, a grinding war of attrition that exploited its population and industrial advantages, and the absorption of costs — sanctions, casualties, international isolation — that Western planners had assumed would be prohibitive.

The war is not over. Its eventual resolution, whatever form it takes, will not restore the European security environment that existed before February 2022. That environment is gone. What replaces it is still being contested, on the battlefield and in the capitals of every nation watching.`,
  },
  {
    slug: 'iran-nuclear-threshold',
    title: 'Iran Is One Decision Away from a Nuclear Weapon',
    excerpt: 'Tehran has accumulated enough enriched uranium for multiple bombs. The question is no longer whether Iran can build a nuclear weapon — it\'s whether it has decided to.',
    category: 'Geopolitics',
    date: 'MAR 8, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `The term "nuclear threshold state" describes a country that has acquired the technical capability to build a nuclear weapon but has not yet made the political decision to do so. Iran passed that threshold. The International Atomic Energy Agency and U.S. intelligence assessments have confirmed that Iran has enriched sufficient uranium to weapons-grade levels for several nuclear devices and has advanced its understanding of weaponization. What separates Iran from a declared nuclear state is not capability. It is a decision.

That decision, if made, would reshape the Middle East more profoundly than any development since Israel's establishment in 1948.

## The Technical Baseline

The JCPOA — the Joint Comprehensive Plan of Action negotiated in 2015 — placed limits on Iranian uranium enrichment, capped its stockpile of enriched material, restricted centrifuge deployment, and established an inspection regime. In exchange, international sanctions were lifted. The United States withdrew from the agreement in 2018. Iran progressively abandoned its commitments in response.

By the mid-2020s, Iran was enriching uranium to 60 percent purity — below the 90 percent typically considered weapons-grade, but representing technical mastery of the enrichment process that makes crossing to weapons-grade a matter of weeks rather than years. Its stockpile of enriched uranium had grown to levels that, if further enriched, could theoretically fuel multiple devices. Its advanced centrifuge deployment had dramatically reduced the time required to produce weapons-grade material.

The IAEA's ability to monitor these developments has been repeatedly constrained by Iranian restrictions on inspections. What the agency cannot see, it cannot verify.

## The Weaponization Question

Enriched uranium is one component of a nuclear weapon. Weaponization — designing a device that can be delivered by a missile or aircraft and detonated reliably — is a separate technical challenge. U.S. intelligence assessments have consistently maintained that Iran halted its structured weaponization program in 2003, though it has continued research with potential weapons applications.

The honest assessment is that the weaponization timeline is the most uncertain variable. Iran almost certainly understands the physics. Whether it has solved the engineering problems required to build a reliable, deliverable device is less clear from the outside.

## Regional Implications

An Iranian nuclear weapon would trigger one of the most consequential proliferation cascades in history. Saudi Arabia has explicitly stated that it would pursue nuclear capabilities if Iran acquired them. Turkish leadership has made similar signals. Egypt and the UAE have nuclear energy programs that could be redirected. A Middle East with multiple nuclear-armed states, absent the arms control architecture and communication channels that constrained U.S.-Soviet nuclear competition, represents a qualitatively different and more dangerous strategic environment.

Israel, which has maintained a policy of nuclear ambiguity for decades while being widely understood to possess a nuclear arsenal, has consistently stated that it will not permit Iran to acquire nuclear weapons. Israeli military planning for a strike on Iranian nuclear facilities is real, has been exercised, and represents a credible option that Israeli leadership has not taken off the table.

## The Diplomatic Impasse

Every diplomatic framework proposed to address Iran's nuclear program has collapsed or stalled. The JCPOA is effectively defunct. Negotiations for a successor agreement have produced no breakthrough. Iran has used the time productively, advancing its program while talks proceed, establishing a pattern of using diplomacy to create space for technical progress rather than as a genuine path to resolution.

The impasse reflects a fundamental problem: Iran believes nuclear capability provides strategic deterrence and regime security that no diplomatic agreement can fully replace. Its observation of what happened to Muammar Gaddafi after Libya surrendered its weapons program, and to Saddam Hussein after Iraq was found not to have WMD, has reinforced that belief.

What remains is a situation in which a decision by Iranian leadership — perhaps triggered by a change in regime, a domestic crisis, a regional escalation, or a calculated judgment about strategic opportunity — could produce a nuclear-armed Iran within months. The international community has not found a durable answer to that prospect.`,
  },

  // ── NATIONAL SECURITY ─────────────────────────────────────────────────────
  {
    slug: 'americas-nuclear-triad-aging',
    title: 'America\'s Nuclear Triad Is Aging. Modernization Is Behind Schedule.',
    excerpt: 'The weapons and delivery systems that underpin U.S. nuclear deterrence were designed during the Cold War. Their replacements are delayed, over budget, and arriving into a more complex threat environment.',
    category: 'National Security',
    date: 'MAR 11, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `The United States nuclear deterrent rests on three legs: land-based intercontinental ballistic missiles, submarine-launched ballistic missiles, and nuclear-capable aircraft. This triad was designed to ensure that no first strike could eliminate all U.S. retaliatory capability simultaneously — an adversary would have to defeat three distinct systems with three distinct vulnerabilities at the same time, a practical impossibility that makes nuclear aggression irrational.

The logic holds. The hardware is aging out.

The Minuteman III ICBMs currently deployed in silos across Montana, Wyoming, and North Dakota entered service in the 1970s. The B-52 bombers that form the backbone of the airborne leg first flew in the 1950s. Even the Ohio-class ballistic missile submarines — the most survivable and arguably most important leg of the triad — are reaching the end of their planned service lives. All three legs require replacement. All three replacement programs are experiencing delays and cost growth.

## The Ground Leg: Sentinel

The LGM-35A Sentinel, intended to replace the Minuteman III, has become one of the most troubled major defense programs in recent memory. A 2024 Nunn-McCurdy breach — a statutory threshold triggered when a program's cost growth exceeds certain percentages — required a formal review and certification that the program remained essential to national security. It was certified. The cost growth did not stop.

The program's challenges reflect both the technical complexity of building a new ICBM from scratch and the difficulty of maintaining industrial capabilities that atrophied during decades when nuclear modernization was not a budget priority. The specialized skills, supply chains, and manufacturing processes required for nuclear weapons systems cannot be reconstituted quickly. The bill for that atrophy is now being paid.

## The Sea Leg: Columbia Class

The Columbia-class ballistic missile submarine is the highest-priority shipbuilding program in the U.S. Navy. It is intended to replace the Ohio-class boats as they retire, maintaining a continuous at-sea deterrent — submarines on patrol at all times, survivable and capable of retaliation under any circumstances. The first Columbia-class boat is scheduled for delivery in the late 2020s.

Submarine construction is among the most demanding manufacturing enterprises in existence. The Columbia program is currently tracking against its schedule with less margin than program managers would prefer, in a shipbuilding industrial base that is simultaneously being asked to accelerate attack submarine production, maintain surface combatants, and support allied submarine programs through the AUKUS partnership. The capacity constraints are real.

## The Air Leg: B-21 Raider

The B-21 Raider is the success story of the triad modernization programs. Northrop Grumman has delivered the first production aircraft on a schedule and cost trajectory that represents a genuine achievement by defense acquisition standards. The B-21's low-observable design and advanced avionics are intended to maintain penetrating capability against advanced integrated air defense systems well into the mid-21st century.

The B-52, which the B-21 will complement rather than immediately replace, is itself undergoing a significant re-engining program that will extend its service life — a recognition that the bomber fleet will need to bridge a gap between current and future capability.

## The Threat Environment

American nuclear modernization is occurring against a backdrop in which both Russia and China are expanding and modernizing their own nuclear arsenals in ways that complicate traditional deterrence calculations.

Russia has invested in novel delivery systems explicitly designed to defeat U.S. missile defenses, including hypersonic glide vehicles and a nuclear-powered cruise missile. China is expanding its ICBM force at a pace that intelligence assessments suggest could produce a stockpile approaching parity with the United States by 2035 — a development without precedent in the nuclear age.

The United States has not faced a two-peer nuclear competitor before. Its deterrence posture, arms control frameworks, and force structure were all designed for a world in which one adversary — the Soviet Union, then Russia — was the primary nuclear concern. That world is gone. The modernization programs that are behind schedule and over budget are being delivered into a threat environment significantly more demanding than the one that originally justified them.`,
  },
  {
    slug: 'fentanyl-national-security-threat',
    title: 'Fentanyl Is a National Security Crisis, Not Just a Drug Problem',
    excerpt: 'More than 70,000 Americans die from synthetic opioid overdoses every year. The supply chain runs from Chinese chemical companies through Mexican cartels to American streets — and it is being used as a weapon.',
    category: 'National Security',
    date: 'MAR 9, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `Fentanyl kills roughly 70,000 to 80,000 Americans annually — more than the United States lost in the entire Vietnam War, every year, without pause. It is the leading cause of death for Americans between the ages of 18 and 45. The scale of destruction has no modern American parallel, and it is not accidental. The supply chain that produces it, moves it, and distributes it across the United States is an organized transnational system, and the refusal to analyze it as a national security threat rather than a public health problem has shaped — and limited — the American response.

## The Supply Chain

Fentanyl's journey to American communities follows a well-documented path. The chemical precursors — primarily manufactured in China — are shipped to Mexico, where the Sinaloa Cartel and the Jalisco New Generation Cartel have built industrial-scale fentanyl production operations. The finished product enters the United States primarily through legal ports of entry, often concealed in commercial shipments, passenger vehicles, and mail parcels.

The Chinese government's role in this supply chain has been the subject of significant debate. Chinese chemical companies produce the precursor chemicals that make Mexican fentanyl possible. Some operate with apparent awareness of their customers' purposes. Chinese regulatory action to control these companies has been inconsistent. American officials have argued — with substantial evidence — that Beijing has used fentanyl as a coercive instrument, tightening or loosening precursor availability in response to diplomatic pressure or as leverage in broader negotiations.

Whether this represents deliberate state policy or tolerated commercial activity with strategic benefits is a distinction that may matter less than its practical effect: Chinese precursors flowing to Mexican cartels, producing fentanyl that kills tens of thousands of Americans annually.

## The Cartel Dimension

The Mexican cartels that dominate fentanyl production and distribution have transformed themselves over the past decade from primarily marijuana and cocaine trafficking organizations into sophisticated transnational criminal enterprises with fentanyl as their flagship product. The economics are compelling: fentanyl is dramatically cheaper to produce, more potent by weight, easier to conceal, and more addictive than the drugs it has displaced.

Cartel territorial control in Mexico has expanded. Their capacity to corrupt Mexican law enforcement and government institutions has grown. Their reach into American communities — through distribution networks that extend far beyond border regions — is more extensive than at any point in history. These are not organizations that can be addressed through conventional law enforcement approaches applied at the operational margins.

## Why This Is a National Security Issue

The traditional frame for the opioid crisis is public health — addiction treatment, harm reduction, education. These responses are necessary and have saved lives. They are not sufficient to address a supply chain sustained by foreign state actors and transnational criminal organizations operating at scale.

When a foreign supply chain is deliberately targeting American citizens and killing them at rates that exceed wartime casualties, the analytical framework of public health is inadequate. The same tools and authorities the United States applies to foreign terrorism — sanctions, intelligence collection, disruption operations, financial pressure, diplomatic coercion — are available for application to the fentanyl supply chain and have been underutilized.

The Departments of Defense, State, Treasury, and Justice all have equities and capabilities relevant to the fentanyl crisis that have not been fully mobilized, in part because the crisis has been categorized in ways that route it to health agencies rather than security agencies.

## The Strategic Implication

A nation that loses 75,000 citizens annually to a foreign-supplied substance, that watches a generation hollowed out by addiction, and that cannot adequately protect its own population from a supply chain that runs through adversary states and their criminal proxies is demonstrating a vulnerability that adversaries notice.

Fentanyl's death toll exceeds what any conventional military attack on American soil has produced. The absence of uniformed soldiers does not make it less of an attack. It makes it a more effective one — deniable, sustainable, and operating below the threshold that would trigger the security responses an obvious attack would generate. Treating it as anything less than a national security crisis is a choice with consequences that compound every year.`,
  },
  {
    slug: 'defense-industrial-base-crisis',
    title: 'America\'s Defense Industrial Base Has a Capacity Problem',
    excerpt: 'The war in Ukraine exposed a stark reality: the United States cannot produce weapons and ammunition fast enough to sustain high-intensity conventional warfare. The gap between what we can make and what modern war consumes is dangerous.',
    category: 'National Security',
    date: 'MAR 7, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `In the early months of sustained combat in Ukraine, Ukrainian forces were expending artillery ammunition at rates that stunned Western defense planners. Not because the rate was unusual for high-intensity conventional warfare — it wasn't. It was typical of what large-scale artillery duels have always consumed. The shock was the recognition that the United States and its NATO allies could not produce ammunition at anything approaching that rate.

The 155mm artillery shell that Ukrainian forces needed in vast quantities took the United States roughly 14,000 rounds per month to produce at the war's outset. Ukrainian forces were consuming multiples of that number weekly. The gap between American production capacity and the actual demands of peer-level conventional warfare was, and remains, a serious strategic problem.

## Three Decades of Optimization for the Wrong War

After the Cold War ended, the United States defense industrial base was systematically restructured. The logic was sound given the assumptions: the Soviet threat was gone, future conflicts would be smaller-scale and faster, precision weapons would substitute for volume, and maintaining excess industrial capacity was wasteful. Defense companies consolidated. Factories closed. Supply chains that had been maintained for surge capacity were allowed to atrophy.

The result was an industrial base optimized for the kind of warfare the United States had experienced since 1991 — technologically sophisticated, air power-dominant, relatively short-duration operations against adversaries without peer conventional capabilities. It was not optimized for a sustained land war between industrial powers consuming munitions at Cold War rates.

That is the war that Ukraine is fighting. It is also, in various scenarios, the war that a Taiwan contingency could produce.

## The Munitions Gap

The specific shortfalls extend well beyond artillery ammunition. Stinger anti-aircraft missiles, transferred to Ukraine in large numbers, require years to replace due to supply chain dependencies on components no longer in mass production. Javelin anti-tank missiles face similar constraints. Guided Multiple Launch Rocket System munitions, critical to Ukrainian long-range fires, are in limited supply.

The Navy's inventory of long-range strike missiles — Tomahawks, Joint Air-to-Surface Standoff Missiles, anti-ship missiles — represents strategic concern in any scenario requiring sustained offensive operations. A Taiwan scenario that consumed these weapons at realistic combat rates would exhaust stocks faster than they could be replenished under current production timelines.

## Why Surge Capacity Is Hard to Rebuild

The challenge of reconstituting production capacity is not simply a matter of funding. The workforce skills, specialized manufacturing equipment, supplier relationships, and production processes required for defense-specific manufacturing cannot be rebuilt quickly. A skilled munitions production technician requires years of training and experience. A facility retooled from commercial to defense manufacturing needs qualified supply chains for specialized materials.

The explosives supply chain illustrates the problem. The energetic materials used in artillery shells and missile warheads require specialized facilities with particular safety requirements. Those facilities do not exist in commercial industry. Their capacity is fixed in the short term regardless of funding levels.

## What Is Being Done

The Pentagon has accelerated munitions production investments, authorized multi-year procurement contracts to give industry the demand certainty required to justify capacity expansion, and pushed to expand the supplier base. These actions will produce results — on timelines measured in years, not months.

Defense industrial base expansion requires a sustained commitment that survives budget cycles and administration changes. The investments being made now will matter. Whether they will produce sufficient capacity before a scenario arises that tests them is a question no one can answer with confidence.

The structural lesson of Ukraine is that the United States cannot assume that the military balance it maintains in peacetime will persist through a sustained conventional conflict. The industrial base that supplies that military is a critical variable — and right now, it is a vulnerability.`,
  },

  // ── CYBERSECURITY (additional) ────────────────────────────────────────────
  {
    slug: 'ransomware-national-security-threat',
    title: 'Ransomware Has Become a National Security Threat',
    excerpt: 'What began as opportunistic criminal extortion has evolved into a geopolitically significant tool — targeting hospitals, pipelines, schools, and the systems Americans depend on every day.',
    category: 'Cybersecurity',
    date: 'MAR 6, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `In May 2021, a ransomware attack on Colonial Pipeline — which supplies roughly 45 percent of the East Coast's fuel — forced a five-day shutdown that produced fuel shortages across the southeastern United States, long lines at gas stations, panic buying, and a declaration of regional emergency in multiple states. The attackers, a criminal group operating out of Russia known as DarkSide, received a ransom payment of approximately $4.4 million in Bitcoin. The FBI subsequently recovered a portion of it. The pipeline eventually came back online.

The entire disruption was caused by criminals with keyboards, motivated by money, operating from a country that provides them sanctuary. That is the ransomware threat in its current form — not science fiction, not a distant possibility, but a demonstrated capability to produce significant national-scale disruption through attacks on civilian infrastructure.

## The Evolution of Ransomware

Early ransomware was a relatively unsophisticated crime. Malware encrypted a victim's files; the victim paid a modest sum to get the decryption key. The targets were individuals and small businesses, the ransoms were measured in hundreds of dollars, and the operators were often individual criminals rather than organized groups.

The transition to what security researchers call "big game hunting" — targeting large organizations for large ransoms — changed the risk calculus entirely. Modern ransomware operations are structured like businesses, with affiliate models that allow technical operators to focus on malware development while recruiting partners to handle intrusion and deployment. They maintain customer service operations to facilitate ransom negotiations. They conduct due diligence on victims' financial positions to calibrate demands. They threaten to publish stolen data — double extortion — to increase pressure on victims who might otherwise restore from backups.

The professionalization of ransomware has produced attacks that are more targeted, more sophisticated, and more damaging than anything the early criminal ecosystem could have generated.

## The Sanctuary Problem

The most operationally significant fact about ransomware is that the most capable and damaging groups operate with effective impunity from Russia and several other states. This is not because these governments are incapable of arresting their own citizens. It is because they choose not to — or because the criminal groups have relationships with state security services that make them politically untouchable.

DarkSide, the Colonial Pipeline attackers, dissolved shortly after the attack following what appeared to be pressure from Russian authorities — pressure motivated not by law enforcement principles but by the diplomatic heat the attack generated. The group's members are believed to have reconstituted under different names. No one has faced criminal accountability.

This arrangement serves Russian strategic interests. Criminal ransomware groups provide deniable disruptive capability against Western infrastructure. If they become diplomatically inconvenient, pressure can be applied — demonstrating Russian leverage over the groups and providing a diplomatic off-ramp. The arrangement is not accidental.

## The Target Set

Ransomware groups have demonstrated a willingness to attack targets with potentially lethal consequences. Hospitals have been targeted during the COVID-19 pandemic. Water treatment facilities have been compromised. School districts, municipal governments, and emergency services have faced attacks that degraded their ability to function.

The healthcare sector has been particularly targeted, in part because hospitals face acute pressure to restore operations quickly — making them more likely to pay — and in part because patient care creates direct life-safety consequences that increase payment urgency. Several hospitals have reported incidents in which patient care was compromised during ransomware attacks.

## The Policy Response

U.S. policy has shifted meaningfully in response to ransomware's emergence as a national security threat. Ransomware attacks on critical infrastructure have been elevated to a priority comparable to terrorism within federal law enforcement. The Treasury Department has sanctioned cryptocurrency exchanges that facilitate ransom payments. International partnerships to share intelligence and coordinate law enforcement actions have expanded.

These measures have produced some results — arrests, infrastructure seizures, ransom recoveries. They have not fundamentally disrupted the ransomware ecosystem. As long as capable groups can operate from jurisdictions that will not extradite them, and as long as cryptocurrency provides a relatively frictionless payment mechanism, ransomware will remain a profitable and politically tolerated activity.

The gap between the sophistication of the threat and the adequacy of the response is where the risk lives — and it is a gap that the next major attack will make impossible to ignore.`,
  },

  // ── INTELLIGENCE (additional) ─────────────────────────────────────────────
  {
    slug: 'five-eyes-alliance-explained',
    title: 'The Five Eyes: The World\'s Most Powerful Intelligence Alliance',
    excerpt: 'The United States, United Kingdom, Canada, Australia, and New Zealand share intelligence so completely that they function as a single organism. Understanding Five Eyes is essential to understanding how Western intelligence actually works.',
    category: 'Intelligence',
    date: 'MAR 5, 2026',
    relevance: 'MED',
    featured: false,
    content: `After World War II, the United States and United Kingdom formalized an intelligence-sharing arrangement that had developed out of wartime necessity. The UKUSA Agreement, signed in 1946 and long classified, established the framework for what would become the most comprehensive intelligence-sharing arrangement in history. Canada joined the formal agreement in 1948. Australia and New Zealand followed in 1956. The result — known colloquially as Five Eyes — is an intelligence community that operates across five sovereign nations as if national borders were administrative inconveniences rather than meaningful divisions.

The Five Eyes arrangement is not publicly described in full. Its operational details remain classified. What is known — through declassified documents, official acknowledgments, and investigative journalism — provides sufficient clarity to understand what makes it strategically significant.

## What Five Eyes Does

The core function of Five Eyes is signals intelligence sharing — the interception, processing, and analysis of electronic communications. Each member brings geographic coverage, linguistic expertise, technical capabilities, and collection infrastructure that the others lack. Pooled, they provide coverage of global communications that no single nation could achieve alone.

The United States contributes unmatched technical capabilities, budget, and global reach through the National Security Agency. The United Kingdom's Government Communications Headquarters brings deep access to transatlantic communications infrastructure and expertise in particular regional targets. Australia's Signals Directorate covers the Pacific and Southeast Asia with geographic advantages that U.S. collection cannot fully replicate. Canada's Communications Security Establishment provides Arctic coverage and specific regional expertise. New Zealand's Government Communications Security Bureau contributes Pacific coverage.

The division is not strictly geographic — all Five Eyes partners collect globally — but the geographic distribution of the alliance's footprint provides coverage advantages that matter.

## The Principle of Equivalence

What distinguishes Five Eyes from more typical intelligence-liaison relationships is the depth of integration. Five Eyes partners share raw intelligence — unprocessed collection — not just finished analytical products. They share collection methods and technical capabilities. They have personnel embedded in each other's agencies. In many functional respects, the five agencies operate as departments of a single institution that happens to answer to five different governments.

The formal term for the depth of this sharing is "second party" status, which places Five Eyes partners in a category distinct from the "third party" status of other close allies. The distinction is both technical — what categories of intelligence are shared, at what classification levels — and relational, reflecting a trust developed over eight decades of sustained cooperation.

## Why It Matters Now

The Five Eyes alliance has faced questions about its future relevance in an era when the primary signals intelligence targets are encrypted communications on commercial platforms rather than radio transmissions or cable communications. The technical challenge of intercepting communications on end-to-end encrypted messaging applications is different in kind from the signals intelligence challenges of the Cold War.

The alliance has adapted, though details of how remain appropriately classified. The direction of travel is toward greater emphasis on human intelligence, on exploiting endpoint vulnerabilities rather than intercepting communications in transit, and on integrating signals intelligence with cyber operations in ways that blur the traditional boundaries between collection and action.

The more significant contemporary relevance of Five Eyes is the coordination it enables on threats that cross national boundaries — Chinese intelligence operations targeting all five nations simultaneously, Russian disinformation campaigns, transnational criminal networks, and terrorist financing. Intelligence about a Chinese state-sponsored hacking group active in Australia is immediately relevant to defenders in the United States, United Kingdom, Canada, and New Zealand. The Five Eyes framework makes sharing that intelligence nearly automatic.

## The Limits and Tensions

Five Eyes is not without friction. All five nations have interests that occasionally diverge, and intelligence sharing does not eliminate those divergences — it sometimes complicates them. The question of sharing intelligence that implicates an ally's own citizens, or that touches on commercial matters where national economic interests diverge, creates recurring tensions managed through diplomatic channels rather than resolved by the existence of the alliance.

The alliance also faces questions about extending benefits to close partners outside the original five. The AUKUS security partnership has created new intelligence-sharing arrangements with Australia that go beyond traditional Five Eyes frameworks. Japan, South Korea, and other close U.S. allies have bilateral arrangements that approach but do not match Five Eyes depth.

Five Eyes remains, despite these complications, the most effective sustained intelligence cooperation arrangement in history — a model that has survived Cold War tensions, post-Cold War drift, and the strains of divergent responses to terrorism and digital surveillance. Its durability reflects both the genuine value of the cooperation and the trust that eight decades of shared secrets creates.`,
  },

  // ── ECONOMIC SECURITY (additional) ───────────────────────────────────────
  {
    slug: 'rare-earth-supply-chain-war',
    title: 'China Controls the Minerals That Power Modern Defense. That\'s a Problem.',
    excerpt: 'Rare earth elements are essential to F-35 fighters, guided missiles, electric vehicles, and semiconductor manufacturing. China produces and processes the overwhelming majority of global supply — and it knows it.',
    category: 'Economic Security',
    date: 'MAR 4, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `The F-35 fighter requires approximately 417 kilograms of rare earth materials per aircraft. A Virginia-class submarine requires nearly 4,000 kilograms. Guided missile systems, radar equipment, night-vision devices, electric motors for military vehicles, and the magnets in virtually every precision guidance system depend on rare earth elements. These are not peripheral inputs to modern military capability. They are foundational.

China mines approximately 60 percent of the world's rare earth elements and, more critically, processes roughly 85 to 90 percent of global supply. The distinction matters: rare earth processing is a technically demanding, environmentally intensive industrial process that takes years to develop and has been deliberately concentrated in China through decades of strategic investment and below-market pricing that drove competitors out of business.

The United States, which once had a significant rare earth industry centered on the Mountain Pass mine in California, allowed that capacity to atrophy. It now depends on Chinese processing for materials essential to its own defense systems — a supply chain vulnerability that has no close parallel in the history of American industrial dependence on a strategic adversary.

## How the Dependence Developed

The story of rare earth dependence is a story about economics and short-term thinking defeating strategic calculation. Chinese rare earth producers, backed by state subsidies, were able to price their products below the cost of production for competitors who lacked equivalent government support. Western rare earth mines and processing facilities, unable to compete on price in a market that did not fully price strategic risk, closed.

The environmental dimension accelerated the concentration. Rare earth processing produces radioactive waste and requires significant environmental controls. Regulatory requirements in the United States and Europe made domestic processing expensive. Chinese facilities operated under less stringent requirements, producing a cost advantage that compounded the subsidy effect.

The result, by the 2010s, was near-total dependence on Chinese supply for rare earth elements and nearly complete dependence on Chinese processing. The defense implications were apparent to anyone who looked, but the problem competed for attention with more immediate priorities.

## China's Leverage

China has demonstrated willingness to use rare earth supply as a coercive instrument. In 2010, during a diplomatic dispute with Japan over a fishing trawler incident near the disputed Senkaku Islands, China halted rare earth exports to Japan — then the world's largest consumer. The message was unambiguous, and Japan accelerated its rare earth diversification efforts in response.

The threat of similar action against the United States or its allies is a standing feature of the strategic competition between Washington and Beijing. Chinese officials have referenced rare earth leverage explicitly in the context of trade disputes. The dependence that creates that leverage was not forced on the United States — it was allowed to develop through decades of market-driven decisions that did not account for strategic risk.

## The Diversification Effort

Recognition of the problem has produced policy responses on multiple fronts. The Defense Production Act has been invoked to support domestic rare earth projects. The Inflation Reduction Act and CHIPS Act created incentives for domestic critical minerals processing. Australia, Canada, and allied nations with significant rare earth deposits have been engaged as alternative suppliers. The Mountain Pass mine has resumed production.

Processing capacity is the harder problem. Building a rare earth processing facility requires capital investment, technical expertise, environmental permitting, and years of development time. The United States cannot have meaningful domestic processing capacity on a timeline of less than five to ten years under the most optimistic scenarios. Allies with processing capabilities — Japan has invested heavily — provide some alternative supply, but the gap between current dependence and strategic sufficiency remains large.

## The Broader Critical Minerals Picture

Rare earths are one dimension of a broader critical minerals vulnerability. Cobalt, essential to battery technology, is concentrated in the Democratic Republic of Congo and often processed in China. Lithium, essential to electric vehicles and grid storage, is concentrated in a handful of countries. Gallium and germanium — critical to semiconductor manufacturing — are almost exclusively processed in China, which imposed export controls on both in 2023 in response to Western semiconductor restrictions.

The pattern across critical minerals is consistent: concentrated supply, significant Chinese processing dominance, and inadequate Western investment in diversification until disruption becomes acute. The rare earth problem is the clearest case, but it is not the only one. The strategic competition with China is, in significant part, a competition over who controls the material inputs to the technologies that will define 21st-century economic and military power.`,
  },

  // ── OPSEC (existing, moved here) ─────────────────────────────────────────
  {
    slug: 'why-opsec-matters',
    title: 'Why OPSEC Matters — And Why Most People Get It Wrong',
    excerpt: 'Operations security isn\'t just a military doctrine. It\'s a mindset — and the failure to adopt it has compromised operations, careers, and lives.',
    category: 'Intelligence',
    date: 'MAR 13, 2026',
    relevance: 'HIGH',
    featured: false,
    content: `In 1965, U.S. military units preparing for operations in Vietnam began noticing a troubling pattern. Enemy forces seemed to anticipate American movements before they happened. No communications had been intercepted. No spies had been uncovered. The information wasn't being stolen — it was being given away, piece by piece, through routine behavior that no one thought twice about.

The investigation that followed gave birth to a formal methodology the military would eventually call Operations Security, or OPSEC. The core insight was unsettling in its simplicity: the enemy doesn't need to steal your secrets if you hand them the pieces to figure it out themselves.

That insight is as relevant today as it was in the jungles of Southeast Asia — arguably more so, given how much of our lives we now conduct in the open.

## What OPSEC Actually Is

OPSEC is not about hiding everything. It is about identifying which specific pieces of information, in combination, allow an adversary to understand your intentions, capabilities, or vulnerabilities — and then denying them those pieces.

The formal five-step OPSEC process developed by the military involves identifying critical information, analyzing threats, analyzing vulnerabilities, assessing risk, and applying countermeasures. But at its core, OPSEC is a thinking discipline. It forces you to look at your own behavior through the eyes of someone who wants to use it against you.

The classic example: a soldier calling home to say he can't talk because the unit is deploying soon, combined with a base that just ordered unusual quantities of supplies, combined with a flurry of leave cancellations — none of those things is classified. All of them together tell an adversary something significant.

## The Modern OPSEC Failure Landscape

The digital environment has made OPSEC failures catastrophically easy. Social media is the single greatest OPSEC vulnerability most people carry with them at all times.

In 2012, researchers demonstrated that soldiers at classified bases were inadvertently revealing their locations through fitness tracking apps that publicly displayed their running routes. In 2017, the same problem exposed the perimeters of classified forward operating bases overseas — the heat maps generated by aggregated fitness tracker data lit up like a diagram of secret facilities.

These weren't failures by careless people. They were failures by people who didn't understand that innocuous individual actions create exploitable patterns in aggregate.

The same dynamic plays out in the civilian world constantly. Journalists investigating sensitive subjects who check in on social media. Corporate executives who discuss deal timelines on personal devices. Activists in authoritarian countries who use unencrypted communications. Domestic abuse survivors whose location metadata is embedded in every photo they post.

OPSEC failures are rarely dramatic. They are almost always mundane.

## The Adversary's Perspective

Effective OPSEC requires what intelligence professionals call "red teaming" your own behavior — stepping outside your own perspective and asking what an adversary could infer from what you've made observable.

This is harder than it sounds. Human beings are not wired to see themselves as intelligence targets. We share information socially because sharing is how we build relationships and coordinate activity. The impulse to tell people what we're doing, where we're going, and what we're planning is deeply ingrained.

An adversary — whether a nation-state intelligence service, a corporate competitor, a stalker, or a criminal — doesn't need you to make one catastrophic mistake. They need you to make a hundred small, normal ones. They're collecting. Correlating. Building a picture over time from sources you don't think twice about.

Your LinkedIn profile tells them your professional network and your career trajectory. Your Instagram tells them your location patterns and social relationships. Your public calendar tells them when you travel. Your fitness data tells them your daily routine. None of it is secret. All of it is useful.

## Where OPSEC Gets Applied Wrong

The most common OPSEC failure isn't ignoring security entirely — it's applying security measures to the wrong things while leaving real vulnerabilities unaddressed.

Organizations will encrypt their classified files while their employees discuss sensitive projects on personal phones over consumer apps. They'll implement strict badge access protocols while their executives post about upcoming mergers on social media. They'll train staff on phishing while ignoring the fact that their organizational chart, complete with names and roles, is publicly available on LinkedIn.

This happens because most people think of information security as a technical problem with technical solutions. OPSEC is neither technical nor primarily about secrets. It's about patterns, inference, and the gap between what you think you're revealing and what a motivated observer can actually learn.

## OPSEC as a Personal Practice

At the individual level, OPSEC discipline starts with a simple habit: before sharing any information, asking who can see it, what else they might already know, and what the combination tells them.

This doesn't require paranoia. It requires calibrated awareness. A private individual living an ordinary life doesn't need the OPSEC posture of a covert operations officer. But anyone who operates in an environment where they have adversaries — and that category is broader than most people assume — benefits from understanding how information about them accumulates and what it enables.

The fundamental discipline is this: stop thinking about information in isolation. Think about it in context. Think about what it confirms, what it reveals, and what it enables when combined with everything else that's already observable.

OPSEC isn't about secrets. It's about not handing someone the last piece of the puzzle.`,
  },
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

// ─────────────────────────────────────────────────────────────────────────────
// NEW HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns estimated reading time in minutes (200 wpm). */
export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Extracts ## headings for a table of contents. */
export function getTableOfContents(content: string): { id: string; text: string }[] {
  return content
    .split('\n\n')
    .filter(block => block.startsWith('## '))
    .map(block => {
      const text = block.slice(3).trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      return { id, text };
    });
}

/** Returns up to `count` related articles — same category first, then others. */
export function getRelatedArticles(currentSlug: string, count = 3): Article[] {
  const current = ARTICLES.find(a => a.slug === currentSlug);
  if (!current) return ARTICLES.filter(a => a.slug !== currentSlug).slice(0, count);
  const sameCategory = ARTICLES.filter(a => a.slug !== currentSlug && a.category === current.category);
  const different = ARTICLES.filter(a => a.slug !== currentSlug && a.category !== current.category);
  return [...sameCategory, ...different].slice(0, count);
}

/** Simple full-text search across title, excerpt, and content. */
export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase().trim();
  if (!q) return ARTICLES;
  return ARTICLES.filter(
    a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q),
  );
}
