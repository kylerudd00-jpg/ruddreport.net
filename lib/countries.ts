export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CyberThreat = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface Country {
  slug: string;
  name: string;
  flag: string;
  region: string;
  capital: string;
  government: string;
  population: string;
  threat_level: ThreatLevel;
  cyber_threat: CyberThreat;
  nato: boolean;
  us_sanctioned: boolean;
  active_conflicts: string[];
  apt_groups: string[];
  summary: string;
  key_concerns: string[];
}

export const COUNTRIES: Country[] = [
  // ── CRITICAL ────────────────────────────────────────────────────────────────
  {
    slug: 'russia', name: 'Russia', flag: '🇷🇺', region: 'Eastern Europe',
    capital: 'Moscow', government: 'Federal semi-presidential republic',
    population: '144M', threat_level: 'CRITICAL', cyber_threat: 'CRITICAL',
    nato: false, us_sanctioned: true,
    active_conflicts: ['Ukraine invasion (2022–present)', 'Syria (proxy, reduced)', 'Sahel (Wagner/Africa Corps)'],
    apt_groups: ['APT28 (Fancy Bear)', 'APT29 (Cozy Bear)', 'Sandworm', 'Turla', 'Gamaredon'],
    summary: 'Russia is engaged in the largest land war in Europe since World War II, with its full-scale invasion of Ukraine now in its fourth year. Moscow pursues hybrid warfare globally — combining conventional military force, cyber operations, information warfare, and the Wagner/Africa Corps mercenary network across Africa and the Middle East.',
    key_concerns: ['Active invasion of Ukraine with nuclear escalation rhetoric', 'GRU/SVR cyber operations against NATO infrastructure', 'Sandworm critical infrastructure pre-positioning', 'Wagner successor operations in Mali, Niger, Sudan, Libya', 'Strategic nuclear posture and doctrine revisions'],
  },
  {
    slug: 'north-korea', name: 'North Korea', flag: '🇰🇵', region: 'East Asia',
    capital: 'Pyongyang', government: 'Juche totalitarian state',
    population: '26M', threat_level: 'CRITICAL', cyber_threat: 'HIGH',
    nato: false, us_sanctioned: true,
    active_conflicts: ['Korean Peninsula (armistice, 1953)', 'Troops deployed to Russia (2024)'],
    apt_groups: ['Lazarus Group', 'APT38', 'Kimsuky', 'Andariel', 'ScarCruft'],
    summary: 'North Korea has crossed the nuclear threshold and continues advancing ballistic missile capabilities capable of reaching the continental United States. The Kim regime funds its weapons programs through state-sponsored cybercrime — Lazarus Group alone has stolen over $3 billion in cryptocurrency. DPRK deployed troops to Russia in 2024, marking its first direct military alliance in decades.',
    key_concerns: ['ICBM program capable of reaching CONUS', 'Submarine-launched ballistic missile development', 'Lazarus Group cryptocurrency theft funding weapons programs', 'DPRK-Russia military alliance and technology transfer', 'Risk of miscalculation on Korean Peninsula'],
  },
  {
    slug: 'iran', name: 'Iran', flag: '🇮🇷', region: 'Middle East',
    capital: 'Tehran', government: 'Islamic republic (theocratic)',
    population: '88M', threat_level: 'CRITICAL', cyber_threat: 'HIGH',
    nato: false, us_sanctioned: true,
    active_conflicts: ['Ongoing ceasefire negotiations (2026)', 'Proxy network: Hezbollah, Houthis, Iraqi militias'],
    apt_groups: ['APT33 (Elfin)', 'APT34 (OilRig)', 'APT35 (Charming Kitten)', 'MuddyWater', 'Agrius'],
    summary: 'Iran is a nuclear threshold state — assessed to have sufficient enriched uranium for multiple devices with a weaponization timeline measured in weeks. Iranian proxy networks span Lebanon, Yemen, Iraq, and Syria, providing strategic depth and deniable offensive capability. Pakistani-mediated ceasefire negotiations are ongoing as of April 2026.',
    key_concerns: ['Nuclear threshold — weeks from weapons-grade capability', 'Hezbollah missile arsenal targeting Israel', 'Houthi Red Sea shipping disruption', 'IRGC-backed militia network across Middle East', 'Charming Kitten targeting of U.S. political figures and dissidents'],
  },

  // ── HIGH ────────────────────────────────────────────────────────────────────
  {
    slug: 'china', name: 'China', flag: '🇨🇳', region: 'East Asia',
    capital: 'Beijing', government: 'Single-party socialist republic (CCP)',
    population: '1.4B', threat_level: 'HIGH', cyber_threat: 'CRITICAL',
    nato: false, us_sanctioned: false,
    active_conflicts: ['South China Sea (escalating)', 'Taiwan Strait (heightened tension)', 'India border (LAC standoff)'],
    apt_groups: ['Volt Typhoon', 'Salt Typhoon', 'APT41', 'APT40', 'APT10', 'APT1', 'HAFNIUM', 'APT31'],
    summary: 'China poses the most comprehensive long-term strategic challenge to the United States across military, economic, technological, and intelligence dimensions. Volt Typhoon has pre-positioned access inside U.S. critical infrastructure for use in a Taiwan contingency. Salt Typhoon compromised U.S. telecom lawful intercept systems in 2024. Taiwan remains the most likely flashpoint for direct U.S.-China conflict.',
    key_concerns: ['Taiwan military contingency — PLA modernization targeting late 2020s window', 'Volt Typhoon critical infrastructure pre-positioning', 'Salt Typhoon telecom penetration', 'Rare earth and critical mineral supply chain leverage', 'South China Sea artificial island military bases', 'Mass intellectual property theft across all sectors'],
  },
  {
    slug: 'ukraine', name: 'Ukraine', flag: '🇺🇦', region: 'Eastern Europe',
    capital: 'Kyiv', government: 'Unitary semi-presidential republic',
    population: '44M (pre-war)', threat_level: 'HIGH', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Russian invasion (2022–present)', 'Kursk incursion (2024)'],
    apt_groups: [],
    summary: 'Ukraine is in the fourth year of defending against Russia\'s full-scale invasion — the largest conventional war in Europe since 1945. Ukrainian forces have demonstrated extraordinary resilience and innovated rapidly in drone warfare, electronic warfare, and long-range strike capabilities. Western military aid remains the decisive variable in sustaining Ukrainian combat power.',
    key_concerns: ['Russian missile and drone strikes on civilian infrastructure', 'Western aid sufficiency and sustainability', 'Nuclear plant safety (Zaporizhzhia)', 'Manpower sustainability', 'Ceasefire negotiation terms and territorial questions'],
  },
  {
    slug: 'israel', name: 'Israel', flag: '🇮🇱', region: 'Middle East',
    capital: 'Jerusalem / Tel Aviv', government: 'Parliamentary democracy',
    population: '9M', threat_level: 'HIGH', cyber_threat: 'LOW',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Gaza (ongoing)', 'Lebanon (ceasefire discussions)', 'Iran (direct exchange, 2024)'],
    apt_groups: [],
    summary: 'Israel is engaged in sustained military operations in Gaza following the October 7, 2023 Hamas attack. Simultaneously managing direct confrontation with Iran and proxy conflicts with Hezbollah in Lebanon. Lebanon ceasefire discussions were underway as of April 2026. Israel maintains nuclear ambiguity and has demonstrated willingness to conduct long-range precision strikes against Iranian facilities.',
    key_concerns: ['Gaza operation international legal exposure', 'Hezbollah missile arsenal — 150,000+ rockets', 'Iran nuclear timeline and strike options', 'Lebanon ceasefire durability', 'Regional normalization (Abraham Accords expansion) at risk'],
  },
  {
    slug: 'pakistan', name: 'Pakistan', flag: '🇵🇰', region: 'South Asia',
    capital: 'Islamabad', government: 'Federal parliamentary republic',
    population: '231M', threat_level: 'HIGH', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Afghanistan border (TTP insurgency)', 'Kashmir (Line of Control tensions)', 'Iran mediation role (2026)'],
    apt_groups: ['Transparent Tribe (APT36)'],
    summary: 'Pakistan is the world\'s fifth-largest nuclear power operating in one of the most volatile strategic environments on earth, with nuclear-armed adversaries on two borders. Currently serving as a key mediator in U.S.-Iran ceasefire negotiations. Internal political instability and economic fragility complicate its strategic role. The Tehrik-i-Taliban Pakistan conducts regular cross-border attacks from Afghanistan.',
    key_concerns: ['Nuclear security and command-and-control stability', 'TTP cross-border insurgency from Afghanistan', 'India-Pakistan Kashmir tensions — both nuclear-armed', 'Economic fragility and IMF dependence', 'Civil-military political tensions'],
  },
  {
    slug: 'myanmar', name: 'Myanmar', flag: '🇲🇲', region: 'Southeast Asia',
    capital: 'Naypyidaw', government: 'Military junta (since 2021 coup)',
    population: '54M', threat_level: 'HIGH', cyber_threat: 'UNKNOWN',
    nato: false, us_sanctioned: true,
    active_conflicts: ['Multi-front civil war — resistance vs. junta (2021–present)', 'Ethnic armed organization offensives'],
    apt_groups: [],
    summary: 'Myanmar has been in civil war since the February 2021 military coup. The junta has lost significant territory to coordinated ethnic armed organization offensives, raising questions about its long-term survival. The conflict has produced a major humanitarian crisis with over 2.6 million displaced. Myanmar is also a global hub for cyber scam operations that victimize hundreds of thousands internationally.',
    key_concerns: ['Multi-front civil war threatening junta control', 'Humanitarian crisis — 18M+ in need', 'Global cyber scam hub in junta-controlled border zones', 'Regional refugee flows', 'Chinese influence over both junta and armed groups'],
  },
  {
    slug: 'sudan', name: 'Sudan', flag: '🇸🇩', region: 'Northeast Africa',
    capital: 'Khartoum (contested)', government: 'Conflict state — SAF vs RSF',
    population: '47M', threat_level: 'HIGH', cyber_threat: 'UNKNOWN',
    nato: false, us_sanctioned: false,
    active_conflicts: ['SAF vs RSF civil war (2023–present)'],
    apt_groups: [],
    summary: 'Sudan has been engulfed in civil war since April 2023, with the Sudanese Armed Forces and the Rapid Support Forces — a paramilitary force backed by UAE and connected to Russia\'s Wagner network — fighting for control of the country. The conflict has produced the world\'s largest internal displacement crisis, with over 10 million displaced. Darfur has seen mass atrocities.',
    key_concerns: ['World\'s largest displacement crisis', 'RSF atrocities in Darfur — genocide designation discussions', 'UAE-Russia proxy competition', 'Famine conditions in conflict zones', 'Regional spillover into Chad, Egypt, Ethiopia'],
  },

  // ── MEDIUM ───────────────────────────────────────────────────────────────────
  {
    slug: 'india', name: 'India', flag: '🇮🇳', region: 'South Asia',
    capital: 'New Delhi', government: 'Federal parliamentary republic',
    population: '1.4B', threat_level: 'MEDIUM', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: false,
    active_conflicts: ['LAC border standoff with China', 'Kashmir (ongoing low-level)'],
    apt_groups: ['SideWinder (assessed)'],
    summary: 'India is the world\'s most populous country and a rising major power navigating strategic autonomy between the U.S. and Russia. Member of the Quad alongside the U.S., Japan, and Australia. Maintains longstanding border disputes with both China and Pakistan, both nuclear-armed neighbors. India\'s "strategic autonomy" policy has complicated Western sanctions efforts against Russia.',
    key_concerns: ['LAC Sino-Indian border — persistent standoff', 'Nuclear competition with Pakistan and China', 'China\'s Belt and Road encirclement strategy', 'Balancing U.S. Quad membership with Russia arms dependency', 'Domestic sectarian tensions'],
  },
  {
    slug: 'turkey', name: 'Turkey', flag: '🇹🇷', region: 'Eastern Europe / Middle East',
    capital: 'Ankara', government: 'Presidential republic',
    population: '85M', threat_level: 'MEDIUM', cyber_threat: 'MEDIUM',
    nato: true, us_sanctioned: false,
    active_conflicts: ['Northern Syria operations', 'Kurdish PKK conflict', 'Libya (historical)'],
    apt_groups: [],
    summary: 'Turkey is a NATO member that has pursued an increasingly independent foreign policy under Erdoğan, including the purchase of Russian S-400 air defense systems (which led to F-35 program expulsion), mediation between Russia and Ukraine, and military operations in Syria against U.S.-backed Kurdish forces. Turkey controls the Turkish Straits — a critical chokepoint for Russian Black Sea naval access.',
    key_concerns: ['S-400 purchase complicating NATO interoperability', 'Turkish Straits as leverage in Russia-NATO dynamics', 'Syria operations against U.S.-allied Kurdish forces', 'Erdoğan\'s democratic backsliding', 'Migration leverage over EU'],
  },
  {
    slug: 'venezuela', name: 'Venezuela', flag: '🇻🇪', region: 'South America',
    capital: 'Caracas', government: 'Authoritarian presidential republic',
    population: '29M', threat_level: 'MEDIUM', cyber_threat: 'LOW',
    nato: false, us_sanctioned: true,
    active_conflicts: ['Guyana border dispute (Essequibo)', 'Internal political repression'],
    apt_groups: [],
    summary: 'Venezuela under Maduro has become a narco-state with close ties to Russia, China, Cuba, and Iran. A disputed 2024 election triggered international condemnation and renewed U.S. sanctions. Venezuela is advancing territorial claims over Guyana\'s Essequibo region — which holds major offshore oil reserves — raising regional conflict risk.',
    key_concerns: ['Essequibo territorial claim against Guyana — potential military dimension', 'Maduro regime survival and sanctioned economy', 'Russian and Chinese investment shielding regime', 'Major fentanyl and cocaine trafficking nexus', 'Regional destabilization from 7M+ emigrant diaspora'],
  },
  {
    slug: 'ethiopia', name: 'Ethiopia', flag: '🇪🇹', region: 'East Africa',
    capital: 'Addis Ababa', government: 'Federal parliamentary republic',
    population: '126M', threat_level: 'MEDIUM', cyber_threat: 'UNKNOWN',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Tigray aftermath (ceasefire, 2022)', 'Amhara conflict (2023–present)', 'Somali Region insurgency'],
    apt_groups: [],
    summary: 'Africa\'s second most populous country emerged from the devastating Tigray conflict (2020-2022, 300,000-500,000 deaths) only to face new internal conflicts in the Amhara region. Ethiopia is pursuing a Red Sea access deal that could reshape the Horn of Africa\'s geopolitics. Prime Minister Abiy Ahmed, a Nobel Peace Prize laureate, has overseen two major internal wars.',
    key_concerns: ['Multi-front internal conflict straining federal government', 'Humanitarian conditions in Amhara and Tigray', 'Red Sea access negotiations with Somaliland (Somalia dispute)', 'Nile water dispute with Egypt and Sudan', 'Drought and food insecurity'],
  },
  {
    slug: 'saudi-arabia', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East',
    capital: 'Riyadh', government: 'Absolute monarchy',
    population: '35M', threat_level: 'MEDIUM', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Yemen (proxy, reduced)', 'Houthi attacks on infrastructure'],
    apt_groups: [],
    summary: 'Saudi Arabia is the world\'s largest oil exporter and a central pillar of U.S. Middle East strategy, though the relationship has become more complicated under MBS. Riyadh has hedged between Washington and Beijing, signing a major oil deal with China, and engaged in surprise diplomacy with Iran via China\'s mediation in 2023. Saudi-U.S. defense treaty negotiations are ongoing.',
    key_concerns: ['Oil supply as geopolitical leverage', 'Iran nuclear threat — Saudi proliferation response', 'Houthi missile and drone attacks on oil infrastructure', 'U.S.-Saudi defense treaty negotiations', 'Vision 2030 labor and reform pressures'],
  },
  {
    slug: 'belarus', name: 'Belarus', flag: '🇧🇾', region: 'Eastern Europe',
    capital: 'Minsk', government: 'Authoritarian presidential republic',
    population: '9M', threat_level: 'MEDIUM', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: true,
    active_conflicts: ['Russian forces stationed on territory', 'Irregular migration weaponization vs EU/NATO'],
    apt_groups: ['Ghostwriter (disinformation)', 'UNC1151'],
    summary: 'Belarus functions as a Russian client state following Lukashenko\'s stolen 2020 election and Russian intervention to preserve his rule. Russian nuclear weapons are stationed in Belarus. Lukashenko allowed Russian forces to use Belarusian territory for the February 2022 Ukraine invasion. Belarus is actively weaponizing irregular migration against Poland, Lithuania, and Latvia.',
    key_concerns: ['Russian nuclear weapons on Belarusian territory', 'Migration weaponization against EU/NATO borders', 'Lukashenko regime stability and succession', 'Belarusian opposition in exile', 'Western flank vulnerability via Suwalki Gap'],
  },
  {
    slug: 'syria', name: 'Syria', flag: '🇸🇾', region: 'Middle East',
    capital: 'Damascus', government: 'Transitional government (post-Assad, 2024)',
    population: '22M', threat_level: 'MEDIUM', cyber_threat: 'LOW',
    nato: false, us_sanctioned: true,
    active_conflicts: ['Post-Assad stabilization (2024–present)', 'ISIS remnants', 'Turkish operations vs. Kurds', 'Israeli strikes on weapons infrastructure'],
    apt_groups: [],
    summary: 'The Assad regime collapsed in December 2024 after a rapid rebel offensive led by HTS (Hayat Tahrir al-Sham). Syria is in an uncertain post-war transition with multiple armed factions, ongoing Israeli strikes on weapons stocks, Turkish operations against Kurdish groups, and ISIS attempting to exploit the vacuum. The stabilization trajectory is deeply uncertain.',
    key_concerns: ['HTS governance capacity and extremism questions', 'ISIS resurgence in eastern Syria', 'Turkish-Kurdish tensions in northern Syria', 'Israeli strikes on chemical/missile weapons stocks', '13M displaced — return conditions unclear'],
  },
  {
    slug: 'afghanistan', name: 'Afghanistan', flag: '🇦🇫', region: 'South Asia',
    capital: 'Kabul', government: 'Taliban Emirate',
    population: '42M', threat_level: 'MEDIUM', cyber_threat: 'UNKNOWN',
    nato: false, us_sanctioned: true,
    active_conflicts: ['NRF resistance (minimal)', 'ISIS-K insurgency vs Taliban'],
    apt_groups: [],
    summary: 'The Taliban govern Afghanistan following the August 2021 U.S. withdrawal. The country faces a severe humanitarian crisis with 28+ million in acute food insecurity. Women have been systematically erased from public life. ISIS-Khorasan (ISIS-K) conducts regular attacks on Taliban targets and has demonstrated global reach with the 2024 Moscow concert hall attack.',
    key_concerns: ['ISIS-K global terrorism capability', 'Humanitarian catastrophe — worst in the world', 'Taliban al-Qaeda relationship and counterterrorism assurances', 'Pakistan border — TTP cross-border attacks', 'Complete erasure of women from public life'],
  },
  {
    slug: 'taiwan', name: 'Taiwan', flag: '🇹🇼', region: 'East Asia',
    capital: 'Taipei', government: 'Presidential democracy',
    population: '23M', threat_level: 'HIGH', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: false,
    active_conflicts: ['PRC military pressure (ongoing)', 'PLA exercises and incursions'],
    apt_groups: [],
    summary: 'Taiwan produces over 90% of the world\'s most advanced semiconductors and sits at the center of U.S.-China strategic competition. Chinese military pressure has intensified — including unprecedented PLA exercises surrounding the island. The Taiwan Relations Act obliges the U.S. to provide Taiwan with defensive arms, and U.S. officials have moved toward more explicit defense commitment language.',
    key_concerns: ['PLA military capability window — late 2020s peak', 'TSMC semiconductor concentration risk', 'U.S. defense commitment ambiguity', 'Volt Typhoon pre-positioning for Taiwan contingency', 'Cross-strait economic interdependence as complicating factor'],
  },
  {
    slug: 'mexico', name: 'Mexico', flag: '🇲🇽', region: 'North America',
    capital: 'Mexico City', government: 'Federal presidential republic',
    population: '127M', threat_level: 'MEDIUM', cyber_threat: 'LOW',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Cartel wars (ongoing)', 'Fentanyl supply chain conflict'],
    apt_groups: [],
    summary: 'Mexico is the primary transit and production country for fentanyl entering the United States — a supply chain that kills 70,000+ Americans annually. The Sinaloa Cartel and CJNG have achieved quasi-territorial control in large parts of Mexico, corrupting law enforcement and government institutions at scale. U.S.-Mexico security cooperation has become increasingly contentious.',
    key_concerns: ['Fentanyl supply chain — primary source of American overdose deaths', 'Cartel territorial control and government corruption', 'U.S.-Mexico security cooperation deterioration', 'Chinese precursor chemical supply to cartels', 'CJNG expansion and potential transnational terrorism designation'],
  },
  {
    slug: 'nigeria', name: 'Nigeria', flag: '🇳🇬', region: 'West Africa',
    capital: 'Abuja', government: 'Federal presidential republic',
    population: '220M', threat_level: 'MEDIUM', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Boko Haram / ISWAP insurgency (Northeast)', 'Banditry (Northwest)', 'Separatist tensions (Southeast)'],
    apt_groups: [],
    summary: 'Nigeria — Africa\'s most populous country and largest economy — faces simultaneous insurgencies in the northeast (ISWAP/Boko Haram), massive banditry and kidnapping in the northwest, and persistent Biafra separatist pressure in the southeast. Nigeria is also a major source of cybercrime (BEC fraud) affecting businesses globally.',
    key_concerns: ['ISWAP territorial control in Lake Chad Basin', 'Northwest banditry — millions displaced', 'Economic fragility undermining state capacity', 'BEC cybercrime affecting global businesses', 'Oil theft from Delta pipelines'],
  },
  {
    slug: 'cuba', name: 'Cuba', flag: '🇨🇺', region: 'Caribbean',
    capital: 'Havana', government: 'Single-party socialist republic',
    population: '11M', threat_level: 'MEDIUM', cyber_threat: 'MEDIUM',
    nato: false, us_sanctioned: true,
    active_conflicts: [],
    apt_groups: [],
    summary: 'Cuba hosts Russian intelligence facilities that monitor U.S. electronic communications, making it strategically significant beyond its size. Economic conditions have deteriorated severely — triggering mass emigration and rare public protests. Cuba maintains close relations with Russia, China, Iran, and Venezuela.',
    key_concerns: ['Russian SIGINT facility at Lourdes monitoring U.S. communications', 'Havana Syndrome — U.S. diplomat attacks attributed to directed energy', 'Mass emigration destabilizing regional migration patterns', 'Russia-Cuba-Venezuela-Iran alignment', 'Economic collapse and domestic instability'],
  },
  {
    slug: 'somalia', name: 'Somalia', flag: '🇸🇴', region: 'East Africa',
    capital: 'Mogadishu', government: 'Federal parliamentary republic',
    population: '17M', threat_level: 'MEDIUM', cyber_threat: 'UNKNOWN',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Al-Shabaab insurgency (ongoing)', 'Somaliland-Ethiopia-Somalia tension'],
    apt_groups: [],
    summary: 'Al-Shabaab controls significant territory in southern Somalia and continues conducting mass-casualty attacks, including in Mogadishu. The group remains affiliated with al-Qaeda and has demonstrated regional ambitions in Kenya and Uganda. The Ethiopia-Somaliland port access deal has generated a major diplomatic crisis with Somalia, creating new regional fault lines.',
    key_concerns: ['Al-Shabaab territorial control and mass-casualty attacks', 'Ethiopia-Somaliland access deal — Somalia response', 'Piracy risk in Gulf of Aden', 'Climate-driven displacement and famine risk', 'AMISOM successor mission sustainability'],
  },
  {
    slug: 'serbia', name: 'Serbia', flag: '🇷🇸', region: 'Balkans',
    capital: 'Belgrade', government: 'Parliamentary republic',
    population: '7M', threat_level: 'MEDIUM', cyber_threat: 'LOW',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Kosovo (status dispute — unresolved)'],
    apt_groups: [],
    summary: 'Serbia is the primary vector for Russian influence in the Western Balkans, maintaining close ties to Moscow while pursuing EU accession. The Serbia-Kosovo dispute remains unresolved and periodically escalates — particularly in the Serb-majority north of Kosovo. Belgrade has refused to sanction Russia over Ukraine despite EU pressure.',
    key_concerns: ['Kosovo status — periodic north Kosovo escalations', 'Serbian-Russian security and energy ties', 'EU accession leverage vs. Russia relationship', 'Wagner presence in Serbia (reported)', 'Serb Republic (Bosnia) destabilization by Dodik'],
  },

  // ── LOW ────────────────────────────────────────────────────────────────────
  {
    slug: 'united-states', name: 'United States', flag: '🇺🇸', region: 'North America',
    capital: 'Washington D.C.', government: 'Federal presidential constitutional republic',
    population: '335M', threat_level: 'LOW', cyber_threat: 'LOW',
    nato: true, us_sanctioned: false,
    active_conflicts: ['Strikes on Houthi targets (Yemen)', 'Counterterrorism operations (Africa, Middle East)'],
    apt_groups: [],
    summary: 'The United States remains the world\'s preeminent military and economic power but faces growing strategic competition from China and Russia simultaneously — a challenge without Cold War precedent. Domestically, political polarization, institutional stress, and federal spending debates complicate sustained strategic commitments. The U.S. is simultaneously managing the Iran conflict, supporting Ukraine, deterring China, and countering fentanyl.',
    key_concerns: ['Two-peer nuclear competitor environment (Russia + China)', 'Volt Typhoon and Salt Typhoon critical infrastructure penetration', 'Fentanyl crisis killing 70,000+ annually', 'Federal Reserve independence under political pressure', 'Defense industrial base production capacity gaps'],
  },
  {
    slug: 'united-kingdom', name: 'United Kingdom', flag: '🇬🇧', region: 'Western Europe',
    capital: 'London', government: 'Constitutional monarchy / parliamentary democracy',
    population: '68M', threat_level: 'LOW', cyber_threat: 'LOW',
    nato: true, us_sanctioned: false,
    active_conflicts: [],
    apt_groups: [],
    summary: 'The UK is a Five Eyes partner and one of the most capable intelligence and security actors in the world. GCHQ and MI6 operate as near-peers with U.S. counterparts. Post-Brexit, the UK has maintained strong security relationships with NATO allies while navigating trade complications. The UK is a leading supporter of Ukraine and has supplied Storm Shadow cruise missiles.',
    key_concerns: ['Post-Brexit trade relationship complications', 'Russian disinformation and interference operations', 'Chinese espionage targeting UK universities and tech firms', 'AUKUS submarine obligations and industrial capacity', 'Defense spending meeting 2.5% NATO commitment'],
  },
  {
    slug: 'france', name: 'France', flag: '🇫🇷', region: 'Western Europe',
    capital: 'Paris', government: 'Semi-presidential republic',
    population: '68M', threat_level: 'LOW', cyber_threat: 'LOW',
    nato: true, us_sanctioned: false,
    active_conflicts: ['Sahel (withdrawal from Mali/Niger)', 'Nuclear deterrent patrols'],
    apt_groups: [],
    summary: 'France is NATO\'s only European nuclear power and has taken a leading role in European strategic autonomy discussions. French forces were expelled from Mali and Niger following coups — a major setback for France\'s Sahel counterterrorism strategy. Macron has been the most vocal European advocate for European strategic independence from U.S. security guarantees.',
    key_concerns: ['Sahel withdrawal and Russian/Wagner takeover', 'Domestic far-right political trajectory', 'European strategic autonomy vs. transatlantic commitment', 'French nuclear deterrent credibility', 'Russian disinformation targeting French elections'],
  },
  {
    slug: 'germany', name: 'Germany', flag: '🇩🇪', region: 'Western Europe',
    capital: 'Berlin', government: 'Federal parliamentary republic',
    population: '84M', threat_level: 'LOW', cyber_threat: 'LOW',
    nato: true, us_sanctioned: false,
    active_conflicts: [],
    apt_groups: [],
    summary: 'Germany announced a generational shift in defense policy with its €100 billion Sondervermögen special defense fund following Russia\'s 2022 invasion — ending decades of post-war military restraint. Germany is the largest European economy and a central node in NATO\'s eastern flank logistics. The far-right AfD\'s rise complicates German foreign policy coherence.',
    key_concerns: ['Defense spending ramp-up — industrial base capacity', 'AfD rise and Russia-sympathetic political currents', 'Energy security post-Nordstream', 'APT28 and APT29 targeting of German government networks', 'Economic competitiveness vs. China'],
  },
  {
    slug: 'japan', name: 'Japan', flag: '🇯🇵', region: 'East Asia',
    capital: 'Tokyo', government: 'Constitutional monarchy / parliamentary democracy',
    population: '124M', threat_level: 'LOW', cyber_threat: 'LOW',
    nato: false, us_sanctioned: false,
    active_conflicts: [],
    apt_groups: [],
    summary: 'Japan has undergone the most significant defense policy shift since World War II, doubling defense spending to 2% of GDP and acquiring counterstrike capabilities for the first time. Japan is a key node in the U.S. Pacific alliance system and plays a critical role in any Taiwan contingency. AUKUS\'s Pillar II technology sharing includes Japan.',
    key_concerns: ['Taiwan contingency — U.S.-Japan alliance obligations', 'North Korean ballistic missile launches over Japanese territory', 'China\'s South and East China Sea activities', 'Japanese defense industrial base development', 'Semiconductor supply chain dependencies'],
  },
  {
    slug: 'south-korea', name: 'South Korea', flag: '🇰🇷', region: 'East Asia',
    capital: 'Seoul', government: 'Presidential democracy',
    population: '52M', threat_level: 'LOW', cyber_threat: 'LOW',
    nato: false, us_sanctioned: false,
    active_conflicts: ['Korean Peninsula armistice (1953)', 'North Korean provocations'],
    apt_groups: [],
    summary: 'South Korea faces a permanently hostile nuclear-armed state 35 miles from its capital. Following North Korea\'s DPRK-Russia military alignment, South Korea reversed its arms export policy, providing artillery ammunition to Ukraine. Growing domestic debate about whether South Korea should develop its own nuclear deterrent — a discussion that has gained mainstream traction.',
    key_concerns: ['North Korean ICBM and tactical nuclear capability', 'Nuclear debate — indigenous deterrent discussion', 'DPRK-Russia arms transfer implications', 'U.S. extended deterrence credibility', 'ScarCruft and Kimsuky targeting of Korean policy networks'],
  },
  {
    slug: 'australia', name: 'Australia', flag: '🇦🇺', region: 'Oceania',
    capital: 'Canberra', government: 'Federal parliamentary constitutional monarchy',
    population: '26M', threat_level: 'LOW', cyber_threat: 'LOW',
    nato: false, us_sanctioned: false,
    active_conflicts: [],
    apt_groups: [],
    summary: 'Australia is a Five Eyes partner and the centerpiece of the AUKUS agreement — which will provide Australia with nuclear-powered submarines and advanced defense technology. Australia faces significant Chinese economic coercion following political friction over COVID-19 origins investigation calls and Huawei 5G exclusion. Chinese cyber operations against Australian government and universities are extensive.',
    key_concerns: ['AUKUS submarine construction timeline and industrial capacity', 'Chinese cyber operations — ASD attribution of sustained campaigns', 'Chinese economic coercion (trade barriers)', 'Pacific island influence competition with China', 'Critical mineral supply chain development'],
  },
];

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find(c => c.slug === slug);
}

export function getCountriesByRegion(region: string): Country[] {
  return COUNTRIES.filter(c => c.region === region);
}

export function getCountriesByThreat(level: ThreatLevel): Country[] {
  return COUNTRIES.filter(c => c.threat_level === level);
}

export const THREAT_ORDER: Record<ThreatLevel, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
