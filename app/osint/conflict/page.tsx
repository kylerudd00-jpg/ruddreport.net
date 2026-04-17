'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const CONFLICTS = [
  {
    id: 'ukraine', name: 'Russia-Ukraine War', lat: 48.2, lng: 37.5,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Full-scale invasion ongoing. Grinding war of attrition along eastern and southern front lines.',
    tags: ['Ground War', 'Aerial Strikes', 'NATO'], gdelt: 'ukraine russia war',
    acledCountry: 'Ukraine',
  },
  {
    id: 'gaza', name: 'Gaza-Israel Conflict', lat: 31.35, lng: 34.3,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Israeli military operations ongoing in Gaza. Ceasefire remains tenuous. Significant humanitarian crisis.',
    tags: ['Urban Warfare', 'Humanitarian', 'Middle East'], gdelt: 'gaza israel war',
    acledCountry: 'Palestine',
  },
  {
    id: 'iran', name: 'Iran-Israel / US Strikes', lat: 32.7, lng: 51.7,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Following the June 2025 twelve-day war, US and Israeli strikes on Iranian nuclear and military infrastructure.',
    tags: ['Airstrikes', 'Nuclear', 'Middle East', 'US Involved'], gdelt: 'iran israel US strikes war',
    acledCountry: 'Iran',
  },
  {
    id: 'sudan', name: 'Sudan Civil War', lat: 13.6, lng: 25.4,
    intensity: 'high', status: 'ACTIVE',
    summary: 'SAF vs RSF. Mass atrocities in Darfur. Largest displacement crisis in the world.',
    tags: ['Civil War', 'Humanitarian', 'Africa'], gdelt: 'sudan civil war RSF',
    acledCountry: 'Sudan',
  },
  {
    id: 'myanmar', name: 'Myanmar Civil War', lat: 22.0, lng: 95.8,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Military junta losing ground to resistance forces across multiple fronts.',
    tags: ['Civil War', 'Military Junta', 'Asia'], gdelt: 'myanmar civil war junta',
    acledCountry: 'Myanmar',
  },
  {
    id: 'drc', name: 'DR Congo / M23', lat: -1.65, lng: 29.22,
    intensity: 'high', status: 'ACTIVE',
    summary: 'M23 rebels backed by Rwanda have seized Goma and Bukavu. Worst humanitarian crisis in Africa.',
    tags: ['Civil War', 'Proxy War', 'Africa'], gdelt: 'congo M23 war goma',
    acledCountry: 'Democratic Republic of Congo',
  },
  {
    id: 'yemen', name: 'Yemen / Houthi Conflict', lat: 15.4, lng: 44.2,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Houthis continue Red Sea attacks and cross-border strikes. US-led airstrikes ongoing.',
    tags: ['Proxy War', 'Naval', 'Middle East'], gdelt: 'yemen houthi war strikes',
    acledCountry: 'Yemen',
  },
  {
    id: 'westbank', name: 'West Bank Escalation', lat: 32.5, lng: 35.3,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Major Israeli military operations in Jenin, Tulkarm, and Nablus. Escalating settler violence.',
    tags: ['Occupation', 'Middle East', 'Israel'], gdelt: 'west bank israel military jenin',
    acledCountry: 'Palestine',
  },
  {
    id: 'syria', name: 'Syria Post-Assad', lat: 36.2, lng: 37.2,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'HTS-led transitional government consolidating. Turkish-SDF tensions. Israeli strikes continue.',
    tags: ['Post-Conflict', 'Instability', 'Middle East'], gdelt: 'syria HTS turkey SDF conflict',
    acledCountry: 'Syria',
  },
  {
    id: 'sahel', name: 'Sahel Insurgency', lat: 14.5, lng: -3.8,
    intensity: 'high', status: 'ACTIVE',
    summary: "Jihadists besieging Mali's capital Bamako. Military juntas across Mali, Burkina Faso, Niger.",
    tags: ['Insurgency', 'Jihadist', 'Africa'], gdelt: 'sahel mali burkina faso insurgency',
    acledCountry: 'Mali',
  },
  {
    id: 'somalia', name: 'Somalia / Al-Shabaab', lat: 1.8, lng: 44.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Al-Shabaab operations continue. US drawdown of support raises escalation risk.',
    tags: ['Terrorism', 'Al-Shabaab', 'Africa'], gdelt: 'somalia al-shabaab',
    acledCountry: 'Somalia',
  },
  {
    id: 'ethiopia', name: 'Ethiopia-Eritrea Tensions', lat: 14.8, lng: 39.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Risk of interstate war between Ethiopia and Eritrea. Ongoing Amhara and Oromia unrest.',
    tags: ['Interstate Risk', 'Africa'], gdelt: 'ethiopia eritrea conflict',
    acledCountry: 'Ethiopia',
  },
  {
    id: 'haiti', name: 'Haiti Gang Crisis', lat: 18.9, lng: -72.3,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Gangs control Port-au-Prince. State collapse ongoing despite international intervention.',
    tags: ['Gang Violence', 'State Fragility', 'Americas'], gdelt: 'haiti gang violence',
    acledCountry: 'Haiti',
  },
  {
    id: 'taiwan', name: 'Taiwan Strait Tensions', lat: 23.5, lng: 121.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'PLA military exercises and incursions continue. Rated Tier II strategic flashpoint.',
    tags: ['Military Tension', 'China', 'Asia-Pacific'], gdelt: 'taiwan strait china military',
    acledCountry: 'Taiwan',},
    {
    id: 'colombia',
    name: 'Colombia / ELN',
    lat: 4.0,
    lng: -74.0,
    intensity: 'medium',
    status: 'ACTIVE',
    summary: 'ELN guerrillas and FARC dissidents control rural corridors. Peace talks stalled.',
    tags: ['Insurgency', 'Narco', 'Americas'],
    gdelt: 'colombia ELN FARC conflict',
    acledCountry: 'Colombia',
    
  },
  {
    id: 'nigeria',
    name: 'Nigeria / Boko Haram',
    lat: 11.85, lng: 13.16,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Boko Haram and ISWAP continue attacks in the Lake Chad Basin. Nigerian military offensive ongoing.',
    tags: ['Terrorism', 'Jihadist', 'Africa'],
    gdelt: 'nigeria boko haram ISWAP attack',
    acledCountry: 'Nigeria',
  },
  {
    id: 'mozambique',
    name: 'Mozambique / ISIL',
    lat: -11.3, lng: 40.4,
    intensity: 'high', status: 'ACTIVE',
    summary: 'ISIL-affiliated insurgents control parts of Cabo Delgado. SADC and Rwandan forces deployed.',
    tags: ['Terrorism', 'Jihadist', 'Africa'],
    gdelt: 'mozambique cabo delgado insurgency islamist',
    acledCountry: 'Mozambique',
  },
  {
    id: 'cameroon',
    name: 'Cameroon Anglophone Crisis',
    lat: 5.9, lng: 10.2,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Ambazonian separatists fighting government forces in English-speaking regions. Civilian toll rising.',
    tags: ['Separatist', 'Civil Conflict', 'Africa'],
    gdelt: 'cameroon anglophone separatist ambazonia',
    acledCountry: 'Cameroon',
  },
  {
    id: 'southsudan',
    name: 'South Sudan Civil Unrest',
    lat: 9.3, lng: 30.2,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Inter-communal violence and political instability. Peace deal implementation stalled.',
    tags: ['Civil Conflict', 'Humanitarian', 'Africa'],
    gdelt: 'south sudan conflict violence',
    acledCountry: 'South Sudan',
  },
  {
    id: 'caf',
    name: 'Central African Republic',
    lat: 5.5, lng: 18.6,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Wagner-backed government forces fighting CPC rebel coalition. Russian influence dominant.',
    tags: ['Civil War', 'Wagner', 'Africa'],
    gdelt: 'central african republic wagner rebel conflict',
    acledCountry: 'Central African Republic',
  },
  {
    id: 'libya',
    name: 'Libya Factional War',
    lat: 32.1, lng: 20.1,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'GNU and LNA factions competing for control. Turkey and UAE backing opposing sides.',
    tags: ['Proxy War', 'Factions', 'North Africa'],
    gdelt: 'libya war LNA GNU conflict',
    acledCountry: 'Libya',
  },
  {
    id: 'mali',
    name: 'Mali / Wagner Occupation',
    lat: 14.5, lng: -3.8,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Wagner forces and Malian junta fighting jihadist coalition. France expelled. Bamako under threat.',
    tags: ['Jihadist', 'Wagner', 'Africa'],
    gdelt: 'mali wagner junta jihadist conflict',
    acledCountry: 'Mali',
  },
  {
    id: 'burkinafaso',
    name: 'Burkina Faso Insurgency',
    lat: 13.2, lng: -2.4,
    intensity: 'high', status: 'ACTIVE',
    summary: 'JNIM and ISGS control significant territory. Junta cut western ties and invited Russian support.',
    tags: ['Jihadist', 'Insurgency', 'Africa'],
    gdelt: 'burkina faso jihadist JNIM attack',
    acledCountry: 'Burkina Faso',
  },
  {
    id: 'niger',
    name: 'Niger Junta / Sahel',
    lat: 14.2, lng: 1.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Post-coup junta expelled US and French forces. Jihadist activity intensifying in border regions.',
    tags: ['Junta', 'Insurgency', 'Africa'],
    gdelt: 'niger junta coup jihadist conflict',
    acledCountry: 'Niger',
  },
  {
    id: 'pakistan',
    name: 'Pakistan / TTP',
    lat: 32.2, lng: 69.8,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Tehrik-i-Taliban Pakistan escalating attacks across KP and Balochistan. Cross-border strikes into Afghanistan.',
    tags: ['Terrorism', 'TTP', 'South Asia'],
    gdelt: 'pakistan TTP taliban attack balochistan',
    acledCountry: 'Pakistan',
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan / IS-K',
    lat: 34.5, lng: 69.2,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Islamic State Khorasan conducting bombings against Taliban and civilians. Regional destabilization risk.',
    tags: ['Terrorism', 'IS-K', 'South Asia'],
    gdelt: 'afghanistan ISIS ISKP attack bombing',
    acledCountry: 'Afghanistan',
  },
  {
    id: 'india-pakistan',
    name: 'India-Pakistan Tensions',
    lat: 34.1, lng: 74.8,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Renewed cross-border skirmishes in Kashmir. Military buildup on both sides following militant attacks.',
    tags: ['Interstate Risk', 'Kashmir', 'South Asia'],
    gdelt: 'india pakistan kashmir military tension',
    acledCountry: 'India',
  },
  {
    id: 'northkorea',
    name: 'North Korea Provocations',
    lat: 38.3, lng: 128.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Ballistic missile tests and troop deployment to Russia. Peninsula tensions at decade high.',
    tags: ['Nuclear', 'Missiles', 'Asia-Pacific'],
    gdelt: 'north korea missile nuclear provocation',
    acledCountry: 'North Korea',
  },
  {
    id: 'southchinasea',
    name: 'South China Sea',
    lat: 9.4, lng: 117.8,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'China coast guard confrontations with Philippines at Second Thomas Shoal. US and allies increasing patrols.',
    tags: ['Maritime', 'China', 'Asia-Pacific'],
    gdelt: 'south china sea philippines china dispute',
    acledCountry: 'Philippines',
  },
  {
    id: 'venezuela',
    name: 'Venezuela Crisis',
    lat: 8.0, lng: -66.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Post-election crackdown on opposition. Tren de Aragua gang activity spreading regionally.',
    tags: ['Political Violence', 'Americas', 'Gangs'],
    gdelt: 'venezuela maduro opposition violence crisis',
    acledCountry: 'Venezuela',
  },
  {
    id: 'ecuador',
    name: 'Ecuador Cartel War',
    lat: -0.9, lng: -79.6,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Mexican cartel proxies fighting for port control. State of emergency declared. Prison massacres ongoing.',
    tags: ['Cartel', 'Narco', 'Americas'],
    gdelt: 'ecuador cartel gang violence narco',
    acledCountry: 'Ecuador',
  },
  {
    id: 'mexico',
    name: 'Mexico Cartel Violence',
    lat: 24.8, lng: -107.4,
    intensity: 'high', status: 'ACTIVE',
    summary: 'CJNG and Sinaloa cartel war intensifying. Record homicide rates in Sinaloa, Chiapas, and Guerrero.',
    tags: ['Cartel', 'Narco', 'Americas'],
    gdelt: 'mexico cartel violence sinaloa CJNG',
    acledCountry: 'Mexico',
  },
  {
    id: 'iraq',
    name: 'Iraq / Iran-Backed Militias',
    lat: 33.3, lng: 44.4,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Iran-backed PMF militias asserting control. Residual ISIS activity in Anbar and Diyala.',
    tags: ['Militia', 'Iran Proxy', 'Middle East'],
    gdelt: 'iraq militia PMF ISIS attack',
    acledCountry: 'Iraq',
  },
  {
    id: 'lebanon',
    name: 'Lebanon Post-War Fragility',
    lat: 33.5, lng: 35.4,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Post-Hezbollah-Israel war reconstruction stalled. Political vacuum and economic collapse deepening.',
    tags: ['Post-Conflict', 'Hezbollah', 'Middle East'],
    gdelt: 'lebanon hezbollah israel war reconstruction',
    acledCountry: 'Lebanon',
  },
  {
    id: 'armenia-azerbaijan',
    name: 'Armenia-Azerbaijan',
    lat: 39.8, lng: 46.7,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Post-Karabakh tensions persist. Border demarcation disputes unresolved. Russian influence waning.',
    tags: ['Interstate Risk', 'Caucasus', 'Europe'],
    gdelt: 'armenia azerbaijan border tension conflict',
    acledCountry: 'Armenia',
  },
  {
    id: 'kenya',
    name: 'Kenya / Al-Shabaab',
    lat: 0.5, lng: 40.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Al-Shabaab cross-border attacks from Somalia into northeastern Kenya. Security forces on high alert.',
    tags: ['Terrorism', 'Al-Shabaab', 'Africa'],
    gdelt: 'kenya al-shabaab attack border',
    acledCountry: 'Kenya',
  },
  {
    id: 'chad',
    name: 'Chad Instability',
    lat: 15.0, lng: 19.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Post-coup transitional government facing rebel threats from Sudan spillover and internal factions.',
    tags: ['Instability', 'Coup', 'Africa'],
    gdelt: 'chad rebel conflict instability',
    acledCountry: 'Chad',
  },
  {
    id: 'tanzania',
    name: 'Tanzania / Mozambique Spillover',
    lat: -6.5, lng: 35.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Jihadist activity from Mozambique spilling into southern Tanzania. Security forces mobilizing.',
    tags: ['Jihadist', 'Spillover', 'Africa'],
    gdelt: 'tanzania jihadist mozambique spillover attack',
    acledCountry: 'Tanzania',
  },
  {
    id: 'senegal',
    name: 'Senegal / Casamance',
    lat: 12.6, lng: -15.4,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'MFDC separatists active in Casamance region. Low-level insurgency persists despite peace talks.',
    tags: ['Separatist', 'Africa', 'Insurgency'],
    gdelt: 'senegal casamance separatist MFDC',
    acledCountry: 'Senegal',
  },
  {
    id: 'djibouti',
    name: 'Horn of Africa Maritime',
    lat: 11.8, lng: 42.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Houthi Red Sea campaign threatening Horn of Africa shipping lanes. Naval forces on standby.',
    tags: ['Maritime', 'Houthi', 'Africa'],
    gdelt: 'horn africa maritime houthi shipping attack',
    acledCountry: 'Djibouti',
  },
  {
    id: 'turkey-kurdish',
    name: 'Turkey / PKK Conflict',
    lat: 37.1, lng: 43.1,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Turkish military operations against PKK in Iraq and Syria continue. Domestic Kurdish tensions rising.',
    tags: ['Counterterrorism', 'PKK', 'Middle East'],
    gdelt: 'turkey PKK kurds military operation',
    acledCountry: 'Turkey',
  },
  {
    id: 'egypt-sinai',
    name: 'Egypt / Sinai Insurgency',
    lat: 30.9, lng: 34.1,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'ISIS-Sinai Province conducting attacks on Egyptian security forces. Gaza war spillover risk elevated.',
    tags: ['Terrorism', 'ISIS', 'North Africa'],
    gdelt: 'egypt sinai ISIS attack military',
    acledCountry: 'Egypt',
  },
  {
    id: 'georgia',
    name: 'Georgia / Russia Tensions',
    lat: 41.7, lng: 44.8,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Pro-Russian government reversing EU path. Mass protests. Russian occupied territories of Abkhazia and S. Ossetia remain flashpoints.',
    tags: ['Russia', 'Political Crisis', 'Caucasus'],
    gdelt: 'georgia russia protest political crisis',
    acledCountry: 'Georgia',
  },
  {
    id: 'moldova',
    name: 'Moldova / Transnistria',
    lat: 47.0, lng: 29.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Russian troops in breakaway Transnistria. Energy crisis and political pressure intensifying.',
    tags: ['Russia', 'Frozen Conflict', 'Europe'],
    gdelt: 'moldova transnistria russia conflict',
    acledCountry: 'Moldova',
  },
  {
    id: 'serbia-kosovo',
    name: 'Serbia / Kosovo Tensions',
    lat: 42.8, lng: 21.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Serbian military buildup on Kosovo border. NATO KFOR on alert. EU mediation stalled.',
    tags: ['Interstate Risk', 'NATO', 'Europe'],
    gdelt: 'serbia kosovo tension military NATO',
    acledCountry: 'Serbia',
  },
  {
    id: 'bolivia',
    name: 'Bolivia Political Violence',
    lat: -16.5, lng: -64.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Political crisis between Morales and Arce factions. Blockades and street violence escalating.',
    tags: ['Political Violence', 'Americas', 'Instability'],
    gdelt: 'bolivia political violence protest crisis',
    acledCountry: 'Bolivia',
  },
  {
    id: 'peru',
    name: 'Peru / Shining Path',
    lat: -12.7, lng: -73.9,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Shining Path remnants (MOVADEF) active in VRAEM valley. Drug trafficking fueling insurgency.',
    tags: ['Insurgency', 'Narco', 'Americas'],
    gdelt: 'peru shining path VRAEM insurgency',
    acledCountry: 'Peru',
  },
  {
    id: 'china-india',
    name: 'China-India Border',
    lat: 34.2, lng: 77.6,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'LAC standoff continues despite disengagement deals. Infrastructure buildup on both sides of disputed border.',
    tags: ['Interstate Risk', 'China', 'South Asia'],
    gdelt: 'china india border LAC dispute military',
    acledCountry: 'India',
  },
  {
    id: 'philippines',
    name: 'Philippines / Abu Sayyaf',
    lat: 7.9, lng: 124.3,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Abu Sayyaf and NPA insurgencies in Mindanao. US-Philippines military cooperation expanding.',
    tags: ['Terrorism', 'Insurgency', 'Asia-Pacific'],
    gdelt: 'philippines abu sayyaf NPA mindanao attack',
    acledCountry: 'Philippines',
  },
  {
    id: 'papua',
    name: 'West Papua Insurgency',
    lat: -4.0, lng: 136.7,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'OPM separatists conducting attacks on Indonesian security forces and civilian workers in Papua.',
    tags: ['Separatist', 'Indonesia', 'Asia-Pacific'],
    gdelt: 'west papua OPM separatist indonesia conflict',
    acledCountry: 'Indonesia',
  },
  {
    id: 'tigray',
    name: 'Ethiopia / Tigray Aftermath',
    lat: 13.5, lng: 39.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Post-ceasefire Tigray faces humanitarian collapse. Fano militia clashes with federal forces in Amhara.',
    tags: ['Civil Conflict', 'Humanitarian', 'Africa'],
    gdelt: 'ethiopia tigray amhara fano conflict',
    acledCountry: 'Ethiopia',
  },
  {
    id: 'benin',
    name: 'Benin / Sahel Spillover',
    lat: 11.3, lng: 2.8,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Jihadist groups from Burkina Faso and Niger expanding into northern Benin. Tourist zones attacked.',
    tags: ['Jihadist', 'Spillover', 'Africa'],
    gdelt: 'benin jihadist attack north spillover',
    acledCountry: 'Benin',
  },
  {
    id: 'togo',
    name: 'Togo / Northern Insurgency',
    lat: 10.7, lng: 0.2,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Armed groups from Burkina Faso operating in northern Togo. Military deployment ongoing.',
    tags: ['Insurgency', 'Spillover', 'Africa'],
    gdelt: 'togo northern attack insurgency jihadist',
    acledCountry: 'Togo',
  },
  {
    id: 'ghana',
    name: 'Ghana / Northern Tensions',
    lat: 10.0, lng: -1.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Spillover threat from Sahel. Intercommunal violence in northern regions. Security forces on alert.',
    tags: ['Instability', 'Spillover', 'Africa'],
    gdelt: 'ghana northern violence jihadist threat',
    acledCountry: 'Ghana',
  },
  {
    id: 'ivorycoast',
    name: 'Ivory Coast Border Threat',
    lat: 9.8, lng: -6.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Jihadist incursions from Mali and Burkina Faso into northern Ivory Coast escalating.',
    tags: ['Jihadist', 'Border', 'Africa'],
    gdelt: 'ivory coast jihadist border attack burkina',
    acledCountry: 'Ivory Coast',
  },
  {
    id: 'guinea',
    name: 'Guinea Post-Coup',
    lat: 11.0, lng: -11.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Military junta consolidating power. Opposition crackdown. Transition timeline disputed.',
    tags: ['Coup', 'Junta', 'Africa'],
    gdelt: 'guinea junta coup military opposition',
    acledCountry: 'Guinea',
  },
  {
    id: 'guineabissau',
    name: 'Guinea-Bissau Instability',
    lat: 12.0, lng: -15.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Drug trafficking networks destabilizing government. Coup risk elevated. West African gateway for narcotics.',
    tags: ['Narco', 'Instability', 'Africa'],
    gdelt: 'guinea bissau instability drug trafficking coup',
    acledCountry: 'Guinea-Bissau',
  },
  {
    id: 'madagascar',
    name: 'Madagascar / Dahalo',
    lat: -23.4, lng: 44.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Dahalo cattle raiders terrorizing southern Madagascar. Security forces unable to contain violence.',
    tags: ['Banditry', 'Rural Violence', 'Africa'],
    gdelt: 'madagascar dahalo violence south security',
    acledCountry: 'Madagascar',
  },
  {
    id: 'zimbabwe',
    name: 'Zimbabwe Economic Collapse',
    lat: -20.0, lng: 30.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Political repression and economic freefall fueling unrest. Opposition leaders arrested ahead of elections.',
    tags: ['Political Violence', 'Repression', 'Africa'],
    gdelt: 'zimbabwe opposition crackdown violence protest',
    acledCountry: 'Zimbabwe',
  },
  {
    id: 'eswatini',
    name: 'Eswatini Pro-Democracy',
    lat: -26.5, lng: 31.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Africa\'s last absolute monarchy faces pro-democracy insurgency. Armed groups targeting infrastructure.',
    tags: ['Political Violence', 'Insurgency', 'Africa'],
    gdelt: 'eswatini democracy protest violence unrest',
    acledCountry: 'Eswatini',
  },
  {
    id: 'angola',
    name: 'Angola / Cabinda',
    lat: -5.5, lng: 12.2,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'FLEC separatists in oil-rich Cabinda enclave conducting low-level attacks on infrastructure.',
    tags: ['Separatist', 'Oil', 'Africa'],
    gdelt: 'angola cabinda FLEC separatist attack',
    acledCountry: 'Angola',
  },
  {
    id: 'zambia',
    name: 'Zambia Political Tensions',
    lat: -14.0, lng: 28.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Opposition crackdown and economic stress fueling political unrest ahead of 2026 elections.',
    tags: ['Political Tension', 'Africa'],
    gdelt: 'zambia political tension opposition unrest',
    acledCountry: 'Zambia',
  },
  {
    id: 'eritrea',
    name: 'Eritrea / Regional Threat',
    lat: 15.5, lng: 39.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Eritrea backing Tigray factions and threatening Ethiopia. One of the world\'s most militarized states.',
    tags: ['Interstate Risk', 'Horn of Africa', 'Africa'],
    gdelt: 'eritrea ethiopia conflict military threat',
    acledCountry: 'Eritrea',
  },
  {
    id: 'burundi',
    name: 'Burundi Armed Groups',
    lat: -3.4, lng: 29.4,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'RED-Tabara and other armed groups operating from DRC. Government repression of opposition ongoing.',
    tags: ['Armed Groups', 'Africa', 'Repression'],
    gdelt: 'burundi armed group rebel attack RED-Tabara',
    acledCountry: 'Burundi',
  },
  {
    id: 'rwanda',
    name: 'Rwanda / DRC Proxy',
    lat: -1.6, lng: 29.2,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Rwanda backing M23 rebels in eastern DRC. International sanctions imposed. Regional war risk elevated.',
    tags: ['Proxy War', 'M23', 'Africa'],
    gdelt: 'rwanda M23 DRC proxy war sanctions',
    acledCountry: 'Rwanda',
  },
  {
    id: 'uganda',
    name: 'Uganda / ADF',
    lat: 0.3, lng: 30.1,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Allied Democratic Forces conducting bombings and massacres in DRC border regions and inside Uganda.',
    tags: ['Terrorism', 'ADF', 'Africa'],
    gdelt: 'uganda ADF allied democratic forces attack',
    acledCountry: 'Uganda',
  },
  {
    id: 'tanzania-jihadist',
    name: 'Tanzania Coastal Attacks',
    lat: -6.9, lng: 39.4,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Jihadist attacks on police and civilians in Pwani and Dar es Salaam regions increasing.',
    tags: ['Terrorism', 'Coastal', 'Africa'],
    gdelt: 'tanzania jihadist attack coastal pwani',
    acledCountry: 'Tanzania',
  },
  {
    id: 'tunisia',
    name: 'Tunisia Authoritarian Turn',
    lat: 34.0, lng: 9.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'President Saied consolidating one-man rule. Opposition jailed. Sub-Saharan migrant crisis exploding.',
    tags: ['Authoritarianism', 'Political Crisis', 'North Africa'],
    gdelt: 'tunisia saied opposition arrest political crisis',
    acledCountry: 'Tunisia',
  },
  {
    id: 'algeria',
    name: 'Algeria / GSIM',
    lat: 28.0, lng: 2.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'GSIM jihadists operating in southern Algeria. Border tensions with Morocco. Regional power rivalry.',
    tags: ['Jihadist', 'North Africa', 'Rivalry'],
    gdelt: 'algeria jihadist GSIM south border',
    acledCountry: 'Algeria',
  },
  {
    id: 'morocco-sahara',
    name: 'Western Sahara Conflict',
    lat: 24.0, lng: -13.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Polisario Front and Morocco in low-level conflict. Algeria backing separatists. UN talks deadlocked.',
    tags: ['Separatist', 'North Africa', 'Morocco'],
    gdelt: 'western sahara polisario morocco conflict',
    acledCountry: 'Morocco',
  },
  {
    id: 'jordan',
    name: 'Jordan Stability Threat',
    lat: 31.0, lng: 36.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Gaza war spillover, drone attacks from Iraq-based militias, and domestic unrest threatening Hashemite stability.',
    tags: ['Spillover', 'Middle East', 'Instability'],
    gdelt: 'jordan stability threat militia drone attack',
    acledCountry: 'Jordan',
  },
  {
    id: 'bahrain',
    name: 'Bahrain / Iran Proxy',
    lat: 26.0, lng: 50.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Iran-linked cells conducting sabotage operations. Shia opposition suppressed. US Fifth Fleet homeport at risk.',
    tags: ['Iran Proxy', 'Gulf', 'Middle East'],
    gdelt: 'bahrain iran proxy attack opposition',
    acledCountry: 'Bahrain',
  },
  {
    id: 'saudi',
    name: 'Saudi Arabia / Houthi Threat',
    lat: 24.0, lng: 45.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Houthi drone and missile attacks on Saudi infrastructure continue despite ceasefire. Oil facilities targeted.',
    tags: ['Houthi', 'Gulf', 'Middle East'],
    gdelt: 'saudi arabia houthi drone missile attack',
    acledCountry: 'Saudi Arabia',
  },
  {
    id: 'oman',
    name: 'Oman Strait of Hormuz',
    lat: 23.6, lng: 58.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Strait of Hormuz shipping under threat from Iranian seizures and Houthi operations. Naval tensions rising.',
    tags: ['Maritime', 'Iran', 'Gulf'],
    gdelt: 'strait hormuz iran shipping seizure oman',
    acledCountry: 'Oman',
  },
  {
    id: 'uzbekistan',
    name: 'Uzbekistan / IMU',
    lat: 41.0, lng: 64.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Islamic Movement of Uzbekistan remnants operating from Afghanistan. Radicalization risk increasing.',
    tags: ['Terrorism', 'Central Asia', 'IMU'],
    gdelt: 'uzbekistan islamic movement central asia threat',
    acledCountry: 'Uzbekistan',
  },
  {
    id: 'tajikistan',
    name: 'Tajikistan / Afghanistan Border',
    lat: 38.5, lng: 71.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Taliban border incursions and IS-K cross-border attacks. Tajik forces on high alert.',
    tags: ['Border', 'Taliban', 'Central Asia'],
    gdelt: 'tajikistan afghanistan border taliban attack',
    acledCountry: 'Tajikistan',
  },
  {
    id: 'kyrgyzstan',
    name: 'Kyrgyzstan-Tajikistan Border',
    lat: 40.5, lng: 72.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Recurring armed clashes over Ferghana Valley water and land disputes. Ceasefire fragile.',
    tags: ['Border Dispute', 'Central Asia'],
    gdelt: 'kyrgyzstan tajikistan border clash conflict',
    acledCountry: 'Kyrgyzstan',
  },
  {
    id: 'kazakhstan',
    name: 'Kazakhstan Instability',
    lat: 48.0, lng: 68.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Post-2022 uprising political repression ongoing. Russian influence contested. Economic unrest simmering.',
    tags: ['Political Tension', 'Russia', 'Central Asia'],
    gdelt: 'kazakhstan unrest political tension russia',
    acledCountry: 'Kazakhstan',
  },
  {
    id: 'belarus',
    name: 'Belarus / Lukashenko Regime',
    lat: 53.7, lng: 27.9,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Lukashenko weaponizing migrants at EU border. Opposition exiled. Wagner forces previously based here.',
    tags: ['Hybrid War', 'Russia', 'Europe'],
    gdelt: 'belarus lukashenko migrant border EU hybrid',
    acledCountry: 'Belarus',
  },
  {
    id: 'bosnia',
    name: 'Bosnia / Republika Srpska',
    lat: 44.2, lng: 17.9,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Dodik pushing Republika Srpska toward secession. NATO and EU warning of Balkan destabilization.',
    tags: ['Secessionism', 'Balkans', 'Europe'],
    gdelt: 'bosnia republika srpska dodik secession NATO',
    acledCountry: 'Bosnia and Herzegovina',
  },
  {
    id: 'haiti2',
    name: 'Haiti / Viv Ansanm',
    lat: 18.5, lng: -72.8,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Viv Ansanm gang coalition controls 85% of Port-au-Prince. Kenyan-led MSS mission struggling.',
    tags: ['Gang War', 'State Collapse', 'Americas'],
    gdelt: 'haiti viv ansanm gang kenya MSS mission',
    acledCountry: 'Haiti',
  },
  {
    id: 'elsalvador',
    name: 'El Salvador Post-Bukele',
    lat: 13.7, lng: -88.9,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Bukele\'s mass incarceration policy facing sustainability questions. MS-13 and Barrio 18 remnants regrouping.',
    tags: ['Gang', 'Americas', 'Authoritarian'],
    gdelt: 'el salvador bukele gang MS13 prison security',
    acledCountry: 'El Salvador',
  },
  {
    id: 'honduras',
    name: 'Honduras Gang Violence',
    lat: 14.1, lng: -87.2,
    intensity: 'high', status: 'ACTIVE',
    summary: 'MS-13 and Barrio 18 control large urban territories. Record homicide rates. State corruption endemic.',
    tags: ['Gang', 'Narco', 'Americas'],
    gdelt: 'honduras gang violence MS13 homicide narco',
    acledCountry: 'Honduras',
  },
  {
    id: 'guatemala',
    name: 'Guatemala Cartel Corridors',
    lat: 15.8, lng: -90.2,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Zetas and CJNG operating transit corridors through Guatemala. Indigenous community conflicts ongoing.',
    tags: ['Cartel', 'Narco', 'Americas'],
    gdelt: 'guatemala cartel zetas CJNG narco violence',
    acledCountry: 'Guatemala',
  },
  {
    id: 'jamaica',
    name: 'Jamaica Gang War',
    lat: 18.1, lng: -77.3,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Garrison communities controlled by dons. States of emergency declared repeatedly. Extradition tensions with US.',
    tags: ['Gang', 'Caribbean', 'Americas'],
    gdelt: 'jamaica gang violence don garrison state emergency',
    acledCountry: 'Jamaica',
  },
  {
    id: 'trinidadtobago',
    name: 'Trinidad & Tobago Gang Crisis',
    lat: 10.7, lng: -61.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Gang violence at record levels. Venezuelan gang networks expanding. State of emergency declared.',
    tags: ['Gang', 'Caribbean', 'Venezuela'],
    gdelt: 'trinidad tobago gang violence venezuela network',
    acledCountry: 'Trinidad and Tobago',
  },
  {
    id: 'brazil',
    name: 'Brazil / PCC & CV',
    lat: -23.5, lng: -46.6,
    intensity: 'high', status: 'ACTIVE',
    summary: 'PCC and Comando Vermelho waging drug war across Brazil. Amazon frontier violence. Police killings record high.',
    tags: ['Gang', 'Narco', 'Americas'],
    gdelt: 'brazil PCC comando vermelho gang drug war',
    acledCountry: 'Brazil',
  },
  {
    id: 'chile',
    name: 'Chile / Araucanía Conflict',
    lat: -38.5, lng: -72.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Mapuche armed groups attacking farms and infrastructure in Araucanía. State of emergency extended.',
    tags: ['Indigenous', 'Araucanía', 'Americas'],
    gdelt: 'chile mapuche araucania attack conflict indigenous',
    acledCountry: 'Chile',
  },
  {
    id: 'myanmar2',
    name: 'Myanmar / Shan State',
    lat: 20.8, lng: 99.4,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Three Brotherhood Alliance controlling Shan State. Scam compound crisis drawing international attention.',
    tags: ['Civil War', 'Shan', 'Asia'],
    gdelt: 'myanmar shan state alliance scam compound conflict',
    acledCountry: 'Myanmar',
  },
  {
    id: 'thailand',
    name: 'Thailand / Deep South',
    lat: 6.5, lng: 101.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'BRN Malay-Muslim separatists conducting attacks in Pattani, Yala, and Narathiwat provinces.',
    tags: ['Separatist', 'Insurgency', 'Asia'],
    gdelt: 'thailand BRN south insurgency pattani attack',
    acledCountry: 'Thailand',
  },
  {
    id: 'indonesia',
    name: 'Indonesia / Papua',
    lat: -3.9, lng: 136.7,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'OPM Free Papua Movement attacking military and civilian targets. Internet blackouts imposed.',
    tags: ['Separatist', 'Papua', 'Asia-Pacific'],
    gdelt: 'indonesia papua OPM separatist attack military',
    acledCountry: 'Indonesia',
  },
  {
    id: 'india-manipur',
    name: 'India / Manipur Ethnic War',
    lat: 24.8, lng: 93.9,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Meitei-Kuki ethnic conflict ongoing since 2023. Thousands displaced. Internet shutdown persists.',
    tags: ['Ethnic Conflict', 'India', 'South Asia'],
    gdelt: 'india manipur meitei kuki ethnic conflict violence',
    acledCountry: 'India',
  },
  {
    id: 'india-naxal',
    name: 'India / Naxalite Insurgency',
    lat: 18.5, lng: 80.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Maoist Naxalites conducting ambushes in the Red Corridor. Government offensive shrinking their territory.',
    tags: ['Maoist', 'Insurgency', 'South Asia'],
    gdelt: 'india naxalite maoist red corridor attack',
    acledCountry: 'India',
  },
  {
    id: 'srilanka',
    name: 'Sri Lanka Economic Unrest',
    lat: 7.9, lng: 80.8,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Post-economic collapse political instability. Tamil grievances unresolved. IMF austerity triggering protests.',
    tags: ['Economic Crisis', 'South Asia', 'Unrest'],
    gdelt: 'sri lanka protest economic crisis unrest IMF',
    acledCountry: 'Sri Lanka',
  },
  {
    id: 'bangladesh',
    name: 'Bangladesh Post-Coup',
    lat: 23.7, lng: 90.4,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Interim government following Hasina ouster. Rohingya crisis pressure. Islamist groups gaining influence.',
    tags: ['Political Crisis', 'South Asia', 'Rohingya'],
    gdelt: 'bangladesh interim government coup islamist rohingya',
    acledCountry: 'Bangladesh',
  },
  {
    id: 'nepal',
    name: 'Nepal Political Instability',
    lat: 28.3, lng: 84.1,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Revolving door governments and Maoist resurgence. China-India competition for influence intensifying.',
    tags: ['Instability', 'South Asia', 'Geopolitics'],
    gdelt: 'nepal political instability maoist china india',
    acledCountry: 'Nepal',
  },
  {
    id: 'papua-newguinea',
    name: 'Papua New Guinea Tribal War',
    lat: -6.3, lng: 143.9,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Tribal warfare in Highlands killing hundreds. Modern weapons replacing traditional arms. State capacity minimal.',
    tags: ['Tribal War', 'Pacific', 'Asia-Pacific'],
    gdelt: 'papua new guinea tribal war highlands violence',
    acledCountry: 'Papua New Guinea',
  },
  {
    id: 'russia-internal',
    name: 'Russia / Internal Dissent',
    lat: 55.7, lng: 37.6,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Wagner mutiny aftermath. Regional governors asserting independence. Anti-war movement suppressed violently.',
    tags: ['Internal Dissent', 'Russia', 'Europe'],
    gdelt: 'russia internal dissent opposition crackdown wagner',
    acledCountry: 'Russia',
  },
  {
    id: 'china-xinjiang',
    name: 'China / Xinjiang Repression',
    lat: 43.8, lng: 87.6,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Ongoing mass detention of Uyghurs. ETIM cross-border threat cited by Beijing. International sanctions imposed.',
    tags: ['Repression', 'Uyghur', 'China'],
    gdelt: 'china xinjiang uyghur detention repression ETIM',
    acledCountry: 'China',
  },
  {
    id: 'israel-lebanon',
    name: 'Israel-Lebanon Ceasefire',
    lat: 33.1, lng: 35.2,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Ceasefire between Israel and Hezbollah holding tenuously. IDF maintaining positions in southern Lebanon.',
    tags: ['Ceasefire', 'Hezbollah', 'Middle East'],
    gdelt: 'israel lebanon hezbollah ceasefire IDF',
    acledCountry: 'Lebanon',
  },
  {
    id: 'australia-indigenous',
    name: 'Australia / Indigenous Crisis',
    lat: -25.0, lng: 133.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Escalating violence in remote Aboriginal communities in NT and WA. Youth crime crisis in Alice Springs declared national emergency.',
    tags: ['Indigenous', 'Oceania', 'Social Crisis'],
    gdelt: 'australia indigenous violence alice springs aboriginal crisis',
    acledCountry: 'Australia',
  },
  {
    id: 'australia-timor',
    name: 'Timor Sea Tensions',
    lat: -10.0, lng: 127.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'China expanding naval presence in Timor Sea. Australia-China strategic competition intensifying around resource-rich waters.',
    tags: ['Maritime', 'China', 'Oceania'],
    gdelt: 'timor sea china australia naval tension',
    acledCountry: 'Timor-Leste',
  },
  {
    id: 'canada-indigenous',
    name: 'Canada / Indigenous Land Defense',
    lat: 54.0, lng: -100.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Wet\'suwet\'en and other First Nations blockading pipelines and rail infrastructure. RCMP enforcement operations ongoing.',
    tags: ['Indigenous', 'Protest', 'North America'],
    gdelt: 'canada indigenous pipeline blockade RCMP wetsuweten',
    acledCountry: 'Canada',
  },
  {
    id: 'greenland',
    name: 'Greenland Sovereignty Crisis',
    lat: 72.0, lng: -40.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'US pressure to acquire Greenland intensifying. Denmark reinforcing Arctic military presence. Independence movement accelerating.',
    tags: ['Sovereignty', 'Arctic', 'NATO'],
    gdelt: 'greenland sovereignty US denmark arctic military independence',
    acledCountry: 'Denmark',
  },
  {
    id: 'arctic',
    name: 'Arctic Militarization',
    lat: 80.0, lng: 15.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Russia and China expanding Arctic military infrastructure. NATO members scrambling to counter. Svalbard tensions rising.',
    tags: ['Arctic', 'Russia', 'NATO'],
    gdelt: 'arctic russia china military NATO svalbard tension',
    acledCountry: 'Norway',
  },
  {
    id: 'china-taiwan-blockade',
    name: 'China / Taiwan Blockade Drills',
    lat: 25.0, lng: 122.5,
    intensity: 'high', status: 'ELEVATED',
    summary: 'PLA conducting full encirclement blockade exercises around Taiwan. US carrier groups repositioning. War risk assessment elevated.',
    tags: ['China', 'Blockade', 'Asia-Pacific'],
    gdelt: 'china taiwan blockade PLA military drill carrier',
    acledCountry: 'Taiwan',
  },
  {
    id: 'china-southchinasea',
    name: 'China / Island Fortification',
    lat: 16.0, lng: 112.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'China completing militarization of Spratly and Paracel islands. Hypersonic missile batteries deployed. ASEAN states alarmed.',
    tags: ['China', 'Maritime', 'Asia-Pacific'],
    gdelt: 'china spratly paracel island military hypersonic missile',
    acledCountry: 'China',
  },
  {
    id: 'china-bhutan',
    name: 'China-Bhutan Border Grab',
    lat: 27.3, lng: 89.4,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'China constructing villages inside disputed Bhutanese territory. Doklam area flashpoint threatening India-China-Bhutan triangle.',
    tags: ['China', 'Border', 'South Asia'],
    gdelt: 'china bhutan border dispute village doklam india',
    acledCountry: 'Bhutan',
  },
  {
    id: 'france-riots',
    name: 'France Social Unrest',
    lat: 46.0, lng: 2.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Far-right and far-left street violence escalating. Banlieue riots recurring. Political paralysis following hung parliament.',
    tags: ['Civil Unrest', 'Far-Right', 'Europe'],
    gdelt: 'france riots unrest banlieue political violence',
    acledCountry: 'France',
  },
  {
    id: 'germany-extremism',
    name: 'Germany / Far-Right Rise',
    lat: 51.5, lng: 10.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'AfD surging nationally. Neo-Nazi network Reichsbürger plotting government overthrow. Far-right attacks on asylum seekers.',
    tags: ['Far-Right', 'Extremism', 'Europe'],
    gdelt: 'germany AfD far right extremism reichsburger attack',
    acledCountry: 'Germany',
  },
  {
    id: 'uk-unrest',
    name: 'UK Far-Right Riots',
    lat: 52.5, lng: -1.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Far-right riots targeting mosques and asylum hotels following Southport stabbings. Counter-protests nationwide.',
    tags: ['Far-Right', 'Civil Unrest', 'Europe'],
    gdelt: 'UK far right riot mosque asylum southport violence',
    acledCountry: 'United Kingdom',
  },
  {
    id: 'spain-catalonia',
    name: 'Spain / Catalonia Tension',
    lat: 41.8, lng: 1.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Independence movement regrouping after amnesty law. CUP and pro-independence groups planning renewed push.',
    tags: ['Separatist', 'Catalonia', 'Europe'],
    gdelt: 'spain catalonia independence separatist tension',
    acledCountry: 'Spain',
  },
  {
    id: 'italy-mafia',
    name: 'Italy / Ndrangheta Expansion',
    lat: 38.5, lng: 16.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Ndrangheta controlling European cocaine distribution. Camorra-Ndrangheta war in Naples. Infiltration of northern economies.',
    tags: ['Organized Crime', 'Mafia', 'Europe'],
    gdelt: 'italy ndrangheta camorra mafia war cocaine europe',
    acledCountry: 'Italy',
  },
  {
    id: 'ireland-dissident',
    name: 'Ireland / Dissident IRA',
    lat: 54.2, lng: -6.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'New IRA and Continuity IRA conducting bomb attacks. Brexit border tensions reviving republican sentiment.',
    tags: ['Terrorism', 'IRA', 'Europe'],
    gdelt: 'ireland IRA dissident bomb attack republican border',
    acledCountry: 'Ireland',
  },
  {
    id: 'sweden-gangs',
    name: 'Sweden Gang War',
    lat: 55.6, lng: 13.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Record gang bombings and shootings in Stockholm and Malmö. NATO membership complicated by Turkish-Kurdish gang networks.',
    tags: ['Gang War', 'Scandinavia', 'Europe'],
    gdelt: 'sweden gang bombing shooting stockholm malmo violence',
    acledCountry: 'Sweden',
  },
  {
    id: 'greece-turkey',
    name: 'Greece-Turkey Aegean Dispute',
    lat: 38.5, lng: 26.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Turkish overflights and maritime incursions in Aegean continue. NATO allies on collision course over island sovereignty.',
    tags: ['Interstate Risk', 'NATO', 'Europe'],
    gdelt: 'greece turkey aegean dispute overflight maritime tension',
    acledCountry: 'Greece',
  },
  {
    id: 'balkans-general',
    name: 'Balkans Regional Flashpoint',
    lat: 43.5, lng: 20.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Multi-state tensions across former Yugoslavia. Russian meddling in Serbia, Bosnia, and Montenegro destabilizing EU integration.',
    tags: ['Russia', 'Balkans', 'Europe'],
    gdelt: 'balkans serbia russia destabilization tension EU',
    acledCountry: 'Serbia',
  },
  {
    id: 'poland-belarus-border',
    name: 'Poland / Belarus Hybrid War',
    lat: 52.8, lng: 23.7,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Belarus weaponizing migrants at Polish border. Sabotage and arson attacks on Polish infrastructure linked to Russian GRU.',
    tags: ['Hybrid War', 'Russia', 'NATO'],
    gdelt: 'poland belarus border hybrid war sabotage GRU migrant',
    acledCountry: 'Poland',
  },

  // ── MONITORING ────────────────────────────────────────────────
  {
    id: 'venezuela-guyana',
    name: 'Venezuela-Guyana / Essequibo',
    lat: 5.5, lng: -60.5,
    intensity: 'low', status: 'MONITORING',
    summary: 'Venezuela claims two-thirds of Guyana. Maduro referendum backed annexation. Exxon oil discovery in disputed zone raises economic stakes. Military buildup on border.',
    tags: ['Territorial Dispute', 'Americas', 'Oil'],
    gdelt: 'venezuela guyana essequibo dispute border annexation',
    acledCountry: 'Venezuela',
  },
  {
    id: 'east-china-sea',
    name: 'East China Sea / Senkaku',
    lat: 25.8, lng: 124.0,
    intensity: 'low', status: 'MONITORING',
    summary: 'China coast guard incursions near Japanese-administered Senkaku/Diaoyu Islands intensifying. Japan scrambling jets at record rates. US treaty obligations engaged.',
    tags: ['Territorial Dispute', 'China', 'Asia-Pacific'],
    gdelt: 'senkaku diaoyu japan china east china sea coast guard',
    acledCountry: 'Japan',
  },
  {
    id: 'nile-dam',
    name: 'Nile Dam Crisis',
    lat: 11.2, lng: 35.6,
    intensity: 'low', status: 'MONITORING',
    summary: 'Ethiopia filling Grand Ethiopian Renaissance Dam over Egyptian objections. Cairo has threatened military action. Sudan caught between both sides. Existential water security issue for Egypt.',
    tags: ['Water Conflict', 'Africa', 'Interstate Risk'],
    gdelt: 'nile dam GERD ethiopia egypt water conflict',
    acledCountry: 'Ethiopia',
  },
  {
    id: 'cuba',
    name: 'Cuba Economic Collapse',
    lat: 22.0, lng: -79.5,
    intensity: 'low', status: 'MONITORING',
    summary: 'Worst economic crisis since the 1990s Special Period. Power grid failing daily. Mass emigration accelerating. Regime stability under unprecedented pressure.',
    tags: ['Political Crisis', 'Americas', 'State Fragility'],
    gdelt: 'cuba economic crisis collapse protest blackout',
    acledCountry: 'Cuba',
  },
  {
    id: 'iran-internal',
    name: 'Iran / Woman Life Freedom',
    lat: 35.5, lng: 51.5,
    intensity: 'low', status: 'MONITORING',
    summary: 'Post-Mahsa Amini protest movement suppressed but not extinguished. Underground networks growing. Regime executing dissidents. New wave of protests risk following US-Israel strikes.',
    tags: ['Civil Unrest', 'Repression', 'Middle East'],
    gdelt: 'iran protest women life freedom regime crackdown',
    acledCountry: 'Iran',
  },
  {
    id: 'falklands',
    name: 'Falklands / Malvinas Tension',
    lat: -51.7, lng: -59.5,
    intensity: 'low', status: 'MONITORING',
    summary: 'Argentina under Milei reducing sovereignty rhetoric but nationalist pressure remains. UK reinforcing garrison. Oil exploration in disputed waters reigniting claims.',
    tags: ['Territorial Dispute', 'Americas', 'UK'],
    gdelt: 'falklands malvinas argentina uk dispute sovereignty',
    acledCountry: 'Argentina',
  },
  {
    id: 'cyprus',
    name: 'Cyprus / Reunification Deadlock',
    lat: 35.1, lng: 33.4,
    intensity: 'low', status: 'MONITORING',
    summary: 'UN-backed reunification talks indefinitely suspended. Turkey expanding military presence in north. Gas exploration triggering maritime standoffs with Greece.',
    tags: ['Frozen Conflict', 'Turkey', 'Europe'],
    gdelt: 'cyprus reunification deadlock turkey military gas dispute',
    acledCountry: 'Cyprus',
  },
  {
    id: 'pacific-islands',
    name: 'Pacific Islands / China Competition',
    lat: -8.0, lng: 160.0,
    intensity: 'low', status: 'MONITORING',
    summary: 'China signing security pacts with Solomon Islands, Kiribati, Nauru. US, Australia, New Zealand scrambling to counter. Strategic basing rights at stake across Melanesia and Polynesia.',
    tags: ['Geopolitical', 'China', 'Oceania'],
    gdelt: 'pacific islands china security pact solomon islands US Australia',
    acledCountry: 'Solomon Islands',
  },
  {
    id: 'aes-ecowas',
    name: 'AES Confederation vs ECOWAS',
    lat: 13.5, lng: 1.5,
    intensity: 'low', status: 'MONITORING',
    summary: 'Mali, Burkina Faso, and Niger forming Alliance of Sahel States, withdrawing from ECOWAS. Threat of military intervention by ECOWAS faded but economic sanctions biting. Russian influence expanding.',
    tags: ['Geopolitical', 'Junta', 'Africa'],
    gdelt: 'AES sahel confederation ECOWAS withdrawal sanctions mali niger burkina',
    acledCountry: 'Mali',
  },
  {
    id: 'rohingya',
    name: 'Rohingya / Cox\'s Bazar',
    lat: 21.5, lng: 92.0,
    intensity: 'low', status: 'MONITORING',
    summary: 'Over one million Rohingya in Bangladesh camps with no repatriation prospect. Camp violence by ARSA and RSO. Bangladesh under growing pressure to act. Radicalization risk elevated.',
    tags: ['Humanitarian', 'South Asia', 'Displacement'],
    gdelt: 'rohingya bangladesh coxs bazar camp violence ARSA repatriation',
    acledCountry: 'Bangladesh',
  },
  {
    id: 'armenia-csto',
    name: 'Armenia Post-CSTO',
    lat: 40.1, lng: 45.0,
    intensity: 'low', status: 'MONITORING',
    summary: 'Armenia pivoting to EU and US after withdrawing from CSTO. Russia applying economic pressure. Azerbaijan watching window for final territorial concessions. Regional balance of power shifting.',
    tags: ['Geopolitical', 'Russia', 'Caucasus'],
    gdelt: 'armenia CSTO russia withdrawal EU US pivot',
    acledCountry: 'Armenia',
  },
  {
    id: 'mongolia',
    name: 'Mongolia / Great Power Squeeze',
    lat: 47.0, lng: 104.0,
    intensity: 'low', status: 'MONITORING',
    summary: 'Mongolia landlocked between Russia and China facing coercive resource dependency. Rare earth wealth making it a target. US and EU courting as strategic buffer state.',
    tags: ['Geopolitical', 'China', 'Central Asia'],
    gdelt: 'mongolia china russia geopolitics rare earth resources',
    acledCountry: 'Mongolia',
  },
  {
    id: 'iraq-kirkuk',
    name: 'Iraq / Kirkuk Oil Dispute',
    lat: 35.5, lng: 44.4,
    intensity: 'low', status: 'MONITORING',
    summary: 'Baghdad and Erbil deadlocked over Kirkuk oil revenue sharing. Kurdish Peshmerga and Iraqi federal forces in tense standoff. Turkish pipeline politics complicating resolution.',
    tags: ['Oil', 'Ethnic Tension', 'Middle East'],
    gdelt: 'iraq kirkuk kurdish erbil baghdad oil dispute peshmerga',
    acledCountry: 'Iraq',
  },
  {
    id: 'venezuela-colombia',
    name: 'Venezuela-Colombia Border',
    lat: 7.5, lng: -72.5,
    intensity: 'low', status: 'MONITORING',
    summary: 'Guerrilla groups using Venezuela as safe haven. Irregular crossings, fuel smuggling, and paramilitaries operating freely in border zone. Diplomatic relations fragile.',
    tags: ['Narco', 'Border', 'Americas'],
    gdelt: 'venezuela colombia border guerrilla ELN smuggling',
    acledCountry: 'Colombia',
  },
  {
    id: 'mozambique-lng',
    name: 'Mozambique / LNG Conflict',
    lat: -11.5, lng: 40.7,
    intensity: 'low', status: 'MONITORING',
    summary: 'TotalEnergies Mozambique LNG project suspended since 2021. IS insurgency preventing $20bn resource extraction. SADC mission struggling. Energy-security flashpoint for Europe.',
    tags: ['Resource Conflict', 'Jihadist', 'Africa'],
    gdelt: 'mozambique LNG TotalEnergies insurgency conflict cabo delgado',
    acledCountry: 'Mozambique',
  },

  // ── EMERGING THREATS ──────────────────────────────────────────
  {
    id: 'china-philippines-scarborough',
    name: 'China / Scarborough Shoal Seizure',
    lat: 15.1, lng: 117.7,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'China coast guard blocking Philippine resupply missions at Scarborough Shoal with water cannons and laser weapons. US reaffirming MDT obligations. Risk of kinetic incident rising sharply.',
    tags: ['Maritime', 'China', 'Asia-Pacific'],
    gdelt: 'china philippines scarborough shoal water cannon coast guard seizure',
    acledCountry: 'Philippines',
  },
  {
    id: 'russia-baltics',
    name: 'Russia / Baltic Hybrid Campaign',
    lat: 59.4, lng: 24.8,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'Undersea cable cuts, GPS jamming over Helsinki and Tallinn, and arson attacks on logistics hubs. GRU-linked networks activated across Estonia, Latvia, Lithuania, and Finland.',
    tags: ['Hybrid War', 'Russia', 'NATO'],
    gdelt: 'russia baltic hybrid attack cable sabotage GPS jamming Finland Estonia',
    acledCountry: 'Estonia',
  },
  {
    id: 'is-central-africa',
    name: 'IS / Central Africa Expansion',
    lat: -1.5, lng: 29.3,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'Islamic State Central Africa Province (ISCAP) expanding from DRC into Uganda, Rwanda, and Burundi. Coordination with IS-Mozambique emerging. UN warning of new caliphate hub.',
    tags: ['Terrorism', 'IS-K', 'Africa'],
    gdelt: 'ISIS ISCAP central africa DRC uganda expansion caliphate',
    acledCountry: 'Democratic Republic of Congo',
  },
  {
    id: 'sudan-libya-spillover',
    name: 'Sudan / Libya Weapons Spillover',
    lat: 22.0, lng: 21.0,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'RSF using Libyan territory as logistics corridor. Weapons flowing from Libya into Darfur. UAE-backed arms pipeline accelerating. Risk of Sudan-Libya conflict fusion.',
    tags: ['Civil War', 'Spillover', 'Africa'],
    gdelt: 'sudan RSF libya weapons spillover darfur UAE arms',
    acledCountry: 'Sudan',
  },
  {
    id: 'hamas-westbank-rebuild',
    name: 'Hamas / West Bank Reorganization',
    lat: 32.5, lng: 35.3,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'Hamas rebuilding command structure in West Bank following Gaza war. Iran re-supplying via Jordan. Israeli military intelligence warning of coordinated second front risk within 12 months.',
    tags: ['Terrorism', 'Hamas', 'Middle East'],
    gdelt: 'hamas west bank rebuild iran weapons second front attack',
    acledCountry: 'Palestine',
  },
  {
    id: 'iran-nuclear-restart',
    name: 'Iran / Nuclear Threshold',
    lat: 33.7, lng: 51.6,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'Despite US-Israeli strikes, Iran accelerating uranium enrichment at dispersed undisclosed sites. IAEA access fully revoked. Intelligence assessments diverging on 6-12 month breakout timeline.',
    tags: ['Nuclear', 'Middle East', 'US Involved'],
    gdelt: 'iran nuclear enrichment breakout IAEA uranium threshold',
    acledCountry: 'Iran',
  },
  {
    id: 'china-taiwan-2026',
    name: 'China / Taiwan War Signals',
    lat: 25.0, lng: 121.5,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'PLA cyber intrusions into Taiwan power grid and financial systems spiking. PLAAF flying combat-configured sorties. US intelligence circulating classified assessment of elevated near-term invasion risk.',
    tags: ['China', 'Cyber', 'Asia-Pacific'],
    gdelt: 'china taiwan PLA invasion risk cyber attack military 2026',
    acledCountry: 'Taiwan',
  },
  {
    id: 'sahel-coastal-spread',
    name: 'Sahel Jihadists / Coastal Push',
    lat: 8.5, lng: 1.2,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'JNIM and ISGS pushing into coastal West African states. Attacks reaching Accra suburbs and Abidjan outskirts. Traditional coastal security cordon collapsing. ECOWAS emergency summit called.',
    tags: ['Jihadist', 'Spillover', 'Africa'],
    gdelt: 'JNIM ISGS jihadist coastal west africa ghana ivory coast attack spreading',
    acledCountry: 'Ghana',
  },
  {
    id: 'russia-georgia-2026',
    name: 'Russia / Georgia Annexation Risk',
    lat: 42.2, lng: 44.0,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'Pro-Russian Georgian Dream government passing laws mirroring pre-annexation Crimea playbook. Russian troops in South Ossetia and Abkhazia reinforced. Opposition leaders arrested. EU accession suspended.',
    tags: ['Russia', 'Political Crisis', 'Caucasus'],
    gdelt: 'georgia russia annexation risk Georgian Dream south ossetia opposition',
    acledCountry: 'Georgia',
  },
  {
    id: 'north-korea-deployment',
    name: 'North Korea / Troops in Russia',
    lat: 51.5, lng: 35.2,
    intensity: 'emerging', status: 'EMERGING',
    summary: 'Over 10,000 North Korean troops deployed in Russia\'s Kursk and Zaporizhzhia fronts. Combat experience flowing back to Pyongyang. Kim demanding advanced missile and satellite technology in exchange.',
    tags: ['North Korea', 'Russia', 'Asia-Pacific'],
    gdelt: 'north korea troops russia deployment kursk ukraine combat',
    acledCountry: 'North Korea',
  },
];


const DIPLO_SEED = [
  { title: 'Putin meets with Witkoff and Kushner for five hours with no breakthrough', url: 'https://www.nbcnews.com/world/ukraine/russia-ukraine-moscow-peace-talk-putin-witkoff-kushner-zelenskyy-rcna246712', source: 'NBC News', date: '20260320' },
  { title: 'Gaza ceasefire talks at a "critical moment" as second phase yet to begin', url: 'https://www.cbsnews.com/news/gaza-ceasefire-talks-critical-moment-second-phase-israel-hamas/', source: 'CBS News', date: '20260318' },
  { title: 'Oman says it mediated a ceasefire between US and Yemen\'s Houthis', url: 'https://www.nbcnews.com/world/yemen/oman-says-mediated-ceasefire-us-yemens-houthis-rcna205175', source: 'NBC News', date: '20260321' },
  { title: 'Peace agreement between the DRC and the Republic of Rwanda', url: 'https://www.state.gov/peace-agreement-between-the-democratic-republic-of-the-congo-and-the-republic-of-rwanda', source: 'US State Dept', date: '20260319' },
  { title: 'Sudan crisis: UN launches $1.6 billion appeal to support refugees in seven countries', url: 'https://news.un.org/en/story/2026/02/1166979', source: 'UN News', date: '20260218' },
  { title: 'Handshake in Dhaka: Can India and Pakistan revive ties in 2026?', url: 'https://www.aljazeera.com/news/2026/1/2/handshake-in-dhaka-can-india-and-pakistan-revive-ties-in-2026', source: 'Al Jazeera', date: '20260102' },
  { title: 'Armenia and Azerbaijan hold border delimitation talks', url: 'https://oc-media.org/armenia-and-azerbaijan-hold-border-delimitation-talks-in-azerbaijan/', source: 'OC Media', date: '20260315' },
  { title: 'The Armenia-Azerbaijan peace process enters 2026', url: 'https://www.cacianalyst.org/publications/analytical-articles/item/13917-the-armenia-azerbaijan-peace-process-enters-2026.html', source: 'CACI Analyst', date: '20260110' },
];

type Article = { title: string; url: string; source: string; date: string; };
type TickerItem = { title: string; url: string; };
type Spike = { country: string; count: number; trend: string; };

export default function ConflictTracker() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<typeof CONFLICTS[0] | null>(CONFLICTS[0]);
  const [news, setNews] = useState<Article[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [lastUpdated, setLastUpdated] = useState('');

  // Ticker
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [tickerLoading, setTickerLoading] = useState(true);

  // Global news feed
  const [globalNews, setGlobalNews] = useState<Article[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalPage, setGlobalPage] = useState(0);

  // GDELT spikes / emerging threats
  const [spikes, setSpikes] = useState<Spike[]>([]);
  const [spikesLoading, setSpikesLoading] = useState(true);

  // ACLED counts
  const [acledData, setAcledData] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [drillRegion, setDrillRegion] = useState<string | null>(null);

  // Pentagon Pizza Tracker / DoD activity
  const [dodIndex, setDodIndex] = useState(0);
  const [dodArticles, setDodArticles] = useState<Article[]>([]);
  const [dodLoading, setDodLoading] = useState(true);


  // ── Leaflet init ──────────────────────────────────────────────
  useEffect(() => {
    const initMap = () => {
      if (leafletMap.current || !mapRef.current) return;
      const L = (window as any).L;
      if (!L) return;
      const map = L.map(mapRef.current, { center: [20, 20], zoom: 2, zoomControl: false, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      leafletMap.current = map;
      renderMarkers(map, L);
    };
    if ((window as any).L) { initMap(); return; }
    const script = document.querySelector('script[src*="leaflet"]') as HTMLScriptElement;
    if (script) {
      script.addEventListener('load', initMap);
      return () => script.removeEventListener('load', initMap);
    }
  }, []);

  function renderMarkers(map: any, L: any) {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    const visible = CONFLICTS.filter(c => filter === 'all' || c.intensity === filter);
    visible.forEach(c => {
      const color = c.intensity === 'high' ? '#ff3a3a' : c.intensity === 'medium' ? '#ffaa00' : c.intensity === 'emerging' ? '#c084fc' : '#1e9eff';
      const size = c.intensity === 'high' ? 14 : c.intensity === 'medium' ? 10 : c.intensity === 'emerging' ? 11 : 8;
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:${size}px;height:${size}px;">
          <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color};animation:markerPulse 2s infinite;"></div>
          <div style="position:absolute;inset:-6px;border-radius:50%;border:1px solid ${color};opacity:0.4;animation:markerRing 2s infinite;"></div>
        </div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([c.lat, c.lng], { icon })
        .addTo(map)
        .bindTooltip(c.name, { direction: 'top', className: 'map-tooltip', offset: [0, -8] })
        .on('click', () => { setSelected(c); fetchConflictNews(c); });
      markersRef.current.push(marker);
    });
  }

  useEffect(() => {
    if (!leafletMap.current) return;
    const L = (window as any).L;
    if (L) renderMarkers(leafletMap.current, L);
  }, [filter]);

  // Diplomatic wire
  const [diplo, setDiplo] = useState<Article[]>([]);
  const [diploLoading, setDiploLoading] = useState(true);

  // ── Fetch conflict-specific news ─────────────────────────────
  const fetchConflictNews = useCallback(async (conflict: typeof CONFLICTS[0]) => {
    setNewsLoading(true);
    setNews([]);
    try {
      const q = encodeURIComponent(conflict.gdelt);
      const r = await fetch(`/api/osint/gdelt?q=${q}`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setNews((data.articles || []).slice(0, 8).map((a: any) => ({
        title: a.title || '—', url: a.url || '#',
        source: a.domain || '—', date: a.seendate ? a.seendate.slice(0, 8) : '—',
      })));
    } catch { setNews([]); }
    finally { setNewsLoading(false); setLastUpdated(new Date().toLocaleTimeString()); }
  }, []);

  // ── Fetch ticker headlines ────────────────────────────────────
  const fetchTicker = useCallback(async () => {
    try {
      const r = await fetch('/api/osint/gdelt?q=war+conflict+military+attack&maxrecords=20');
      if (!r.ok) throw new Error();
      const data = await r.json();
      setTickerItems((data.articles || []).slice(0, 20).map((a: any) => ({ title: a.title || '', url: a.url || '#' })));
    } catch {} finally { setTickerLoading(false); }
  }, []);

  // ── Fetch global news feed ────────────────────────────────────
  const fetchGlobalNews = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const r = await fetch('/api/osint/gdelt?q=conflict+war+military+strike+attack&maxrecords=30&timespan=24h');
      if (!r.ok) throw new Error();
      const data = await r.json();
      setGlobalNews((data.articles || []).slice(0, 30).map((a: any) => ({
        title: a.title || '—', url: a.url || '#',
        source: a.domain || '—', date: a.seendate ? a.seendate.slice(0, 8) : '—',
      })));
    } catch { setGlobalNews([]); } finally { setGlobalLoading(false); }
  }, []);

  // ── Fetch GDELT spikes ────────────────────────────────────────
  const fetchSpikes = useCallback(async () => {
    setSpikesLoading(true);
    try {
      const queries = ['conflict escalation emerging threat 2026', 'new war outbreak military 2026'];
      const results: Spike[] = [];
      for (const q of queries) {
        const r = await fetch(`/api/osint/gdelt?q=${encodeURIComponent(q)}&maxrecords=10&timespan=48h`);
        if (!r.ok) continue;
        const data = await r.json();
        const arts = data.articles || [];
        // Group by country/source
        const countryMap: Record<string, number> = {};
        arts.forEach((a: any) => {
          const c = a.sourcecountry || a.socialimage || 'Unknown';
          countryMap[c] = (countryMap[c] || 0) + 1;
        });
        Object.entries(countryMap).forEach(([country, count]) => {
          if (count >= 1 && !CONFLICTS.find(c => c.acledCountry?.toLowerCase().includes(country.toLowerCase()))) {
            results.push({ country, count: count as number, trend: '↑' });
          }
        });
      }
      // Dedupe and sort
      const seen = new Set<string>();
      const deduped = results.filter(s => {
        if (seen.has(s.country)) return false;
        seen.add(s.country);
        return true;
      }).sort((a, b) => b.count - a.count).slice(0, 8);
      setSpikes(deduped);
    } catch { setSpikes([]); } finally { setSpikesLoading(false); }
  }, []);

  // ── Fetch DoD / Pentagon activity ────────────────────────────
  const fetchDodActivity = useCallback(async () => {
    try {
      const r = await fetch('/api/osint/gdelt?q=pentagon+department+defense+secretary+military+briefing&maxrecords=20&timespan=24h');
      if (!r.ok) throw new Error();
      const data = await r.json();
      const arts = data.articles || [];
      setDodIndex(Math.min(100, Math.round((arts.length / 20) * 100)));
      setDodArticles(arts.slice(0, 5).map((a: any) => ({
        title: a.title || '—', url: a.url || '#',
        source: a.domain || '—', date: a.seendate ? a.seendate.slice(0, 8) : '—',
      })));
    } catch {} finally { setDodLoading(false); }
  }, []);


  // ── Fetch diplomatic wire ─────────────────────────────────────
  const fetchDiplo = useCallback(async () => {
    try {
      const r = await fetch('/api/osint/gdelt?q=ceasefire+peace+talks+negotiations+UN+resolution+diplomacy+agreement&maxrecords=15&timespan=48h');
      if (!r.ok) throw new Error();
      const data = await r.json();
      setDiplo((data.articles || []).slice(0, 8).map((a: any) => ({
        title: a.title || '—', url: a.url || '#',
        source: a.domain || '—', date: a.seendate ? a.seendate.slice(0, 8) : '—',
      })));
    } catch {} finally { setDiploLoading(false); }
  }, []);

  // ── Fetch ACLED data ──────────────────────────────────────────
  const fetchAcled = useCallback(async () => {
    try {
      const r = await fetch('/api/osint/acled');
      if (!r.ok) throw new Error();
      const data = await r.json();
      setAcledData(data);
    } catch {}
  }, []);

  // ── Initial loads + auto-refresh ─────────────────────────────
useEffect(() => {
  if (selected) fetchConflictNews(selected);
  
  fetchTicker();
  setTimeout(() => fetchGlobalNews(), 2000);
  setTimeout(() => fetchSpikes(), 4000);
  setTimeout(() => fetchDodActivity(), 3000);
  setTimeout(() => fetchDiplo(), 6000);
  fetchAcled();

  const tickerInterval = setInterval(fetchTicker, 5 * 60 * 1000);
  const newsInterval = setInterval(fetchGlobalNews, 10 * 60 * 1000);
  const spikesInterval = setInterval(fetchSpikes, 15 * 60 * 1000);
  const diploInterval = setInterval(fetchDiplo, 20 * 60 * 1000);
  return () => { clearInterval(tickerInterval); clearInterval(newsInterval); clearInterval(spikesInterval); clearInterval(diploInterval); };
}, []);

  const getRegion = (tags: string[]) => {
    if (tags.some(t => ['Africa'].includes(t))) return 'Africa';
    if (tags.some(t => ['Middle East', 'Gulf'].includes(t))) return 'Middle East';
    if (tags.some(t => ['Europe', 'Balkans', 'Caucasus', 'Scandinavia'].includes(t))) return 'Europe';
    if (tags.some(t => ['South Asia', 'Asia-Pacific', 'Central Asia', 'Asia'].includes(t))) return 'Asia';
    if (tags.some(t => ['Americas', 'Caribbean', 'North America'].includes(t))) return 'Americas';
    return 'Other';
  };
  const visible = CONFLICTS.filter(c => {
    if (filter !== 'all' && c.intensity !== filter) return false;
    if (regionFilter !== 'all' && getRegion(c.tags) !== regionFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });
  const pagedNews = globalNews.slice(globalPage * 10, globalPage * 10 + 10);
  const totalPages = Math.ceil(globalNews.length / 10);

  const CHART_REGIONS = ['Africa', 'Middle East', 'Europe', 'Asia', 'Americas'];
  const regionCounts = CHART_REGIONS.map(r => ({
    region: r, short: r === 'Middle East' ? 'M.East' : r,
    high: CONFLICTS.filter(c => getRegion(c.tags) === r && c.intensity === 'high').length,
    medium: CONFLICTS.filter(c => getRegion(c.tags) === r && c.intensity === 'medium').length,
  }));
  const chartMax = Math.max(...regionCounts.map(r => r.high + r.medium));

  const dodLevel = dodIndex < 35 ? { label: 'NORMAL', color: '#00ff88' } : dodIndex < 70 ? { label: 'ELEVATED', color: '#ffaa00' } : { label: 'HIGH ALERT', color: '#ff3a3a' };

  const hotConflicts = useMemo(() => {
    if (!globalNews.length) return [];
    const scores: Record<string, number> = {};
    globalNews.forEach(a => {
      const title = a.title.toLowerCase();
      CONFLICTS.forEach(c => {
        const keywords = [
          c.acledCountry.toLowerCase(),
          c.name.toLowerCase().split('/')[0].trim(),
          ...c.tags.map(t => t.toLowerCase()),
        ];
        if (keywords.some(kw => kw.length > 3 && title.includes(kw))) {
          scores[c.id] = (scores[c.id] || 0) + 1;
        }
      });
    });
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([id, count]) => ({ conflict: CONFLICTS.find(c => c.id === id)!, count }))
      .filter(x => x.conflict);
  }, [globalNews]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }

        /* NAV */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 0 40px; height: 64px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.1); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #7a9bb5; text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: #c0cfe0; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 36px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        /* TICKER */
        .ticker-wrap { position: sticky; top: 63px; z-index: 99; border-bottom: 1px solid rgba(255,58,58,0.15); background: rgba(3,6,8,0.97); padding: 8px 0; overflow: hidden; backdrop-filter: blur(10px); }
        .ticker-label { position: absolute; left: 0; top: 0; bottom: 0; background: #ff3a3a; display: flex; align-items: center; padding: 0 18px; font-family: 'Barlow Condensed', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 3px; color: #000; z-index: 2; text-transform: uppercase; white-space: nowrap; }
        .ticker-track { display: flex; animation: ticker 60s linear infinite; padding-left: 130px; }
        .ticker-track:hover { animation-play-state: paused; }
        .ticker-item { white-space: nowrap; font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #7a9bb5; letter-spacing: 1px; padding: 0 36px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .ticker-item:hover { color: #ff3a3a; }
        .ticker-item::after { content: '//'; color: rgba(255,58,58,0.35); }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        .page-wrap { padding-top: 64px; min-height: 100vh; display: flex; flex-direction: column; }
        .back-bar { padding: 10px 40px; border-bottom: 1px solid rgba(30,158,255,0.07); display: flex; align-items: center; justify-content: space-between; background: rgba(7,13,18,0.6); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: #1e9eff; }
        .live-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
        .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #1e9eff; box-shadow: 0 0 6px #1e9eff; animation: blink 2s infinite; }

        /* HERO */
        .tool-hero { padding: 28px 40px 22px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .tool-hero-inner { max-width: 1500px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .tool-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #ff3a3a; text-transform: uppercase; margin-bottom: 8px; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(22px, 2.8vw, 38px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .tool-desc { font-size: 13px; color: #7a9bb5; line-height: 1.6; max-width: 560px; }
        .hero-stats { display: flex; gap: 28px; flex-shrink: 0; }
        .hero-stat { text-align: center; padding: 12px 20px; border: 1px solid rgba(30,158,255,0.1); background: rgba(7,13,18,0.8); }
        .hero-stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 700; line-height: 1; }
        .hero-stat-num.red { color: #ff3a3a; }
        .hero-stat-num.orange { color: #ffaa00; }
        .hero-stat-num.blue { color: #1e9eff; }
        .hero-stat-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-top: 4px; }

        /* FILTERS */
        .filters { padding: 12px 40px; max-width: 1500px; margin: 0 auto; width: 100%; display: flex; gap: 6px; align-items: center; }
        .filter-btn { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; background: rgba(7,13,18,0.8); border: 1px solid rgba(30,158,255,0.08); padding: 7px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
        .filter-btn:hover { color: #c0cfe0; border-color: rgba(30,158,255,0.25); }
        .filter-btn.active { color: #ff3a3a; border-color: rgba(255,58,58,0.4); background: rgba(255,58,58,0.05); }
        .filter-btn.active-orange { color: #ffaa00; border-color: rgba(255,170,0,0.4); background: rgba(255,170,0,0.05); }
        .filter-btn.active-blue { color: #1e9eff; border-color: rgba(30,158,255,0.4); background: rgba(30,158,255,0.06); }
        .filter-btn.active-purple { color: #c084fc; border-color: rgba(192,132,252,0.4); background: rgba(192,132,252,0.06); }

        /* MAIN MAP LAYOUT */
        .main-layout { display: grid; grid-template-columns: 290px 1fr 310px; gap: 10px; padding: 12px 40px; max-width: 1500px; margin: 0 auto; width: 100%; align-items: start; }

        /* CONFLICT LIST */
        .conflict-list { border: 1px solid rgba(30,158,255,0.08); border-top: 2px solid rgba(255,58,58,0.4); overflow-y: auto; max-height: 560px; background: #070d12; }
        .conflict-item { padding: 11px 16px; border-bottom: 1px solid rgba(30,158,255,0.05); cursor: pointer; transition: background 0.15s; }
        .conflict-item:hover { background: rgba(30,158,255,0.04); }
        .conflict-item.active { background: rgba(30,158,255,0.06); border-left: 3px solid #ff3a3a; padding-left: 13px; }
        .conflict-item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .conflict-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: #c0cfe0; line-height: 1.2; }
        .intensity-badge { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1.5px; padding: 2px 5px; text-transform: uppercase; flex-shrink: 0; }
        .intensity-high { color: #ff3a3a; border: 1px solid rgba(255,58,58,0.35); background: rgba(255,58,58,0.07); }
        .intensity-medium { color: #ffaa00; border: 1px solid rgba(255,170,0,0.35); background: rgba(255,170,0,0.07); }
        .intensity-low { color: #1e9eff; border: 1px solid rgba(30,158,255,0.35); background: rgba(30,158,255,0.07); }
        .intensity-emerging { color: #c084fc; border: 1px solid rgba(192,132,252,0.35); background: rgba(192,132,252,0.07); }
        .conflict-status { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1.5px; color: #5a7a94; text-transform: uppercase; margin-bottom: 5px; }
        .conflict-acled { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #1e9eff; margin-bottom: 5px; }
        .conflict-tags { display: flex; flex-wrap: wrap; gap: 3px; }
        .conflict-tag { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #5a7a94; border: 1px solid rgba(30,158,255,0.07); padding: 1px 4px; }
        .conflict-search { width: 100%; background: #060c12; border: none; border-bottom: 1px solid rgba(30,158,255,0.1); outline: none; padding: 11px 16px; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; color: #c0cfe0; letter-spacing: 0.5px; }
        .conflict-search::placeholder { color: #5a7a94; }
        .region-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid rgba(30,158,255,0.06); scrollbar-width: none; background: rgba(6,12,18,0.6); }
        .region-tabs::-webkit-scrollbar { display: none; }
        .region-tab { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1.5px; color: #5a7a94; background: none; border: none; border-bottom: 2px solid transparent; padding: 7px 10px; cursor: pointer; text-transform: uppercase; white-space: nowrap; transition: all 0.2s; }
        .region-tab:hover { color: #1e9eff; }
        .region-tab.active { color: #1e9eff; border-bottom-color: #1e9eff; }
        .conflict-count { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1.5px; color: #5a7a94; padding: 5px 16px; border-bottom: 1px solid rgba(30,158,255,0.05); background: rgba(6,12,18,0.4); }

        /* MAP */
        .map-wrap { position: relative; border: 1px solid rgba(30,158,255,0.08); }
        #conflict-map { width: 100%; height: 560px; background: #030608; }
        .map-overlay { position: absolute; top: 10px; left: 10px; z-index: 500; }
        .map-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; background: rgba(3,6,8,0.9); border: 1px solid rgba(30,158,255,0.2); padding: 5px 10px; }
        .map-legend { position: absolute; bottom: 10px; left: 10px; z-index: 500; background: rgba(3,6,8,0.88); border: 1px solid rgba(30,158,255,0.1); padding: 8px 12px; display: flex; flex-direction: column; gap: 5px; }
        .legend-item { display: flex; align-items: center; gap: 7px; font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1.5px; color: #7a9bb5; text-transform: uppercase; }
        .legend-dot { width: 7px; height: 7px; border-radius: 50%; }

        /* RIGHT DETAIL PANEL */
        .right-panel { max-height: 560px; overflow-y: auto; border: 1px solid rgba(30,158,255,0.08); border-top: 2px solid rgba(30,158,255,0.3); background: #070d12; }
        .detail-panel { background: #070d12; }
        .detail-header { padding: 16px 18px; border-bottom: 1px solid rgba(30,158,255,0.07); }
        .detail-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #ff3a3a; text-transform: uppercase; margin-bottom: 7px; }
        .detail-name { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; line-height: 1.2; }
        .detail-summary { font-size: 12px; color: #7a9bb5; line-height: 1.65; margin-bottom: 10px; }
        .detail-tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .detail-tag { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #1e9eff; border: 1px solid rgba(30,158,255,0.18); padding: 2px 6px; }
        .detail-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; border-top: 1px solid rgba(30,158,255,0.07); border-bottom: 1px solid rgba(30,158,255,0.07); background: rgba(30,158,255,0.03); margin: 0 0 1px; }
        .detail-fact { padding: 9px 16px; background: #070d12; }
        .detail-fact-label { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-bottom: 3px; }
        .detail-fact-value { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #c0cfe0; }
        .detail-fact-value.red { color: #ff3a3a; }
        .detail-fact-value.orange { color: #ffaa00; }
        .detail-fact-value.blue { color: #1e9eff; }
        .news-section { padding: 12px 18px; }
        .news-section-title { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
        .news-updated { color: #1e9eff; font-size: 8px; }
        .news-item { padding: 9px 0; border-bottom: 1px solid rgba(30,158,255,0.05); }
        .news-item:last-child { border-bottom: none; }
        .news-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; color: #c0cfe0; line-height: 1.3; margin-bottom: 3px; text-decoration: none; display: block; transition: color 0.2s; }
        .news-title:hover { color: #1e9eff; }
        .news-meta { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #5a7a94; }
        .news-empty { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-align: center; padding: 18px 0; }
        .news-loading { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #1e9eff; text-align: center; padding: 18px 0; animation: blink 1s infinite; }

        /* RELATED CONFLICTS */
        .related-section { padding: 10px 18px 14px; border-top: 1px solid rgba(30,158,255,0.06); }
        .related-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; margin-bottom: 3px; border: 1px solid rgba(30,158,255,0.06); cursor: pointer; transition: all 0.15s; }
        .related-item:hover { background: rgba(30,158,255,0.05); border-color: rgba(30,158,255,0.18); }
        .related-name { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; color: #9ab0c4; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .related-tag { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #5a7a94; border: 1px solid rgba(30,158,255,0.08); padding: 1px 5px; white-space: nowrap; }

        /* BOTTOM SECTION — 3 columns */
        .bottom-section { max-width: 1500px; margin: 0 auto; padding: 0 40px 12px; width: 100%; display: grid; grid-template-columns: 1fr 1fr 360px; gap: 10px; align-items: start; }

        /* SHARED PANEL */
        .panel { border: 1px solid rgba(30,158,255,0.08); background: #070d12; }
        .panel-header { padding: 14px 18px; border-bottom: 1px solid rgba(30,158,255,0.07); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #c0cfe0; letter-spacing: 1.5px; text-transform: uppercase; }
        .panel-subtitle { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-top: 2px; }
        .panel-status { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; flex-shrink: 0; }
        .global-feed { border: 1px solid rgba(30,158,255,0.08); background: #070d12; }
        .feed-item { padding: 11px 18px; border-bottom: 1px solid rgba(30,158,255,0.05); transition: background 0.15s; }
        .feed-item:hover { background: rgba(30,158,255,0.04); }
        .feed-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; color: #c0cfe0; line-height: 1.3; margin-bottom: 3px; text-decoration: none; display: block; transition: color 0.2s; }
        .feed-title:hover { color: #ffaa00; }
        .feed-meta { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #5a7a94; }

        /* PIZZA TRACKER */
        .pizza-meter { height: 7px; background: rgba(30,158,255,0.07); border: 1px solid rgba(30,158,255,0.1); margin-bottom: 6px; }
        .pizza-meter-fill { height: 100%; transition: width 1s ease; }
        .pizza-meter-zone { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #5a7a94; text-transform: uppercase; }
        .pizza-level { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 900; letter-spacing: 2px; }
        .pizza-index { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1.5px; color: #5a7a94; margin-top: 2px; }

        /* INTEL PANEL (regional chart) */
        .intel-panel { border: 1px solid rgba(30,158,255,0.08); background: #070d12; }
        .chart-wrap { padding: 14px 18px 10px; }
        .chart-bar-group { display: flex; flex-direction: column; gap: 9px; }
        .chart-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .chart-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #5a7a94; width: 48px; flex-shrink: 0; text-transform: uppercase; text-align: right; }
        .chart-bars { flex: 1; display: flex; height: 16px; gap: 1px; }
        .chart-seg-high { background: #ff3a3a; height: 100%; transition: width 0.6s ease; }
        .chart-seg-med { background: #ffaa00; height: 100%; transition: width 0.6s ease; }
        .chart-count { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #5a7a94; width: 20px; flex-shrink: 0; }
        .chart-legend { display: flex; gap: 14px; padding: 8px 18px; border-top: 1px solid rgba(30,158,255,0.06); }
        .chart-legend-item { display: flex; align-items: center; gap: 5px; font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #5a7a94; text-transform: uppercase; }
        .chart-legend-dot { width: 8px; height: 8px; flex-shrink: 0; }
        .chart-region-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 18px; border-bottom: 1px solid rgba(30,158,255,0.05); cursor: pointer; transition: background 0.15s; }
        .chart-region-row:hover { background: rgba(30,158,255,0.04); }
        .chart-region-row.active { background: rgba(30,158,255,0.07); border-left: 2px solid #1e9eff; padding-left: 16px; }
        .chart-region-name { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #c0cfe0; }
        .chart-region-counts { display: flex; gap: 10px; align-items: center; }
        .chart-region-arrow { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #5a7a94; margin-left: 4px; transition: transform 0.2s; }
        .chart-region-arrow.open { transform: rotate(90deg); }
        .drill-panel { background: rgba(6,12,18,0.7); border-bottom: 1px solid rgba(30,158,255,0.07); max-height: 280px; overflow-y: auto; }
        .drill-conflict { padding: 9px 18px 9px 26px; border-bottom: 1px solid rgba(30,158,255,0.04); cursor: pointer; transition: background 0.15s; }
        .drill-conflict:hover { background: rgba(30,158,255,0.04); }
        .drill-conflict-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; gap: 8px; }
        .drill-conflict-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: #c0cfe0; }
        .drill-summary { font-family: 'Barlow', sans-serif; font-size: 11px; color: #4a6a80; line-height: 1.4; }

        /* HOT RIGHT NOW */
        .hot-panel { border: 1px solid rgba(30,158,255,0.08); border-top: 2px solid rgba(30,158,255,0.3); background: #070d12; }
        .hot-item { padding: 10px 16px; border-bottom: 1px solid rgba(30,158,255,0.05); cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 10px; }
        .hot-item:hover { background: rgba(30,158,255,0.04); }
        .hot-rank { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #5a7a94; width: 14px; flex-shrink: 0; }
        .hot-bar-wrap { flex: 1; height: 3px; background: rgba(30,158,255,0.06); overflow: hidden; }
        .hot-bar { height: 100%; transition: width 0.6s ease; }
        .hot-name { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; color: #c0cfe0; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hot-count { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #5a7a94; flex-shrink: 0; }

        /* ACLED */
        .stats-panel { border: 1px solid rgba(30,158,255,0.08); background: #070d12; }
        .stat-row { padding: 10px 18px; border-bottom: 1px solid rgba(30,158,255,0.05); display: flex; align-items: center; justify-content: space-between; }
        .stat-country { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; color: #c0cfe0; }
        .stat-value { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #ff3a3a; }
        .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #5a7a94; text-align: right; }

        /* DIPLOMATIC WIRE ROW */
        .diplo-row { max-width: 1500px; margin: 0 auto; padding: 0 40px 40px; width: 100%; }
        .diplo-row-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 0 10px; border-top: 1px solid rgba(0,255,136,0.12); margin-bottom: 8px; }
        .diplo-row-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }
        .diplo-row-dot { width: 7px; height: 7px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 8px #00ff88; animation: blink 2s infinite; flex-shrink: 0; }
        .diplo-row-sub { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }
        .diplo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .diplo-card { border: 1px solid rgba(0,255,136,0.09); border-top: 2px solid rgba(0,255,136,0.25); background: #070d12; padding: 14px 16px; transition: background 0.15s; display: flex; flex-direction: column; gap: 8px; }
        .diplo-card:hover { background: rgba(0,255,136,0.03); border-top-color: rgba(0,255,136,0.5); }
        .diplo-dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #00ff88; margin-right: 7px; box-shadow: 0 0 4px #00ff88; flex-shrink: 0; }
        .diplo-link { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; color: #c0cfe0; text-decoration: none; line-height: 1.4; display: block; transition: color 0.2s; flex: 1; }
        .diplo-link:hover { color: #00ff88; }
        .diplo-meta { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #5a7a94; }

        /* FOOTER */
        footer { border-top: 1px solid rgba(30,158,255,0.08); padding: 24px 40px; background: #070d12; margin-top: auto; }
        .footer-bottom { max-width: 1500px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; }
        .footer-class { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; border: 1px solid rgba(30,158,255,0.1); padding: 3px 10px; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes markerPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.2); } }
        @keyframes markerRing { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.5); opacity: 0; } }

        .leaflet-container { background: #030608 !important; }
        .leaflet-control-zoom a { background: #0a1520 !important; color: #1e9eff !important; border-color: rgba(30,158,255,0.15) !important; }
        .map-tooltip { background: #071018 !important; border: 1px solid rgba(30,158,255,0.35) !important; border-radius: 0 !important; color: #c0cfe0 !important; font-family: 'Barlow Condensed', sans-serif !important; font-size: 12px !important; font-weight: 700 !important; letter-spacing: 1px !important; padding: 4px 10px !important; box-shadow: 0 0 10px rgba(30,158,255,0.12) !important; }
        .map-tooltip::before { display: none !important; }

        @media (max-width: 1200px) {
          .main-layout { grid-template-columns: 1fr; padding: 10px 16px; }
          .bottom-section { grid-template-columns: 1fr; padding-left: 16px; padding-right: 16px; }
          .diplo-row { padding-left: 16px; padding-right: 16px; }
          .diplo-grid { grid-template-columns: 1fr 1fr; }
          #conflict-map { height: 360px; }
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .tool-hero { padding: 20px 16px; }
          .filters { padding: 10px 16px; }
        }
        @media (max-width: 640px) {
          .diplo-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 8px; }
        }
      `}</style>

      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" async />

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('conflictMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="conflictMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('conflictMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/cybersecurity">Cybersecurity</a><a href="/about">About</a>
        </div>

        {/* LIVE TICKER */}
        <div className="ticker-wrap">
          <div className="ticker-label">CONFLICT FEED</div>
          {!tickerLoading && tickerItems.length > 0 && (
            <div className="ticker-track" ref={tickerRef}>
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <a key={i} className="ticker-item" href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              ))}
            </div>
          )}
          {tickerLoading && (
            <div style={{ paddingLeft: 160, fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: '#5a7a94', letterSpacing: 2, animation: 'blink 1s infinite' }}>
              Pulling live feed...
            </div>
          )}
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
          <div className="live-badge"><div className="live-dot" /> Live — GDELT + ACLED + Curated Zones</div>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div>
              <div className="tool-eyebrow">OSINT Hub — Conflict Intelligence</div>
              <div className="tool-title">Conflict Tracker</div>
              <p className="tool-desc">A live map of active conflict zones pulling from global news feeds, ACLED incident reports, and GDELT's worldwide media index. Track where violence is escalating, where ceasefires are holding, and where the next flashpoint may emerge — updated every 5 minutes.</p>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num red">{CONFLICTS.filter(c => c.intensity === 'high').length}</div>
                <div className="hero-stat-label">High Intensity</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num orange">{CONFLICTS.filter(c => c.intensity === 'medium').length}</div>
                <div className="hero-stat-label">Elevated</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num" style={{color:'#c084fc'}}>{CONFLICTS.filter(c => c.intensity === 'emerging').length}</div>
                <div className="hero-stat-label">Emerging</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num blue">{CONFLICTS.filter(c => c.intensity === 'low').length}</div>
                <div className="hero-stat-label">Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        <div className="filters">
          {[
            { key: 'all', label: 'All Zones', cls: 'active-blue' },
            { key: 'high', label: 'High Intensity', cls: 'active' },
            { key: 'medium', label: 'Elevated', cls: 'active-orange' },
            { key: 'low', label: 'Monitoring', cls: 'active-blue' },
            { key: 'emerging', label: 'Emerging Threats', cls: 'active-purple' },
          ].map(f => (
            <button key={f.key} className={`filter-btn ${filter === f.key ? f.cls : ''}`} onClick={() => setFilter(f.key as any)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* MAP ROW */}
        <div className="main-layout">
          {/* Left list */}
          <div className="conflict-list">
            <input
              className="conflict-search"
              placeholder="Search conflicts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="region-tabs">
              {['all','Africa','Middle East','Europe','Asia','Americas'].map(r => (
                <button key={r} className={`region-tab${regionFilter === r ? ' active' : ''}`} onClick={() => setRegionFilter(r)}>
                  {r === 'all' ? 'All Regions' : r}
                </button>
              ))}
            </div>
            <div className="conflict-count">{visible.length} conflicts</div>
            {visible.map(c => (
              <div key={c.id} className={`conflict-item ${selected?.id === c.id ? 'active' : ''}`}
                onClick={() => { setSelected(c); fetchConflictNews(c); }}>
                <div className="conflict-item-header">
                  <div className="conflict-name">{c.name}</div>
                  <div className={`intensity-badge intensity-${c.intensity}`}>{c.intensity}</div>
                </div>
                <div className="conflict-status">● {c.status}</div>
                {acledData[c.acledCountry] && (
                  <div className="conflict-acled">{acledData[c.acledCountry]} incidents / 30d</div>
                )}
                <div className="conflict-tags">{c.tags.map(t => <span key={t} className="conflict-tag">{t}</span>)}</div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="map-wrap">
            <div className="map-overlay"><div className="map-label">Live Conflict Map</div></div>
            <div id="conflict-map" ref={mapRef} />
            <div className="map-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#ff3a3a', boxShadow: '0 0 6px #ff3a3a' }} /> High Intensity</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#ffaa00', boxShadow: '0 0 6px #ffaa00' }} /> Elevated</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#c084fc', boxShadow: '0 0 6px #c084fc' }} /> Emerging</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#1e9eff', boxShadow: '0 0 6px #1e9eff' }} /> Monitoring</div>
            </div>
          </div>

          {/* Right detail + news */}
          <div className="right-panel">
            <div className="detail-panel">
              {selected ? (
                <>
                  <div className="detail-header">
                    <div className="detail-eyebrow">Active Zone</div>
                    <div className="detail-name">{selected.name}</div>
                    <div className="detail-summary">{selected.summary}</div>
                    <div className="detail-facts">
                      <div className="detail-fact">
                        <div className="detail-fact-label">Intensity</div>
                        <div className={`detail-fact-value ${selected.intensity === 'high' ? 'red' : 'orange'}`}>
                          {selected.intensity.toUpperCase()}
                        </div>
                      </div>
                      <div className="detail-fact">
                        <div className="detail-fact-label">Status</div>
                        <div className={`detail-fact-value ${selected.status === 'ACTIVE' ? 'red' : 'orange'}`}>
                          {selected.status}
                        </div>
                      </div>
                      <div className="detail-fact">
                        <div className="detail-fact-label">Region</div>
                        <div className="detail-fact-value blue">{getRegion(selected.tags)}</div>
                      </div>
                      <div className="detail-fact">
                        <div className="detail-fact-label">Type</div>
                        <div className="detail-fact-value" style={{fontSize:11}}>{selected.tags[0]}</div>
                      </div>
                    </div>
                    <div className="detail-tags">{selected.tags.map(t => <span key={t} className="detail-tag">{t}</span>)}</div>
                  </div>
                  <div className="news-section">
                    <div className="news-section-title">
                      <span>Recent Coverage</span>
                      {lastUpdated && <span className="news-updated">{lastUpdated}</span>}
                    </div>
                    {newsLoading ? (
                      <div className="news-loading">Pulling GDELT feed...</div>
                    ) : news.length === 0 ? (
                      <div className="news-empty">No recent articles found</div>
                    ) : news.map((a, i) => (
                      <div key={i} className="news-item">
                        <a className="news-title" href={a.url} target="_blank" rel="noopener noreferrer">{a.title}</a>
                        <div className="news-meta">{a.source} · {a.date}</div>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const related = CONFLICTS
                      .filter(c => c.id !== selected.id && c.tags.some(t => selected.tags.includes(t)))
                      .sort((a, b) => (a.intensity === 'high' ? -1 : 1))
                      .slice(0, 3);
                    if (!related.length) return null;
                    return (
                      <div className="related-section">
                        <div className="news-section-title" style={{marginBottom:8}}>Related Zones</div>
                        {related.map(c => (
                          <div key={c.id} className="related-item" onClick={() => { setSelected(c); fetchConflictNews(c); }}>
                            <div className="related-name">{c.name}</div>
                            <span className={`intensity-badge intensity-${c.intensity}`}>{c.intensity}</span>
                            <div className="related-tag">{c.tags[0]}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="news-empty" style={{ padding: 40 }}>Select a conflict zone</div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW — 3 columns */}
        <div className="bottom-section">

          {/* Col 1: Pentagon Pizza Tracker */}
          <div className="global-feed" style={{borderTop:'2px solid rgba(255,170,0,0.4)',borderColor:'rgba(255,170,0,0.1)'}}>
            <div className="panel-header" style={{borderBottomColor:'rgba(255,170,0,0.1)'}}>
              <div>
                <div className="panel-title" style={{color:'#ffaa00'}}>Pentagon Pizza Tracker</div>
                <div className="panel-subtitle">DoD Activity Index · GDELT · 24h</div>
              </div>
              {dodLoading
                ? <div className="panel-status" style={{color:'#5a7a94',animation:'blink 1s infinite'}}>Measuring</div>
                : <div className="pizza-level" style={{color:dodLevel.color}}>{dodLevel.label}</div>
              }
            </div>
            <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(30,158,255,0.06)'}}>
              <div className="pizza-meter">
                <div className="pizza-meter-fill" style={{width:`${dodIndex}%`,background:dodLevel.color}} />
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span className="pizza-meter-zone">Normal</span>
                <span className="pizza-meter-zone">Elevated</span>
                <span className="pizza-meter-zone">High Alert</span>
              </div>
              <div className="pizza-index">Index: {dodIndex}/100 · {dodArticles.length} DoD articles in last 24h</div>
            </div>
            {dodArticles.map((a, i) => (
              <div key={i} className="feed-item">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="feed-title">{a.title}</a>
                <div className="feed-meta">{a.source} · {a.date}</div>
              </div>
            ))}
          </div>

          {/* Col 2: Conflicts by Region */}
          <div className="intel-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Conflicts by Region</div>
                <div className="panel-subtitle">{CONFLICTS.length} tracked · click to drill down</div>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="chart-bar-group">
                {regionCounts.map(r => (
                  <div key={r.region} className="chart-row" onClick={() => setDrillRegion(dr => dr === r.region ? null : r.region)}>
                    <div className="chart-label">{r.short}</div>
                    <div className="chart-bars">
                      <div className="chart-seg-high" style={{width:`${chartMax ? (r.high/chartMax)*100 : 0}%`}} />
                      <div className="chart-seg-med" style={{width:`${chartMax ? (r.medium/chartMax)*100 : 0}%`}} />
                    </div>
                    <div className="chart-count">{r.high + r.medium}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-legend">
              <div className="chart-legend-item"><div className="chart-legend-dot" style={{background:'#ff3a3a'}} />High</div>
              <div className="chart-legend-item"><div className="chart-legend-dot" style={{background:'#ffaa00'}} />Medium</div>
            </div>
            {regionCounts.map(r => (
              <div key={r.region}>
                <div className={`chart-region-row${drillRegion === r.region ? ' active' : ''}`} onClick={() => setDrillRegion(dr => dr === r.region ? null : r.region)}>
                  <span className="chart-region-name">{r.region}</span>
                  <span className="chart-region-counts">
                    <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'#ff3a3a'}}>{r.high} high</span>
                    <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'#ffaa00'}}>{r.medium} med</span>
                    <span className={`chart-region-arrow${drillRegion === r.region ? ' open' : ''}`}>▶</span>
                  </span>
                </div>
                {drillRegion === r.region && (
                  <div className="drill-panel">
                    {CONFLICTS.filter(c => getRegion(c.tags) === r.region)
                      .sort((a, b) => (a.intensity === 'high' ? -1 : 1))
                      .map(c => (
                        <div key={c.id} className="drill-conflict" onClick={() => { setSelected(c); fetchConflictNews(c); }}>
                          <div className="drill-conflict-header">
                            <span className="drill-conflict-name">{c.name}</span>
                            <span className={`intensity-badge intensity-${c.intensity}`}>{c.intensity}</span>
                          </div>
                          <div className="drill-summary">{c.summary}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Col 3: Hot Right Now + ACLED */}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div className="hot-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Hot Right Now</div>
                  <div className="panel-subtitle">Media attention · 24h</div>
                </div>
                {globalLoading && <div className="panel-status" style={{color:'#1e9eff',animation:'blink 1s infinite'}}>Scanning</div>}
              </div>
              {hotConflicts.length > 0 ? (() => {
                const maxCount = hotConflicts[0].count;
                return hotConflicts.map(({ conflict: c, count }, i) => (
                  <div key={c.id} className="hot-item" onClick={() => { setSelected(c); fetchConflictNews(c); }}>
                    <div className="hot-rank">#{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="hot-name">{c.name}</div>
                      <div className="hot-bar-wrap" style={{marginTop:4}}>
                        <div className="hot-bar" style={{width:`${(count/maxCount)*100}%`,background:c.intensity==='high'?'#ff3a3a':'#ffaa00'}} />
                      </div>
                    </div>
                    <div className="hot-count">{count}</div>
                  </div>
                ));
              })() : !globalLoading && <div className="news-empty">Loading…</div>}
            </div>
            <div className="stats-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Incident Data</div>
                  <div className="panel-subtitle">ACLED · 30-day counts</div>
                </div>
              </div>
              {Object.keys(acledData).length === 0
                ? <div className="news-empty" style={{padding:24}}>ACLED loading…</div>
                : Object.entries(acledData).slice(0, 10).map(([country, count]) => (
                  <div key={country} className="stat-row">
                    <div className="stat-country">{country}</div>
                    <div style={{textAlign:'right'}}>
                      <div className="stat-value">{count}</div>
                      <div className="stat-label">incidents</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* DIPLOMATIC WIRE — full-width card grid */}
        <div className="diplo-row">
          <div className="diplo-row-header">
            <div className="diplo-row-title">
              <div className="diplo-row-dot" />
              Diplomatic Wire
            </div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div className="diplo-row-sub">Ceasefires · Negotiations · UN · Auto-refresh 20min</div>
              {diploLoading && <div className="panel-status" style={{color:'#00ff88',animation:'blink 1s infinite'}}>Scanning</div>}
            </div>
          </div>
          <div className="diplo-grid">
            {(diplo.length > 0 ? diplo : (!diploLoading ? DIPLO_SEED : [])).map((a, i) => (
              <div key={i} className="diplo-card">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="diplo-link">
                  <span className="diplo-dot" />
                  {a.title}
                </a>
                <div className="diplo-meta">{a.source} · {a.date}</div>
              </div>
            ))}
          </div>
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-class">Unclassified // For Public Release</div>
          </div>
        </footer>
      </div>
    </>
  );
}