'use client';
import { useState, useMemo } from 'react';

type Nation = 'All' | 'China' | 'Russia' | 'Iran' | 'DPRK' | 'Criminal' | 'Other';

interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  nation: Exclude<Nation, 'All'>;
  sponsor: string;
  active: string;
  targets: string[];
  description: string;
  notable: string;
  mitre: string;
}

const NATION_COLORS: Record<string, string> = {
  China: '#ff4444',
  Russia: '#1e9eff',
  Iran: '#00cc66',
  DPRK: '#ff8800',
  Criminal: '#b464ff',
  Other: '#7a9bb5',
};

const ACTORS: ThreatActor[] = [
  // ── CHINA ──────────────────────────────────────────────────────────────────
  {
    id: 'G0006', name: 'APT1',
    aliases: ['Comment Crew', 'Comment Group', 'Comment Panda', 'TG-8223'],
    nation: 'China', sponsor: 'PLA Unit 61398', active: '2006–2013',
    targets: ['Aerospace', 'Defense', 'Energy', 'Manufacturing', 'Telecommunications'],
    description: 'One of the most prolific Chinese espionage units, APT1 operated from Shanghai conducting large-scale IP theft from Western companies. Publicly exposed by Mandiant in 2013, after which the group went dark. Stole terabytes of data from 141 organizations across 20 industries over seven years.',
    notable: 'Mandiant APT1 report 2013 publicly attributed group to PLA Unit 61398; stole data from 141 organizations; forced dormancy after exposure.',
    mitre: 'G0006',
  },
  {
    id: 'G0045', name: 'APT10',
    aliases: ['Stone Panda', 'menuPass', 'Cloud Hopper', 'POTASSIUM', 'Red Apollo'],
    nation: 'China', sponsor: 'MSS Tianjin Bureau', active: '2009–present',
    targets: ['Managed Service Providers', 'Healthcare', 'Defense', 'Government', 'Aviation'],
    description: 'APT10 pioneered the MSP supply chain attack model — compromising managed service providers to reach downstream customers across 45+ countries simultaneously. Tied to the MSS Tianjin State Security Bureau. Two members indicted by DOJ in 2018.',
    notable: 'Operation Cloud Hopper — simultaneous MSP compromise across US, Europe, Asia; DOJ indictment 2018.',
    mitre: 'G0045',
  },
  {
    id: 'G0065', name: 'APT40',
    aliases: ['BRONZE MOHAWK', 'TEMP.Periscope', 'Leviathan', 'GADOLINIUM', 'Kryptonite Panda'],
    nation: 'China', sponsor: 'MSS Hainan Province', active: '2013–present',
    targets: ['Maritime', 'Naval Defense', 'Aviation', 'Research', 'Government'],
    description: 'APT40 focuses on maritime and naval defense industries consistent with Chinese naval expansion goals. Linked to a front company in Hainan Province. Frequently exploits newly disclosed vulnerabilities within days of public disclosure — faster than most organizations can patch.',
    notable: 'DOJ indictment 2021 linked to Hainan Xiandun Technology; COVID-19 vaccine research targeting; rapid zero-day exploitation.',
    mitre: 'G0065',
  },
  {
    id: 'G0096', name: 'APT41',
    aliases: ['Double Dragon', 'Winnti', 'Barium', 'Wicked Panda', 'TG-2633'],
    nation: 'China', sponsor: 'MSS (dual espionage / criminal)', active: '2012–present',
    targets: ['Healthcare', 'Technology', 'Telecommunications', 'Gaming', 'Government'],
    description: 'Unique among Chinese APTs for conducting both state-sponsored espionage and financially motivated cybercrime. APT41 members deployed ransomware and stole gaming currency while simultaneously conducting IP theft for the Chinese government. DOJ indicted five members in 2020.',
    notable: 'Software supply chain compromise of multiple vendors; Citrix/Cisco/Zoho zero-day mass exploitation; DOJ 5-count indictment 2020.',
    mitre: 'G0096',
  },
  {
    id: 'G1017', name: 'Volt Typhoon',
    aliases: ['Bronze Silhouette', 'Vanguard Panda', 'Dev-0391', 'UNC3236'],
    nation: 'China', sponsor: 'PLA / MSS (assessed)', active: '2021–present',
    targets: ['Electric Grid', 'Water', 'Communications', 'Transportation', 'Military Logistics'],
    description: 'Volt Typhoon does not steal data — it pre-positions for disruption. Using "living off the land" techniques to avoid custom malware signatures, the group has embedded persistent access inside U.S. critical infrastructure. FBI, NSA, and CISA confirmed long-term infiltration of power, water, and communications systems including Guam — a key logistics hub for any Pacific conflict.',
    notable: 'FBI/NSA/CISA joint advisory 2023; confirmed access to U.S. power, water, communications infrastructure; Guam specifically targeted as Taiwan contingency pre-positioning.',
    mitre: 'G1017',
  },
  {
    id: 'G1045', name: 'Salt Typhoon',
    aliases: ['Ghost Emperor', 'FamousSparrow', 'Earth Estries'],
    nation: 'China', sponsor: 'MSS (assessed)', active: '2019–present',
    targets: ['Telecommunications', 'ISPs', 'Lawful Intercept Systems', 'Government'],
    description: 'Salt Typhoon penetrated major U.S. telecommunications carriers, gaining access to lawful intercept systems — infrastructure designed for law enforcement wiretapping. The breach exposed communications of senior U.S. officials and gave Chinese intelligence access to the government\'s own surveillance apparatus.',
    notable: 'AT&T, Verizon, Lumen lawful intercept systems compromised 2024; call records of senior government and political figures accessed.',
    mitre: '',
  },
  {
    id: 'G0125', name: 'HAFNIUM',
    aliases: ['Operation Exchange Marauder'],
    nation: 'China', sponsor: 'MSS (assessed)', active: '2021',
    targets: ['Law Firms', 'Defense Contractors', 'Think Tanks', 'NGOs', 'Research'],
    description: 'HAFNIUM exploited four zero-day vulnerabilities in Microsoft Exchange Server, compromising an estimated 250,000 servers worldwide within days. Operations targeted organizations with foreign policy, defense, and infectious disease research interests.',
    notable: 'ProxyLogon/ProxyShell Exchange zero-days; 250,000+ servers compromised globally; followed by mass exploitation by multiple threat actors.',
    mitre: 'G0125',
  },
  {
    id: 'G0128', name: 'APT31',
    aliases: ['Zirconium', 'Judgment Panda', 'BRONZE VINEWOOD', 'Hurricane Panda'],
    nation: 'China', sponsor: 'MSS Hubei', active: '2010–present',
    targets: ['Government', 'Political Campaigns', 'Journalists', 'Human Rights', 'Elections'],
    description: 'APT31 focuses on political intelligence — targeting elected officials, campaign staff, journalists, and dissidents. Operated through a front company in Wuhan. DOJ unsealed a 7-count indictment in March 2024 coordinated with UK attribution, naming specific MSS officers.',
    notable: 'Targeted 2020 U.S. presidential campaigns; DOJ 7-count indictment March 2024; UK NCSC coordinated attribution.',
    mitre: 'G0128',
  },

  // ── RUSSIA ─────────────────────────────────────────────────────────────────
  {
    id: 'G0007', name: 'APT28',
    aliases: ['Fancy Bear', 'Sofacy', 'STRONTIUM', 'Sednit', 'Forest Blizzard', 'Pawn Storm', 'Tsar Team'],
    nation: 'Russia', sponsor: 'GRU Unit 26165', active: '2004–present',
    targets: ['Government', 'Military', 'Defense', 'Elections', 'NATO', 'Media'],
    description: 'Russia\'s most aggressive cyber espionage unit, operated by GRU military intelligence. Focuses on political and military targets across NATO states. Responsible for high-profile election interference and critical infrastructure probing. Among the most prolific and technically capable nation-state actors globally.',
    notable: 'DNC hack 2016; German Bundestag breach 2015; Macron campaign 2017; Olympic Destroyer 2018; MH17 investigator targeting; WADA breach.',
    mitre: 'G0007',
  },
  {
    id: 'G0016', name: 'APT29',
    aliases: ['Cozy Bear', 'The Dukes', 'Midnight Blizzard', 'Nobelium', 'Dark Halo', 'UNC2452'],
    nation: 'Russia', sponsor: 'SVR (Foreign Intelligence Service)', active: '2008–present',
    targets: ['Government', 'Think Tanks', 'Healthcare', 'Technology', 'Political Organizations'],
    description: 'Russia\'s premier foreign intelligence cyber unit. Characterized by extreme patience, sophistication, and preference for long-term stealthy access over noisy disruption. Responsible for the SolarWinds supply chain compromise — one of the most sophisticated intrusion operations ever uncovered — and ongoing targeting of Western government networks.',
    notable: 'SolarWinds Orion supply chain compromise 2020; DNC breach 2016; Microsoft corporate email breach 2023–2024; COVID vaccine research targeting.',
    mitre: 'G0016',
  },
  {
    id: 'G0034', name: 'Sandworm',
    aliases: ['Voodoo Bear', 'IRIDIUM', 'Seashell Blizzard', 'TeleBots', 'BlackEnergy Group'],
    nation: 'Russia', sponsor: 'GRU Unit 74455', active: '2009–present',
    targets: ['Critical Infrastructure', 'Energy', 'Elections', 'Ukraine', 'Media', 'NATO'],
    description: 'The most destructive cyber unit in recorded history. Sandworm is responsible for the only confirmed attacks to cause civilian power outages, and for NotPetya — the costliest cyberattack ever executed. Operates in direct support of Russian military objectives, primarily against Ukraine and Western infrastructure.',
    notable: 'Ukrainian power grid attacks 2015–2016; NotPetya 2017 ($10B+ global damage); Olympic Destroyer 2018; Viasat satellite attack Feb 2022; ongoing Ukrainian infrastructure destruction.',
    mitre: 'G0034',
  },
  {
    id: 'G0010', name: 'Turla',
    aliases: ['Snake', 'Uroburos', 'Venomous Bear', 'Waterbug', 'KRYPTON', 'Iron Hunter'],
    nation: 'Russia', sponsor: 'FSB Center 16', active: '1996–present',
    targets: ['Government', 'Military', 'Diplomatic', 'Defense Contractors', 'Energy'],
    description: 'Among the oldest and most sophisticated APT groups in operation, Turla has conducted espionage for nearly three decades. Known for creative tradecraft including hijacking other threat actors\' C2 infrastructure and routing communications through satellite links to obscure origins.',
    notable: 'Moonlight Maze 1996; Agent.BTZ Pentagon breach 2008; hijacking Iranian APT infrastructure 2019; sustained targeting of European foreign ministries.',
    mitre: 'G0010',
  },
  {
    id: 'G0047', name: 'Gamaredon',
    aliases: ['Primitive Bear', 'Armageddon', 'Trident Ursa', 'Shuckworm', 'ACTINIUM'],
    nation: 'Russia', sponsor: 'FSB Crimea (SCSSB)', active: '2013–present',
    targets: ['Ukrainian Government', 'Ukrainian Military', 'NGOs', 'Law Enforcement'],
    description: 'The highest-volume threat actor targeting Ukraine, conducting thousands of intrusion attempts monthly against Ukrainian government and military networks. Less technically sophisticated than other Russian APTs but extraordinarily prolific. Believed to operate from Crimea under FSB direction.',
    notable: 'Sustained targeting of Ukrainian government since 2014 annexation; majority of Ukraine-targeted Russian intrusions by volume; USB worm deployment.',
    mitre: 'G0047',
  },
  {
    id: 'G0119', name: 'Evil Corp',
    aliases: ['Indrik Spider', 'Dridex Gang', 'GOLD DRAKE', 'Manatee Tempest'],
    nation: 'Russia', sponsor: 'Criminal / FSB-linked', active: '2007–present',
    targets: ['Financial Institutions', 'Healthcare', 'Government', 'Insurance'],
    description: 'Evil Corp began as a criminal organization conducting bank fraud and evolved into a major ransomware operator with alleged FSB ties. Leader Maksim Yakubets was indicted by DOJ in 2019 with a $5M bounty — the largest ever for a cybercriminal. OFAC sanctions complicate ransom payment for victims.',
    notable: 'Dridex banking trojan; WastedLocker and BitPaymer ransomware; DOJ indictment and $5M bounty 2019; OFAC sanctions.',
    mitre: 'G0119',
  },

  // ── IRAN ───────────────────────────────────────────────────────────────────
  {
    id: 'G0064', name: 'APT33',
    aliases: ['Elfin', 'Refined Kitten', 'Holmium', 'Peach Sandstorm', 'MAGNALLIUM'],
    nation: 'Iran', sponsor: 'IRGC-linked', active: '2013–present',
    targets: ['Aerospace', 'Petrochemical', 'Energy', 'Defense', 'Aviation'],
    description: 'APT33 targets aerospace, aviation, and energy sectors with particular focus on Saudi Arabia and the United States. Assessed to have developed destructive malware capabilities and be capable of attacks on industrial control systems. Conducts extensive credential harvesting against aerospace supply chains.',
    notable: 'Shamoon variant development; Saudi petrochemical targeting; extensive aerospace credential harvesting operations.',
    mitre: 'G0064',
  },
  {
    id: 'G0049', name: 'APT34',
    aliases: ['OilRig', 'Helix Kitten', 'Crambus', 'COBALT GYPSY', 'Hazel Sandstorm'],
    nation: 'Iran', sponsor: 'MOIS (Ministry of Intelligence)', active: '2014–present',
    targets: ['Financial', 'Energy', 'Telecommunications', 'Government', 'Middle East'],
    description: 'APT34 conducts long-term cyber espionage against financial and energy sector targets across the Middle East, focusing on Gulf state governments and companies. Known for patient, methodical operations and custom malware development. Toolkit was leaked on Telegram in 2019 by a disgruntled insider.',
    notable: 'Middle Eastern bank and government targeting; toolkit public leak 2019; DNSpionage and TONEDEAF implants; sustained Gulf operations.',
    mitre: 'G0049',
  },
  {
    id: 'G0059', name: 'APT35',
    aliases: ['Charming Kitten', 'Phosphorus', 'Mint Sandstorm', 'Ajax Security Team', 'COBALT ILLUSION'],
    nation: 'Iran', sponsor: 'IRGC', active: '2014–present',
    targets: ['Journalists', 'Academics', 'Human Rights', 'Dissidents', 'Nuclear Experts', 'Political Campaigns'],
    description: 'Iran\'s premier social engineering unit, conducting targeted phishing and credential theft against journalists, academics, and political figures. Known for elaborate false persona operations — building sustained trust with targets over weeks before deploying malware. Has attempted to support physical operations against Iranian dissidents abroad.',
    notable: 'U.S. presidential campaign targeting 2019–2020; nuclear scientist spear-phishing; dissident targeting in support of physical operations.',
    mitre: 'G0059',
  },
  {
    id: 'G0069', name: 'MuddyWater',
    aliases: ['MERCURY', 'Static Kitten', 'Seedworm', 'TEMP.Zagros', 'Earth Vetala'],
    nation: 'Iran', sponsor: 'MOIS', active: '2017–present',
    targets: ['Government', 'Telecommunications', 'Defense', 'Middle East', 'Central Asia'],
    description: 'A subordinate MOIS unit conducting espionage across the Middle East, Central Asia, and Africa. Uses commodity and open-source tools alongside custom malware, targeting government and telecommunications organizations in countries of strategic interest to Iran. US CYBERCOM publicly attributed in 2022.',
    notable: 'US CYBERCOM attribution 2022; Turkish government network targeting; Israeli entity operations; widespread use of SimpleHelp and ScreenConnect.',
    mitre: 'G0069',
  },
  {
    id: 'G1011', name: 'Agrius',
    aliases: ['Pink Sandstorm', 'AMERICIUM', 'DEV-0227'],
    nation: 'Iran', sponsor: 'MOIS (assessed)', active: '2020–present',
    targets: ['Israel', 'Diamond Industry', 'HR Firms', 'Insurance', 'Transportation'],
    description: 'Agrius specializes in destructive wiper attacks disguised as ransomware — the actual goal is data destruction rather than extortion, making payments pointless. Primarily targets Israeli entities and diamond industry supply chains with DEADWOOD, APOSTLE, and Fantasy wipers.',
    notable: 'Fantasy wiper attack against diamond industry 2022; APOSTLE ransomware/wiper hybrid; Israeli transportation sector targeting.',
    mitre: 'G1011',
  },

  // ── DPRK ───────────────────────────────────────────────────────────────────
  {
    id: 'G0032', name: 'Lazarus Group',
    aliases: ['Hidden Cobra', 'Guardians of Peace', 'Zinc', 'Diamond Sleet', 'NICKEL ACADEMY', 'Bureau 121'],
    nation: 'DPRK', sponsor: 'RGB Bureau 121', active: '2009–present',
    targets: ['Financial Institutions', 'Cryptocurrency', 'Defense', 'Media', 'Healthcare', 'Aerospace'],
    description: 'The most sophisticated and financially destructive North Korean threat actor. Operates on behalf of the RGB to generate hard currency for the Kim regime through large-scale financial and cryptocurrency theft, and conducts destructive operations against perceived adversaries. Responsible for billions in stolen cryptocurrency and the most damaging ransomware attack in history.',
    notable: 'Sony Pictures hack 2014; Bangladesh Bank SWIFT heist $81M 2016; WannaCry ransomware 2017; Axie Infinity/Ronin bridge $620M 2022; ongoing crypto exchange targeting.',
    mitre: 'G0032',
  },
  {
    id: 'G0082', name: 'APT38',
    aliases: ['Stardust Chollima', 'CoperNickel', 'NICKEL GLADSTONE', 'BeagleBoyz'],
    nation: 'DPRK', sponsor: 'RGB', active: '2014–present',
    targets: ['Financial Institutions', 'SWIFT Network', 'Central Banks', 'ATMs'],
    description: 'A Lazarus Group subset specializing in large-scale financial theft targeting the SWIFT interbank messaging system. Responsible for the most audacious bank heists in history, targeting institutions across Asia, Africa, and Latin America with inadequate SWIFT security controls.',
    notable: 'Bangladesh Bank SWIFT heist 2016 ($81M recovered); attempted FAO SWIFT frauds; multiple central bank intrusions globally.',
    mitre: 'G0082',
  },
  {
    id: 'G0094', name: 'Kimsuky',
    aliases: ['Velvet Chollima', 'Thallium', 'Black Banshee', 'STOLEN PENCIL', 'Springtail'],
    nation: 'DPRK', sponsor: 'RGB Unit 586', active: '2012–present',
    targets: ['Think Tanks', 'Government', 'Academia', 'Korea Policy Experts', 'Journalists'],
    description: 'Kimsuky conducts intelligence collection against Korean Peninsula policy experts, academics, and officials — building the regime\'s picture of international thinking on North Korea. Known for browser extension malware harvesting Gmail content and sustained targeting of UN officials.',
    notable: 'UN Security Council member targeting; browser extension malware harvesting Gmail/AOL; Korea policy researcher long-term infiltration.',
    mitre: 'G0094',
  },
  {
    id: 'G0138', name: 'Andariel',
    aliases: ['Silent Chollima', 'Stonefly', 'Onyx Sleet', 'PLUTONIUM'],
    nation: 'DPRK', sponsor: 'RGB', active: '2015–present',
    targets: ['Defense', 'Healthcare', 'Manufacturing', 'Finance'],
    description: 'Andariel conducts both espionage and financially motivated operations, including ransomware to fund regime activities. Has targeted defense contractors for weapons-related technical intelligence and healthcare organizations for ransomware proceeds used to fund weapons programs.',
    notable: 'Ransomware attacks on U.S. healthcare; defense contractor targeting for missile/submarine technical data; ATM cash-out schemes.',
    mitre: 'G0138',
  },
  {
    id: 'G0067', name: 'ScarCruft',
    aliases: ['APT37', 'Reaper', 'RedEyes', 'Ricochet Chollima', 'InkySquid'],
    nation: 'DPRK', sponsor: 'MSS North Korea', active: '2012–present',
    targets: ['South Korean Government', 'North Korean Defectors', 'Human Rights Organizations', 'Journalists'],
    description: 'ScarCruft focuses almost exclusively on North Korea-related targets — defector communities, human rights organizations, and South Korean officials. Uses zero-days and advanced mobile malware against targets the regime views as threats to its legitimacy.',
    notable: 'Internet Explorer zero-day exploitation; Android/iOS spyware targeting defectors; deployment of Russian-developed BlueLight backdoor.',
    mitre: 'G0067',
  },

  // ── CRIMINAL ───────────────────────────────────────────────────────────────
  {
    id: 'G0115', name: 'REvil',
    aliases: ['Sodinokibi', 'GOLD SOUTHFIELD', 'Pinchy Spider'],
    nation: 'Criminal', sponsor: 'Russia-based RaaS', active: '2019–2022',
    targets: ['Law Firms', 'Manufacturing', 'Agriculture', 'IT Supply Chain', 'Healthcare'],
    description: 'REvil operated as ransomware-as-a-service, leasing ransomware to affiliates for a percentage of ransoms. Responsible for some of the largest ransomware attacks ever executed before members were arrested under Russian authority following U.S. diplomatic pressure after the Kaseya attack.',
    notable: 'Kaseya VSA supply chain attack 2021 ($70M demand); JBS Foods $11M ransom; law firm celebrity data exfiltration; members arrested by Russia 2022.',
    mitre: 'G0115',
  },
  {
    id: 'G0102', name: 'Wizard Spider',
    aliases: ['GOLD BLACKBURN', 'UNC1878', 'Conti Group', 'TrickBot Gang'],
    nation: 'Criminal', sponsor: 'Russia-based', active: '2016–2022',
    targets: ['Healthcare', 'Government', 'Financial', 'Critical Infrastructure'],
    description: 'Wizard Spider operated TrickBot — a major malware-as-a-service platform — and the Conti ransomware operation. At its peak Conti employed 100+ staff operating like a legitimate corporation. Targeted hospitals during COVID-19 and forced a national emergency declaration after attacking Costa Rica\'s government.',
    notable: 'Conti ransomware; TrickBot banking trojan; Costa Rica national emergency 2022; healthcare targeting during COVID-19; Conti leaks exposed internal operations.',
    mitre: 'G0102',
  },
  {
    id: 'G1004', name: 'LockBit',
    aliases: ['GOLD MYSTIC', 'LockBit 3.0', 'LockBit Black'],
    nation: 'Criminal', sponsor: 'Russia-based RaaS', active: '2019–present',
    targets: ['Healthcare', 'Government', 'Manufacturing', 'Legal', 'Education'],
    description: 'LockBit became the world\'s most prolific ransomware operation, accounting for the largest share of global ransomware attacks from 2022–2024. Law enforcement Operation Cronos in February 2024 seized infrastructure and arrested affiliates — but variants continue to operate under the LockBit brand.',
    notable: 'Most prolific ransomware globally 2022–2024; Royal Mail, ION Trading, Fulton County breaches; Operation Cronos disruption 2024; leader identified as Dmitry Khoroshev.',
    mitre: '',
  },
  {
    id: 'G0155', name: 'Cl0p',
    aliases: ['TA505', 'GOLD TAHOE', 'Lace Tempest'],
    nation: 'Criminal', sponsor: 'Russia/Ukraine-based', active: '2019–present',
    targets: ['Financial', 'Healthcare', 'Manufacturing', 'Education', 'Government'],
    description: 'Cl0p pioneered mass exploitation of zero-days in enterprise file transfer software — compromising thousands of organizations simultaneously through single vendor vulnerabilities. The MOVEit campaign alone affected 2,700+ organizations and 90+ million individuals, making it among the broadest single campaigns in history.',
    notable: 'MOVEit Transfer zero-day 2023 (2,700+ victims, 90M+ individuals); GoAnywhere zero-day; Accellion FTA exploitation; data extortion without encryption.',
    mitre: '',
  },
  {
    id: 'G1015', name: 'Scattered Spider',
    aliases: ['UNC3944', 'Octo Tempest', 'Muddled Libra', 'Starfraud', '0ktapus'],
    nation: 'Criminal', sponsor: 'English-speaking criminal collective', active: '2022–present',
    targets: ['Hospitality', 'Gaming', 'Technology', 'Financial', 'Telecom'],
    description: 'An English-speaking group — members believed to include teenagers — who use exceptionally sophisticated social engineering to bypass multi-factor authentication and gain privileged access to major corporations. Responsible for some of the most impactful U.S. corporate breaches in recent years.',
    notable: 'MGM Resorts breach 2023 ($100M+ impact); Caesars Entertainment ransom; Twilio/Okta 0ktapus supply chain; multiple arrests 2023–2024.',
    mitre: 'G1015',
  },
  {
    id: 'G0046', name: 'FIN7',
    aliases: ['Carbanak', 'Navigator Group', 'GOLD NIAGARA', 'ITG14', 'Sangria Tempest'],
    nation: 'Criminal', sponsor: 'Russia/Ukraine-based', active: '2015–present',
    targets: ['Retail', 'Hospitality', 'Restaurant', 'Financial', 'Defense'],
    description: 'FIN7 originated targeting point-of-sale systems in restaurants and retail and evolved into a sophisticated operation that created fake cybersecurity firms to recruit unwitting employees. Later pivoted to ransomware, believed to be linked to the Darkside/BlackMatter operations that hit Colonial Pipeline.',
    notable: '$1B+ in stolen card data; Bastion Secure front company recruiting; Darkside Colonial Pipeline connection; BOOSTWRITE and RDFSNIFFER tools.',
    mitre: 'G0046',
  },
  {
    id: 'G0131', name: 'DarkSide',
    aliases: ['BlackMatter', 'Carbon Spider', 'ELBRUS'],
    nation: 'Criminal', sponsor: 'Russia-based (FIN7 affiliated)', active: '2020–2021',
    targets: ['Energy', 'Manufacturing', 'Financial', 'Legal'],
    description: 'DarkSide operated a professional RaaS with a code of conduct, avoiding hospitals and schools — until it attacked Colonial Pipeline and caused fuel shortages across the U.S. East Coast. Russian diplomatic pressure and a DOJ Bitcoin recovery ($2.3M) forced shutdown. Re-emerged as BlackMatter, then ALPHV/BlackCat.',
    notable: 'Colonial Pipeline attack 2021 — East Coast fuel shortage; $4.4M ransom paid; DOJ recovered $2.3M in Bitcoin; shutdown under Russian pressure.',
    mitre: '',
  },

  // ── OTHER ──────────────────────────────────────────────────────────────────
  {
    id: 'G0134', name: 'Transparent Tribe',
    aliases: ['APT36', 'Mythic Leopard', 'PROJECTM', 'TEMP.Lapis'],
    nation: 'Other', sponsor: 'Pakistan (ISI-linked, assessed)', active: '2013–present',
    targets: ['Indian Military', 'Indian Government', 'Defense', 'Kashmir NGOs', 'Education'],
    description: 'Transparent Tribe conducts espionage against Indian military and government targets with focus on defense personnel and Kashmir-related organizations. Uses malicious documents, fake government websites, and Crimson RAT. Assessed to be connected to Pakistani intelligence services based on targeting patterns and infrastructure.',
    notable: 'Indian Army personnel targeting; education sector lures; Crimson RAT deployment; fake Indian government domain operations.',
    mitre: 'G0134',
  },
  {
    id: 'G0121', name: 'SideWinder',
    aliases: ['Rattlesnake', 'Hardcore Nationalist', 'APT-C-17', 'T-APT-04'],
    nation: 'Other', sponsor: 'India (assessed)', active: '2012–present',
    targets: ['Pakistani Military', 'Pakistani Government', 'China (border areas)', 'Nepal', 'Afghanistan'],
    description: 'SideWinder is assessed as an Indian state-sponsored actor targeting Pakistani government and military organizations. Among the most prolific actors in South Asia by campaign volume, with a high tempo of spear-phishing operations using military and government document lures. Has created 1,000+ infrastructure domains over its operational life.',
    notable: 'High-volume spear-phishing against Pakistan Army; border area China targeting; 1,000+ domains created; rapid infrastructure rotation.',
    mitre: 'G0121',
  },
  {
    id: 'G0021', name: 'Molerats',
    aliases: ['Gaza Cybergang', 'Extreme Jackal', 'MOONLIGHT', 'ALUMINUM SARATOGA'],
    nation: 'Other', sponsor: 'Hamas-linked (assessed)', active: '2012–present',
    targets: ['Middle Eastern Governments', 'Financial Institutions', 'Palestinian Authority', 'Regional Media'],
    description: 'Molerats conducts espionage across the Middle East, focusing on Arab governments, financial institutions, and Palestinian political figures. Likely connected to Hamas or Palestinian political factions. Uses commodity malware with regional political document lures.',
    notable: 'Egyptian, UAE, and Saudi government targeting; Palestinian Authority leadership spear-phishing; Poison Ivy and XtremeRAT deployment.',
    mitre: 'G0021',
  },
];

const NATIONS: Nation[] = ['All', 'China', 'Russia', 'Iran', 'DPRK', 'Criminal', 'Other'];

export default function ThreatActorsPage() {
  const [nation, setNation] = useState<Nation>('All');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ACTORS.filter(a => {
      if (nation !== 'All' && a.nation !== nation) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.aliases.some(al => al.toLowerCase().includes(q)) ||
        a.sponsor.toLowerCase().includes(q) ||
        a.targets.some(t => t.toLowerCase().includes(q)) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [nation, query]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap { padding: 110px 40px 100px; max-width: 1200px; margin: 0 auto; }
        .back-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .back-link { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-secondary); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }
        .back-sep { color: var(--text-muted); }

        .hero { margin-bottom: 48px; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
        .hero-eyebrow-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
        .hero-title { font-family: var(--font-display); font-size: clamp(28px, 5vw, 52px); font-weight: 900; color: #fff; letter-spacing: 0.05em; line-height: 1.0; }
        .hero-title span { color: var(--accent); }
        .hero-desc { font-family: var(--font-display); font-size: 16px; color: var(--text-secondary); line-height: 1.6; margin-top: 16px; max-width: 640px; }

        .controls { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
        .search-wrap { position: relative; }
        .search-input { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-bright); padding: 14px 20px 14px 48px; font-family: var(--font-display); font-size: 15px; color: var(--text-primary); transition: border-color 0.2s; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus { border-color: var(--accent); }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 16px; pointer-events: none; }
        .nation-filters { display: flex; flex-wrap: wrap; gap: 8px; }
        .nation-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 16px; border: 1px solid var(--border-bright); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .nation-btn:hover { border-color: var(--border-bright); color: var(--text-primary); }
        .nation-btn.active { color: var(--bg-primary); font-weight: 700; }

        .results-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 20px; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 2px; }

        .actor-card { border: 1px solid var(--border); background: var(--bg-secondary); cursor: pointer; transition: border-color 0.2s, background 0.2s; position: relative; overflow: hidden; }
        .actor-card:hover { border-color: var(--border-bright); background: var(--bg-card); }
        .actor-card.open { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .actor-card-top { padding: 24px; }
        .actor-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .actor-name-block { flex: 1; }
        .actor-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; }
        .actor-id { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; margin-top: 2px; }
        .nation-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 10px; border: 1px solid; flex-shrink: 0; }
        .actor-sponsor { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 8px; }
        .actor-active { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
        .actor-targets { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .target-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 8px; background: rgba(30,158,255,0.06); border: 1px solid var(--border); color: var(--text-secondary); }
        .actor-aliases { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); line-height: 1.5; }
        .actor-expand-toggle { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; display: flex; align-items: center; gap: 6px; margin-top: 14px; }

        .actor-detail { border-top: 1px solid var(--border); padding: 24px; background: var(--bg-secondary); }
        .detail-section { margin-bottom: 20px; }
        .detail-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
        .detail-text { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); line-height: 1.7; }
        .detail-notable { font-family: var(--font-display); font-size: 13px; color: #ffaa00; line-height: 1.6; }
        .mitre-link { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent); text-decoration: none; border: 1px solid var(--border-bright); padding: 8px 14px; transition: all 0.2s; }
        .mitre-link:hover { background: rgba(30,158,255,0.1); border-color: var(--accent); }

        footer { border-top: 1px solid var(--border); padding: 40px; text-align: center; }
        .footer-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }

        @media (max-width: 768px) {
          .page-wrap { padding: 90px 20px 80px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
          <span className="back-sep">/</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.05em', color: 'var(--accent)', textTransform: 'uppercase' }}>Threat Actor Database</span>
        </div>

        <div className="hero">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" aria-hidden="true" />
            <div className="hero-eyebrow-text">Intelligence // Cyber Threat Intel</div>
          </div>
          <h1 className="hero-title">THREAT ACTOR<br /><span>DATABASE</span></h1>
          <div className="hero-desc">
            Nation-state and criminal threat groups — attribution, targets, tradecraft, and notable operations.
            Sourced from MITRE ATT&CK, DOJ indictments, and open-source intelligence.
          </div>
        </div>

        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              className="search-input"
              aria-label="Search threat actors by name, alias, sponsor, or target"
              placeholder="Search by name, alias, sponsor, or target sector..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="nation-filters">
            {NATIONS.map(n => {
              const color = n === 'All' ? '#1e9eff' : NATION_COLORS[n];
              const isActive = nation === n;
              return (
                <button
                  type="button"
                  key={n}
                  className={`nation-btn${isActive ? ' active' : ''}`}
                  style={isActive ? { background: color, borderColor: color, color: 'var(--bg-primary)' } : { borderColor: `${color}40`, color }}
                  onClick={() => setNation(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="results-meta">{filtered.length} actor{filtered.length !== 1 ? 's' : ''} found</div>

        <div className="grid">
          {filtered.map(actor => {
            const color = NATION_COLORS[actor.nation];
            const isOpen = expanded === actor.id;
            return (
              <div
                key={actor.id}
                className={`actor-card${isOpen ? ' open' : ''}`}
                onClick={() => setExpanded(isOpen ? null : actor.id)}
              >
                <div className="actor-card-top">
                  <div className="actor-card-header">
                    <div className="actor-name-block">
                      <div className="actor-name">{actor.name}</div>
                      {actor.mitre && <div className="actor-id">MITRE {actor.mitre}</div>}
                    </div>
                    <div
                      className="nation-badge"
                      style={{ color, borderColor: `${color}60`, background: `${color}12` }}
                    >
                      {actor.nation}
                    </div>
                  </div>
                  <div className="actor-sponsor">{actor.sponsor}</div>
                  <div className="actor-active">Active: {actor.active}</div>
                  <div className="actor-targets">
                    {actor.targets.slice(0, 5).map(t => (
                      <span key={t} className="target-tag">{t}</span>
                    ))}
                  </div>
                  <div className="actor-aliases">
                    aka {actor.aliases.slice(0, 4).join(' · ')}
                    {actor.aliases.length > 4 ? ` +${actor.aliases.length - 4}` : ''}
                  </div>
                  <div className="actor-expand-toggle">
                    {isOpen ? '▲ Collapse' : '▼ View intel'}
                  </div>
                </div>

                {isOpen && (
                  <div className="actor-detail" onClick={e => e.stopPropagation()}>
                    <div className="detail-section">
                      <div className="detail-label">Assessment</div>
                      <div className="detail-text">{actor.description}</div>
                    </div>
                    <div className="detail-section">
                      <div className="detail-label">Notable Operations</div>
                      <div className="detail-notable">{actor.notable}</div>
                    </div>
                    {actor.aliases.length > 0 && (
                      <div className="detail-section">
                        <div className="detail-label">All Known Aliases</div>
                        <div className="detail-text" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {actor.aliases.join(' · ')}
                        </div>
                      </div>
                    )}
                    {actor.mitre && (
                      <a
                        className="mitre-link"
                        href={`https://attack.mitre.org/groups/${actor.mitre}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on MITRE ATT&amp;CK ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>NO ACTORS FOUND</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-muted)', marginTop: 12 }}>Try a different search term or nation filter.</div>
          </div>
        )}
      </main>

      <footer>
        <div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div>
      </footer>
    </>
  );
}
