'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const CONFLICTS = [
  {
    id: 'ukraine', name: 'Russia-Ukraine War', lat: 49.0, lng: 31.0,
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
    id: 'iran', name: 'Iran-Israel / US Strikes', lat: 32.0, lng: 53.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Following the June 2025 twelve-day war, US and Israeli strikes on Iranian nuclear and military infrastructure.',
    tags: ['Airstrikes', 'Nuclear', 'Middle East', 'US Involved'], gdelt: 'iran israel US strikes war',
    acledCountry: 'Iran',
  },
  {
    id: 'sudan', name: 'Sudan Civil War', lat: 15.5, lng: 32.5,
    intensity: 'high', status: 'ACTIVE',
    summary: 'SAF vs RSF. Mass atrocities in Darfur. Largest displacement crisis in the world.',
    tags: ['Civil War', 'Humanitarian', 'Africa'], gdelt: 'sudan civil war RSF',
    acledCountry: 'Sudan',
  },
  {
    id: 'myanmar', name: 'Myanmar Civil War', lat: 19.7, lng: 96.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Military junta losing ground to resistance forces across multiple fronts.',
    tags: ['Civil War', 'Military Junta', 'Asia'], gdelt: 'myanmar civil war junta',
    acledCountry: 'Myanmar',
  },
  {
    id: 'drc', name: 'DR Congo / M23', lat: -2.5, lng: 28.5,
    intensity: 'high', status: 'ACTIVE',
    summary: 'M23 rebels backed by Rwanda have seized Goma and Bukavu. Worst humanitarian crisis in Africa.',
    tags: ['Civil War', 'Proxy War', 'Africa'], gdelt: 'congo M23 war goma',
    acledCountry: 'Democratic Republic of Congo',
  },
  {
    id: 'yemen', name: 'Yemen / Houthi Conflict', lat: 15.5, lng: 47.5,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Houthis continue Red Sea attacks and cross-border strikes. US-led airstrikes ongoing.',
    tags: ['Proxy War', 'Naval', 'Middle East'], gdelt: 'yemen houthi war strikes',
    acledCountry: 'Yemen',
  },
  {
    id: 'westbank', name: 'West Bank Escalation', lat: 32.0, lng: 35.2,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Major Israeli military operations in Jenin, Tulkarm, and Nablus. Escalating settler violence.',
    tags: ['Occupation', 'Middle East', 'Israel'], gdelt: 'west bank israel military jenin',
    acledCountry: 'Palestine',
  },
  {
    id: 'syria', name: 'Syria Post-Assad', lat: 34.8, lng: 38.9,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'HTS-led transitional government consolidating. Turkish-SDF tensions. Israeli strikes continue.',
    tags: ['Post-Conflict', 'Instability', 'Middle East'], gdelt: 'syria HTS turkey SDF conflict',
    acledCountry: 'Syria',
  },
  {
    id: 'sahel', name: 'Sahel Insurgency', lat: 14.0, lng: 2.0,
    intensity: 'high', status: 'ACTIVE',
    summary: "Jihadists besieging Mali's capital Bamako. Military juntas across Mali, Burkina Faso, Niger.",
    tags: ['Insurgency', 'Jihadist', 'Africa'], gdelt: 'sahel mali burkina faso insurgency',
    acledCountry: 'Mali',
  },
  {
    id: 'somalia', name: 'Somalia / Al-Shabaab', lat: 5.0, lng: 46.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Al-Shabaab operations continue. US drawdown of support raises escalation risk.',
    tags: ['Terrorism', 'Al-Shabaab', 'Africa'], gdelt: 'somalia al-shabaab',
    acledCountry: 'Somalia',
  },
  {
    id: 'ethiopia', name: 'Ethiopia-Eritrea Tensions', lat: 14.5, lng: 39.5,
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
    lat: 11.0, lng: 13.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Boko Haram and ISWAP continue attacks in the Lake Chad Basin. Nigerian military offensive ongoing.',
    tags: ['Terrorism', 'Jihadist', 'Africa'],
    gdelt: 'nigeria boko haram ISWAP attack',
    acledCountry: 'Nigeria',
  },
  {
    id: 'mozambique',
    name: 'Mozambique / ISIL',
    lat: -13.0, lng: 40.5,
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
    lat: 7.0, lng: 30.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Inter-communal violence and political instability. Peace deal implementation stalled.',
    tags: ['Civil Conflict', 'Humanitarian', 'Africa'],
    gdelt: 'south sudan conflict violence',
    acledCountry: 'South Sudan',
  },
  {
    id: 'caf',
    name: 'Central African Republic',
    lat: 6.5, lng: 20.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Wagner-backed government forces fighting CPC rebel coalition. Russian influence dominant.',
    tags: ['Civil War', 'Wagner', 'Africa'],
    gdelt: 'central african republic wagner rebel conflict',
    acledCountry: 'Central African Republic',
  },
  {
    id: 'libya',
    name: 'Libya Factional War',
    lat: 27.0, lng: 17.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'GNU and LNA factions competing for control. Turkey and UAE backing opposing sides.',
    tags: ['Proxy War', 'Factions', 'North Africa'],
    gdelt: 'libya war LNA GNU conflict',
    acledCountry: 'Libya',
  },
  {
    id: 'mali',
    name: 'Mali / Wagner Occupation',
    lat: 17.0, lng: -4.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Wagner forces and Malian junta fighting jihadist coalition. France expelled. Bamako under threat.',
    tags: ['Jihadist', 'Wagner', 'Africa'],
    gdelt: 'mali wagner junta jihadist conflict',
    acledCountry: 'Mali',
  },
  {
    id: 'burkinafaso',
    name: 'Burkina Faso Insurgency',
    lat: 12.5, lng: -2.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'JNIM and ISGS control significant territory. Junta cut western ties and invited Russian support.',
    tags: ['Jihadist', 'Insurgency', 'Africa'],
    gdelt: 'burkina faso jihadist JNIM attack',
    acledCountry: 'Burkina Faso',
  },
  {
    id: 'niger',
    name: 'Niger Junta / Sahel',
    lat: 17.6, lng: 8.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Post-coup junta expelled US and French forces. Jihadist activity intensifying in border regions.',
    tags: ['Junta', 'Insurgency', 'Africa'],
    gdelt: 'niger junta coup jihadist conflict',
    acledCountry: 'Niger',
  },
  {
    id: 'pakistan',
    name: 'Pakistan / TTP',
    lat: 33.0, lng: 70.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Tehrik-i-Taliban Pakistan escalating attacks across KP and Balochistan. Cross-border strikes into Afghanistan.',
    tags: ['Terrorism', 'TTP', 'South Asia'],
    gdelt: 'pakistan TTP taliban attack balochistan',
    acledCountry: 'Pakistan',
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan / IS-K',
    lat: 33.9, lng: 67.7,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Islamic State Khorasan conducting bombings against Taliban and civilians. Regional destabilization risk.',
    tags: ['Terrorism', 'IS-K', 'South Asia'],
    gdelt: 'afghanistan ISIS ISKP attack bombing',
    acledCountry: 'Afghanistan',
  },
  {
    id: 'india-pakistan',
    name: 'India-Pakistan Tensions',
    lat: 32.5, lng: 74.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Renewed cross-border skirmishes in Kashmir. Military buildup on both sides following militant attacks.',
    tags: ['Interstate Risk', 'Kashmir', 'South Asia'],
    gdelt: 'india pakistan kashmir military tension',
    acledCountry: 'India',
  },
  {
    id: 'northkorea',
    name: 'North Korea Provocations',
    lat: 40.0, lng: 127.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Ballistic missile tests and troop deployment to Russia. Peninsula tensions at decade high.',
    tags: ['Nuclear', 'Missiles', 'Asia-Pacific'],
    gdelt: 'north korea missile nuclear provocation',
    acledCountry: 'North Korea',
  },
  {
    id: 'southchinasea',
    name: 'South China Sea',
    lat: 14.0, lng: 114.0,
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
    lat: -1.8, lng: -78.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Mexican cartel proxies fighting for port control. State of emergency declared. Prison massacres ongoing.',
    tags: ['Cartel', 'Narco', 'Americas'],
    gdelt: 'ecuador cartel gang violence narco',
    acledCountry: 'Ecuador',
  },
  {
    id: 'mexico',
    name: 'Mexico Cartel Violence',
    lat: 25.0, lng: -104.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'CJNG and Sinaloa cartel war intensifying. Record homicide rates in Sinaloa, Chiapas, and Guerrero.',
    tags: ['Cartel', 'Narco', 'Americas'],
    gdelt: 'mexico cartel violence sinaloa CJNG',
    acledCountry: 'Mexico',
  },
  {
    id: 'iraq',
    name: 'Iraq / Iran-Backed Militias',
    lat: 33.0, lng: 44.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Iran-backed PMF militias asserting control. Residual ISIS activity in Anbar and Diyala.',
    tags: ['Militia', 'Iran Proxy', 'Middle East'],
    gdelt: 'iraq militia PMF ISIS attack',
    acledCountry: 'Iraq',
  },
  {
    id: 'lebanon',
    name: 'Lebanon Post-War Fragility',
    lat: 33.8, lng: 35.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Post-Hezbollah-Israel war reconstruction stalled. Political vacuum and economic collapse deepening.',
    tags: ['Post-Conflict', 'Hezbollah', 'Middle East'],
    gdelt: 'lebanon hezbollah israel war reconstruction',
    acledCountry: 'Lebanon',
  },
  {
    id: 'armenia-azerbaijan',
    name: 'Armenia-Azerbaijan',
    lat: 40.5, lng: 46.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Post-Karabakh tensions persist. Border demarcation disputes unresolved. Russian influence waning.',
    tags: ['Interstate Risk', 'Caucasus', 'Europe'],
    gdelt: 'armenia azerbaijan border tension conflict',
    acledCountry: 'Armenia',
  },
  {
    id: 'kenya',
    name: 'Kenya / Al-Shabaab',
    lat: 1.5, lng: 38.0,
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
    lat: 12.5, lng: -15.0,
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
    lat: 37.5, lng: 40.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Turkish military operations against PKK in Iraq and Syria continue. Domestic Kurdish tensions rising.',
    tags: ['Counterterrorism', 'PKK', 'Middle East'],
    gdelt: 'turkey PKK kurds military operation',
    acledCountry: 'Turkey',
  },
  {
    id: 'egypt-sinai',
    name: 'Egypt / Sinai Insurgency',
    lat: 30.0, lng: 33.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'ISIS-Sinai Province conducting attacks on Egyptian security forces. Gaza war spillover risk elevated.',
    tags: ['Terrorism', 'ISIS', 'North Africa'],
    gdelt: 'egypt sinai ISIS attack military',
    acledCountry: 'Egypt',
  },
  {
    id: 'georgia',
    name: 'Georgia / Russia Tensions',
    lat: 42.0, lng: 43.5,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Pro-Russian government reversing EU path. Mass protests. Russian occupied territories of Abkhazia and S. Ossetia remain flashpoints.',
    tags: ['Russia', 'Political Crisis', 'Caucasus'],
    gdelt: 'georgia russia protest political crisis',
    acledCountry: 'Georgia',
  },
  {
    id: 'moldova',
    name: 'Moldova / Transnistria',
    lat: 47.0, lng: 28.9,
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
    lat: -12.0, lng: -77.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Shining Path remnants (MOVADEF) active in VRAEM valley. Drug trafficking fueling insurgency.',
    tags: ['Insurgency', 'Narco', 'Americas'],
    gdelt: 'peru shining path VRAEM insurgency',
    acledCountry: 'Peru',
  },
  {
    id: 'china-india',
    name: 'China-India Border',
    lat: 34.0, lng: 79.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'LAC standoff continues despite disengagement deals. Infrastructure buildup on both sides of disputed border.',
    tags: ['Interstate Risk', 'China', 'South Asia'],
    gdelt: 'china india border LAC dispute military',
    acledCountry: 'India',
  },
  {
    id: 'philippines',
    name: 'Philippines / Abu Sayyaf',
    lat: 6.5, lng: 122.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Abu Sayyaf and NPA insurgencies in Mindanao. US-Philippines military cooperation expanding.',
    tags: ['Terrorism', 'Insurgency', 'Asia-Pacific'],
    gdelt: 'philippines abu sayyaf NPA mindanao attack',
    acledCountry: 'Philippines',
  },
  {
    id: 'papua',
    name: 'West Papua Insurgency',
    lat: -4.0, lng: 137.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'OPM separatists conducting attacks on Indonesian security forces and civilian workers in Papua.',
    tags: ['Separatist', 'Indonesia', 'Asia-Pacific'],
    gdelt: 'west papua OPM separatist indonesia conflict',
    acledCountry: 'Indonesia',
  },
  {
    id: 'tigray',
    name: 'Ethiopia / Tigray Aftermath',
    lat: 14.0, lng: 38.5,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Post-ceasefire Tigray faces humanitarian collapse. Fano militia clashes with federal forces in Amhara.',
    tags: ['Civil Conflict', 'Humanitarian', 'Africa'],
    gdelt: 'ethiopia tigray amhara fano conflict',
    acledCountry: 'Ethiopia',
  },
  {
    id: 'benin',
    name: 'Benin / Sahel Spillover',
    lat: 10.5, lng: 2.3,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Jihadist groups from Burkina Faso and Niger expanding into northern Benin. Tourist zones attacked.',
    tags: ['Jihadist', 'Spillover', 'Africa'],
    gdelt: 'benin jihadist attack north spillover',
    acledCountry: 'Benin',
  },
  {
    id: 'togo',
    name: 'Togo / Northern Insurgency',
    lat: 10.8, lng: 0.8,
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
    lat: 9.5, lng: -6.0,
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
    lat: -20.0, lng: 47.0,
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
    lat: -3.4, lng: 30.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'RED-Tabara and other armed groups operating from DRC. Government repression of opposition ongoing.',
    tags: ['Armed Groups', 'Africa', 'Repression'],
    gdelt: 'burundi armed group rebel attack RED-Tabara',
    acledCountry: 'Burundi',
  },
  {
    id: 'rwanda',
    name: 'Rwanda / DRC Proxy',
    lat: -2.0, lng: 30.0,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Rwanda backing M23 rebels in eastern DRC. International sanctions imposed. Regional war risk elevated.',
    tags: ['Proxy War', 'M23', 'Africa'],
    gdelt: 'rwanda M23 DRC proxy war sanctions',
    acledCountry: 'Rwanda',
  },
  {
    id: 'uganda',
    name: 'Uganda / ADF',
    lat: 1.0, lng: 32.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Allied Democratic Forces conducting bombings and massacres in DRC border regions and inside Uganda.',
    tags: ['Terrorism', 'ADF', 'Africa'],
    gdelt: 'uganda ADF allied democratic forces attack',
    acledCountry: 'Uganda',
  },
  {
    id: 'tanzania-jihadist',
    name: 'Tanzania Coastal Attacks',
    lat: -8.0, lng: 39.5,
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
    lat: 15.2, lng: -86.2,
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
    lat: -15.0, lng: -50.0,
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
    lat: 22.0, lng: 98.0,
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
    lat: -3.0, lng: 140.0,
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
    lat: 20.0, lng: 82.0,
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
    lat: 42.0, lng: 87.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Ongoing mass detention of Uyghurs. ETIM cross-border threat cited by Beijing. International sanctions imposed.',
    tags: ['Repression', 'Uyghur', 'China'],
    gdelt: 'china xinjiang uyghur detention repression ETIM',
    acledCountry: 'China',
  },
  {
    id: 'israel-lebanon',
    name: 'Israel-Lebanon Ceasefire',
    lat: 33.2, lng: 35.4,
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
    id: 'usa-border',
    name: 'US-Mexico Border Crisis',
    lat: 31.5, lng: -110.0,
    intensity: 'medium', status: 'ACTIVE',
    summary: 'Cartel control of border crossings. US military deployment under Operation Southern Shield. Armed migrant encounters at record levels.',
    tags: ['Cartel', 'Border', 'North America'],
    gdelt: 'US mexico border cartel military operation crisis',
    acledCountry: 'United States',
  },
  {
    id: 'usa-militia',
    name: 'US Domestic Extremism',
    lat: 38.0, lng: -97.0,
    intensity: 'medium', status: 'ELEVATED',
    summary: 'Far-right militia groups and lone-wolf extremists conducting attacks. DHS warning of heightened domestic terror threat.',
    tags: ['Domestic Terror', 'Extremism', 'North America'],
    gdelt: 'united states domestic extremism militia attack DHS',
    acledCountry: 'United States',
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
    lat: 27.5, lng: 90.5,
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
    lat: 59.5, lng: 17.5,
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
    lat: 52.5, lng: 23.5,
    intensity: 'high', status: 'ACTIVE',
    summary: 'Belarus weaponizing migrants at Polish border. Sabotage and arson attacks on Polish infrastructure linked to Russian GRU.',
    tags: ['Hybrid War', 'Russia', 'NATO'],
    gdelt: 'poland belarus border hybrid war sabotage GRU migrant',
    acledCountry: 'Poland',
  },
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
      const color = c.intensity === 'high' ? '#ff3a3a' : '#ffaa00';
      const size = c.intensity === 'high' ? 14 : 10;
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:${size}px;height:${size}px;">
          <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color};animation:markerPulse 2s infinite;"></div>
          <div style="position:absolute;inset:-6px;border-radius:50%;border:1px solid ${color};opacity:0.4;animation:markerRing 2s infinite;"></div>
        </div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([c.lat, c.lng], { icon }).addTo(map).on('click', () => { setSelected(c); fetchConflictNews(c); });
      markersRef.current.push(marker);
    });
  }

  useEffect(() => {
    if (!leafletMap.current) return;
    const L = (window as any).L;
    if (L) renderMarkers(leafletMap.current, L);
  }, [filter]);

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
  fetchAcled();

  const tickerInterval = setInterval(fetchTicker, 5 * 60 * 1000);
  const newsInterval = setInterval(fetchGlobalNews, 10 * 60 * 1000);
  const spikesInterval = setInterval(fetchSpikes, 15 * 60 * 1000);
  return () => { clearInterval(tickerInterval); clearInterval(newsInterval); clearInterval(spikesInterval); };
}, []);

  const visible = CONFLICTS.filter(c => filter === 'all' || c.intensity === filter);
  const pagedNews = globalNews.slice(globalPage * 10, globalPage * 10 + 10);
  const totalPages = Math.ceil(globalNews.length / 10);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #fff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        /* TICKER */
        .ticker-wrap { position: sticky; top: 70px; z-index: 99; border-top: 1px solid rgba(255,58,58,0.2); border-bottom: 1px solid rgba(255,58,58,0.2); background: rgba(3,6,8,0.95); padding: 9px 0; overflow: hidden; backdrop-filter: blur(10px); }
        .ticker-label { position: absolute; left: 0; top: 0; bottom: 0; background: #ff3a3a; display: flex; align-items: center; padding: 0 20px; font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700; letter-spacing: 3px; color: #000; z-index: 2; text-transform: uppercase; white-space: nowrap; }
        .ticker-track { display: flex; animation: ticker 60s linear infinite; padding-left: 160px; }
        .ticker-track:hover { animation-play-state: paused; }
        .ticker-item { white-space: nowrap; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c0cfe0; letter-spacing: 1px; padding: 0 40px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .ticker-item:hover { color: #ff3a3a; }
        .ticker-item::after { content: '//'; color: #ff3a3a; opacity: 0.4; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        .page-wrap { padding-top: 70px; min-height: 100vh; }
        .back-bar { padding: 14px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); display: flex; align-items: center; justify-content: space-between; }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .live-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #00ff88; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
        .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 6px #00ff88; animation: blink 2s infinite; }

        .tool-hero { padding: 36px 40px 28px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1500px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .tool-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #ff3a3a; text-transform: uppercase; margin-bottom: 10px; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(24px, 3vw, 42px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
        .tool-desc { font-size: 14px; font-weight: 300; color: #7a9bb5; line-height: 1.7; max-width: 600px; }
        .hero-stats { display: flex; gap: 32px; }
        .hero-stat { text-align: right; }
        .hero-stat-num { font-family: 'Orbitron', monospace; font-size: 32px; font-weight: 700; }
        .hero-stat-num.red { color: #ff3a3a; }
        .hero-stat-num.orange { color: #ffaa00; }
        .hero-stat-num.blue { color: #1e9eff; }
        .hero-stat-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }

        .filters { display: flex; gap: 2px; padding: 14px 40px; max-width: 1500px; margin: 0 auto; }
        .filter-btn { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 8px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .filter-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
        .filter-btn.active { color: #ff3a3a; border-color: rgba(255,58,58,0.5); background: rgba(255,58,58,0.06); }
        .filter-btn.active-orange { color: #ffaa00; border-color: rgba(255,170,0,0.5); background: rgba(255,170,0,0.06); }
        .filter-btn.active-blue { color: #1e9eff; border-color: #1e9eff; background: rgba(30,158,255,0.08); }

        /* MAIN MAP LAYOUT */
        .main-layout { display: grid; grid-template-columns: 300px 1fr 300px; gap: 2px; padding: 0 40px; max-width: 1500px; margin: 0 auto; }

        .conflict-list { border: 1px solid rgba(30,158,255,0.08); overflow-y: auto; max-height: 700px; background: #070d12; }
        .conflict-item { padding: 14px 18px; border-bottom: 1px solid rgba(30,158,255,0.06); cursor: pointer; transition: all 0.2s; }
        .conflict-item:hover { background: #0a1520; }
        .conflict-item.active { background: #0a1520; border-left: 2px solid #ff3a3a; }
        .conflict-item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
        .conflict-name { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #c0cfe0; }
        .intensity-badge { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; padding: 2px 6px; text-transform: uppercase; }
        .intensity-high { color: #ff3a3a; border: 1px solid rgba(255,58,58,0.4); background: rgba(255,58,58,0.08); }
        .intensity-medium { color: #ffaa00; border: 1px solid rgba(255,170,0,0.4); background: rgba(255,170,0,0.08); }
        .conflict-status { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 6px; }
        .conflict-acled { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #1e9eff; margin-bottom: 6px; }
        .conflict-tags { display: flex; flex-wrap: wrap; gap: 3px; }
        .conflict-tag { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #3d5870; border: 1px solid rgba(30,158,255,0.08); padding: 1px 5px; }

        .map-wrap { position: relative; border: 1px solid rgba(30,158,255,0.08); }
        #conflict-map { width: 100%; height: 700px; background: #030608; }
        .map-overlay { position: absolute; top: 12px; left: 12px; z-index: 500; }
        .map-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; background: rgba(3,6,8,0.85); border: 1px solid rgba(30,158,255,0.2); padding: 6px 12px; }
        .map-legend { position: absolute; bottom: 12px; left: 12px; z-index: 500; background: rgba(3,6,8,0.85); border: 1px solid rgba(30,158,255,0.12); padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #7a9bb5; text-transform: uppercase; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

        /* RIGHT PANEL */
        .right-panel { display: flex; flex-direction: column; gap: 2px; max-height: 700px; overflow-y: auto; }
        .detail-panel { border: 1px solid rgba(30,158,255,0.08); background: #070d12; flex: 1; overflow-y: auto; }
        .detail-header { padding: 18px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .detail-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #ff3a3a; text-transform: uppercase; margin-bottom: 8px; }
        .detail-name { font-family: 'Orbitron', monospace; font-size: 15px; font-weight: 700; color: #c0cfe0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .detail-summary { font-size: 13px; font-weight: 300; color: #7a9bb5; line-height: 1.7; margin-bottom: 10px; }
        .detail-tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .detail-tag { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #1e9eff; border: 1px solid rgba(30,158,255,0.2); padding: 2px 7px; }
        .news-section { padding: 14px 18px; }
        .news-section-title { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
        .news-updated { color: #1e9eff; font-size: 9px; }
        .news-item { padding: 10px 0; border-bottom: 1px solid rgba(30,158,255,0.05); }
        .news-item:last-child { border-bottom: none; }
        .news-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; color: #c0cfe0; line-height: 1.3; margin-bottom: 3px; text-decoration: none; display: block; transition: color 0.2s; }
        .news-title:hover { color: #00ff88; }
        .news-meta { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #3d5870; }
        .news-empty { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; text-align: center; padding: 20px 0; }
        .news-loading { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-align: center; padding: 20px 0; animation: blink 1s infinite; }

        /* BOTTOM SECTION */
        .bottom-section { max-width: 1500px; margin: 2px auto 0; padding: 0 40px 80px; display: grid; grid-template-columns: 1fr 340px; gap: 2px; }

        /* GLOBAL NEWS FEED */
        .global-feed { border: 1px solid rgba(30,158,255,0.08); background: #070d12; }
        .panel-header { padding: 16px 20px; border-bottom: 1px solid rgba(30,158,255,0.08); display: flex; align-items: center; justify-content: space-between; }
        .panel-title { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; }
        .panel-subtitle { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .feed-item { padding: 14px 20px; border-bottom: 1px solid rgba(30,158,255,0.05); transition: background 0.2s; }
        .feed-item:hover { background: #0a1520; }
        .feed-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; color: #c0cfe0; line-height: 1.3; margin-bottom: 4px; text-decoration: none; display: block; transition: color 0.2s; }
        .feed-title:hover { color: #1e9eff; }
        .feed-meta { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #3d5870; }
        .feed-pagination { padding: 12px 20px; display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(30,158,255,0.08); }
        .page-btn { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 5px 12px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
        .page-btn:disabled { opacity: 0.3; cursor: default; }
        .page-info { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; flex: 1; text-align: center; }

        /* SPIKES PANEL */
        .spikes-panel { border: 1px solid rgba(30,158,255,0.08); background: #070d12; }
        .spike-item { padding: 14px 20px; border-bottom: 1px solid rgba(30,158,255,0.05); display: flex; align-items: center; justify-content: space-between; }
        .spike-country { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #c0cfe0; }
        .spike-trend { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #ffaa00; }
        .spike-count { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .spike-badge { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #ffaa00; border: 1px solid rgba(255,170,0,0.3); padding: 2px 6px; text-transform: uppercase; }

        /* ACLED / STATS PANEL */
        .stats-panel { border: 1px solid rgba(30,158,255,0.08); background: #070d12; }
        .stat-row { padding: 12px 20px; border-bottom: 1px solid rgba(30,158,255,0.05); display: flex; align-items: center; justify-content: space-between; }
        .stat-country { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; color: #c0cfe0; }
        .stat-value { font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; color: #ff3a3a; }
        .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #3d5870; text-align: right; }

        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; }
        .footer-bottom { max-width: 1500px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes markerPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.2); } }
        @keyframes markerRing { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.5); opacity: 0; } }

        .leaflet-container { background: #030608 !important; }
        .leaflet-control-zoom a { background: #0a1520 !important; color: #1e9eff !important; border-color: rgba(30,158,255,0.2) !important; }

        @media (max-width: 1200px) {
          .main-layout { grid-template-columns: 1fr; }
          .bottom-section { grid-template-columns: 1fr; }
          #conflict-map { height: 400px; }
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .tool-hero, .filters, .main-layout, .bottom-section { padding-left: 16px; padding-right: 16px; }
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
            <li><a href="/osint" style={{ color: '#00ff88' }}>OSINT Hub</a></li>
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
            <div style={{ paddingLeft: 160, fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: '#3d5870', letterSpacing: 2, animation: 'blink 1s infinite' }}>
              // PULLING LIVE FEED...
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
              <div className="tool-eyebrow">// OSINT Hub — Conflict Intelligence</div>
              <div className="tool-title">Conflict Tracker</div>
              <p className="tool-desc">Real-time mapping of active conflict zones with live news from GDELT's global media index, ACLED incident data, and AI-flagged emerging threats. Auto-refreshes every 5 minutes.</p>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num red">{CONFLICTS.filter(c => c.intensity === 'high').length}</div>
                <div className="hero-stat-label">// High Intensity</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num orange">{CONFLICTS.filter(c => c.intensity === 'medium').length}</div>
                <div className="hero-stat-label">// Elevated</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num blue">{spikes.length}</div>
                <div className="hero-stat-label">// Emerging Threats</div>
              </div>
            </div>
          </div>
        </div>

        <div className="filters">
          {[
            { key: 'all', label: 'All Zones', cls: 'active-blue' },
            { key: 'high', label: 'High Intensity', cls: 'active' },
            { key: 'medium', label: 'Elevated', cls: 'active-orange' },
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
            {visible.map(c => (
              <div key={c.id} className={`conflict-item ${selected?.id === c.id ? 'active' : ''}`}
                onClick={() => { setSelected(c); fetchConflictNews(c); }}>
                <div className="conflict-item-header">
                  <div className="conflict-name">{c.name}</div>
                  <div className={`intensity-badge intensity-${c.intensity}`}>{c.intensity}</div>
                </div>
                <div className="conflict-status">● {c.status}</div>
                {acledData[c.acledCountry] && (
                  <div className="conflict-acled">⚡ {acledData[c.acledCountry]} incidents / 30d</div>
                )}
                <div className="conflict-tags">{c.tags.map(t => <span key={t} className="conflict-tag">{t}</span>)}</div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="map-wrap">
            <div className="map-overlay"><div className="map-label">// Live Conflict Map</div></div>
            <div id="conflict-map" ref={mapRef} />
            <div className="map-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#ff3a3a', boxShadow: '0 0 6px #ff3a3a' }} /> High Intensity</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#ffaa00', boxShadow: '0 0 6px #ffaa00' }} /> Elevated</div>
            </div>
          </div>

          {/* Right detail + news */}
          <div className="right-panel">
            <div className="detail-panel">
              {selected ? (
                <>
                  <div className="detail-header">
                    <div className="detail-eyebrow">// Active Zone</div>
                    <div className="detail-name">{selected.name}</div>
                    <div className="detail-summary">{selected.summary}</div>
                    <div className="detail-tags">{selected.tags.map(t => <span key={t} className="detail-tag">{t}</span>)}</div>
                  </div>
                  <div className="news-section">
                    <div className="news-section-title">
                      <span>// Recent Coverage</span>
                      {lastUpdated && <span className="news-updated">{lastUpdated}</span>}
                    </div>
                    {newsLoading ? (
                      <div className="news-loading">// Pulling GDELT feed...</div>
                    ) : news.length === 0 ? (
                      <div className="news-empty">// No recent articles found</div>
                    ) : news.map((a, i) => (
                      <div key={i} className="news-item">
                        <a className="news-title" href={a.url} target="_blank" rel="noopener noreferrer">{a.title}</a>
                        <div className="news-meta">{a.source} · {a.date}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="news-empty" style={{ padding: 40 }}>// Select a conflict zone</div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="bottom-section">

          {/* Global news feed */}
          <div className="global-feed">
            <div className="panel-header">
              <div>
                <div className="panel-title">Global Conflict Feed</div>
                <div className="panel-subtitle">// GDELT — Updated every 10 min</div>
              </div>
              <button className="page-btn" onClick={fetchGlobalNews}>↺ Refresh</button>
            </div>
            {globalLoading ? (
              <div className="news-loading" style={{ padding: 30 }}>// Pulling global feed...</div>
            ) : pagedNews.map((a, i) => (
              <div key={i} className="feed-item">
                <a className="feed-title" href={a.url} target="_blank" rel="noopener noreferrer">{a.title}</a>
                <div className="feed-meta">{a.source} · {a.date}</div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="feed-pagination">
                <button className="page-btn" onClick={() => setGlobalPage(p => Math.max(0, p - 1))} disabled={globalPage === 0}>← Prev</button>
                <div className="page-info">{globalPage + 1} / {totalPages}</div>
                <button className="page-btn" onClick={() => setGlobalPage(p => Math.min(totalPages - 1, p + 1))} disabled={globalPage === totalPages - 1}>Next →</button>
              </div>
            )}
          </div>

          

          {/* ACLED stats */}
          <div className="stats-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Incident Data</div>
                <div className="panel-subtitle">// ACLED — 30-day counts</div>
              </div>
            </div>
            {Object.keys(acledData).length === 0 ? (
              <div className="news-empty" style={{ padding: 30 }}>// ACLED data loading...</div>
            ) : Object.entries(acledData).slice(0, 12).map(([country, count]) => (
              <div key={country} className="stat-row">
                <div className="stat-country">{country}</div>
                <div>
                  <div className="stat-value">{count}</div>
                  <div className="stat-label">incidents</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}