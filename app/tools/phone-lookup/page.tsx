'use client';
import { useState } from 'react';
import { parsePhoneNumber, isPossiblePhoneNumber } from 'libphonenumber-js/max';

const TYPE_LABELS: Record<string, string> = {
  MOBILE: 'Mobile', FIXED_LINE: 'Fixed Line (Landline)',
  FIXED_LINE_OR_MOBILE: 'Fixed or Mobile', TOLL_FREE: 'Toll-Free',
  PREMIUM_RATE: 'Premium Rate', SHARED_COST: 'Shared Cost',
  VOIP: 'VoIP / Internet Phone', PERSONAL_NUMBER: 'Personal Number',
  PAGER: 'Pager', UAN: 'Universal Access Number',
  VOICEMAIL: 'Voicemail Access', UNKNOWN: 'Unknown',
};

const TYPE_COLORS: Record<string, string> = {
  MOBILE: '#00ff88', FIXED_LINE: '#1e9eff', FIXED_LINE_OR_MOBILE: '#1e9eff',
  TOLL_FREE: '#a78bfa', PREMIUM_RATE: '#ff3a3a', VOIP: '#f59e0b',
  PERSONAL_NUMBER: '#00ffff', UNKNOWN: '#5a7a94',
};

// Likely use inferred from number type
function getLikelyUse(type: string): { label: string; color: string } {
  switch (type) {
    case 'MOBILE': return { label: 'Personal or Business Mobile', color: '#00ff88' };
    case 'FIXED_LINE': return { label: 'Residential or Business Landline', color: '#1e9eff' };
    case 'FIXED_LINE_OR_MOBILE': return { label: 'Residential, Mobile, or Business', color: '#1e9eff' };
    case 'TOLL_FREE': return { label: 'Business / Organization (Inbound Only)', color: '#a78bfa' };
    case 'PREMIUM_RATE': return { label: 'Premium Service / Pay-Per-Call', color: '#ff3a3a' };
    case 'VOIP': return { label: 'Virtual / Internet Phone — Often Business or Anonymous', color: '#f59e0b' };
    case 'SHARED_COST': return { label: 'Shared Cost Service (Business)', color: '#f59e0b' };
    case 'PERSONAL_NUMBER': return { label: 'Personal Follow-Me Number', color: '#00ffff' };
    case 'UAN': return { label: 'Business Universal Access Number', color: '#a78bfa' };
    default: return { label: 'Unknown', color: '#5a7a94' };
  }
}

// US area codes → location
const US_AREA_CODES: Record<string, string> = {
  '201':'Jersey City, NJ','202':'Washington, D.C.','203':'Connecticut','205':'Birmingham, AL',
  '206':'Seattle, WA','207':'Maine','208':'Idaho','209':'Stockton, CA','210':'San Antonio, TX',
  '212':'Manhattan, NY','213':'Los Angeles, CA','214':'Dallas, TX','215':'Philadelphia, PA',
  '216':'Cleveland, OH','217':'Springfield, IL','218':'Duluth, MN','219':'Hammond, IN',
  '220':'Newark, OH','224':'Chicago suburbs, IL','225':'Baton Rouge, LA','228':'Gulfport, MS',
  '229':'Albany, GA','231':'Traverse City, MI','234':'Akron, OH','239':'Fort Myers, FL',
  '240':'Bethesda, MD','248':'Troy, MI','251':'Mobile, AL','252':'Rocky Mount, NC',
  '253':'Tacoma, WA','254':'Waco, TX','256':'Huntsville, AL','260':'Fort Wayne, IN',
  '262':'Racine, WI','267':'Philadelphia, PA','269':'Kalamazoo, MI','270':'Bowling Green, KY',
  '272':'Scranton, PA','276':'Bristol, VA','281':'Houston, TX','301':'Bethesda, MD',
  '302':'Delaware','303':'Denver, CO','304':'West Virginia','305':'Miami, FL',
  '307':'Wyoming','308':'Nebraska','309':'Peoria, IL','310':'Los Angeles (West), CA',
  '312':'Chicago, IL','313':'Detroit, MI','314':'St. Louis, MO','315':'Syracuse, NY',
  '316':'Wichita, KS','317':'Indianapolis, IN','318':'Shreveport, LA','319':'Cedar Rapids, IA',
  '320':'St. Cloud, MN','321':'Orlando, FL','323':'Los Angeles, CA','325':'Abilene, TX',
  '330':'Akron, OH','334':'Montgomery, AL','336':'Greensboro, NC','337':'Lafayette, LA',
  '339':'Boston area, MA','340':'US Virgin Islands','347':'New York City (Bronx/Brooklyn), NY',
  '351':'Lowell, MA','352':'Gainesville, FL','360':'Bellingham, WA','361':'Corpus Christi, TX',
  '385':'Salt Lake City, UT','386':'Daytona Beach, FL','401':'Rhode Island',
  '402':'Nebraska','404':'Atlanta, GA','405':'Oklahoma City, OK','406':'Montana',
  '407':'Orlando, FL','408':'San Jose, CA','409':'Beaumont, TX','410':'Baltimore, MD',
  '412':'Pittsburgh, PA','413':'Springfield, MA','414':'Milwaukee, WI','415':'San Francisco, CA',
  '417':'Springfield, MO','419':'Toledo, OH','423':'Chattanooga, TN','424':'Los Angeles, CA',
  '425':'Bellevue, WA','430':'Texarkana, TX','432':'Midland, TX','434':'Charlottesville, VA',
  '435':'Utah','440':'Cleveland suburbs, OH','442':'Palm Springs, CA','443':'Baltimore, MD',
  '458':'Eugene, OR','463':'Indianapolis, IN','469':'Dallas, TX','470':'Atlanta, GA',
  '475':'Bridgeport, CT','478':'Macon, GA','479':'Fayetteville, AR','480':'Scottsdale, AZ',
  '484':'Allentown, PA','501':'Little Rock, AR','502':'Louisville, KY','503':'Portland, OR',
  '504':'New Orleans, LA','505':'New Mexico','507':'Rochester, MN','508':'Worcester, MA',
  '509':'Spokane, WA','510':'Oakland, CA','512':'Austin, TX','513':'Cincinnati, OH',
  '515':'Des Moines, IA','516':'Nassau County, NY','517':'Lansing, MI','518':'Albany, NY',
  '520':'Tucson, AZ','530':'Redding, CA','531':'Omaha, NE','534':'Eau Claire, WI',
  '539':'Tulsa, OK','540':'Roanoke, VA','541':'Eugene, OR','551':'Jersey City, NJ',
  '559':'Fresno, CA','561':'West Palm Beach, FL','562':'Long Beach, CA','563':'Davenport, IA',
  '567':'Toledo, OH','570':'Wilkes-Barre, PA','571':'Arlington, VA','573':'Columbia, MO',
  '574':'South Bend, IN','575':'Las Cruces, NM','580':'Lawton, OK','585':'Rochester, NY',
  '586':'Sterling Heights, MI','601':'Jackson, MS','602':'Phoenix, AZ','603':'New Hampshire',
  '605':'South Dakota','606':'Ashland, KY','607':'Binghamton, NY','608':'Madison, WI',
  '609':'Trenton, NJ','610':'Allentown, PA','612':'Minneapolis, MN','614':'Columbus, OH',
  '615':'Nashville, TN','616':'Grand Rapids, MI','617':'Boston, MA','618':'Belleville, IL',
  '619':'San Diego, CA','620':'Dodge City, KS','623':'Glendale, AZ','626':'Pasadena, CA',
  '628':'San Francisco, CA','629':'Nashville, TN','630':'DuPage County, IL',
  '631':'Long Island, NY','636':'St. Louis suburbs, MO','641':'Mason City, IA',
  '646':'Manhattan, NY','650':'San Mateo, CA','651':'St. Paul, MN','657':'Anaheim, CA',
  '660':'Sedalia, MO','661':'Bakersfield, CA','662':'Tupelo, MS','667':'Baltimore, MD',
  '669':'San Jose, CA','670':'Saipan, CNMI','671':'Guam','678':'Atlanta, GA',
  '681':'Charleston, WV','682':'Fort Worth, TX','684':'American Samoa','701':'North Dakota',
  '702':'Las Vegas, NV','703':'Arlington, VA','704':'Charlotte, NC','706':'Augusta, GA',
  '707':'Santa Rosa, CA','708':'Chicago suburbs, IL','712':'Sioux City, IA','713':'Houston, TX',
  '714':'Anaheim, CA','715':'Wausau, WI','716':'Buffalo, NY','717':'Harrisburg, PA',
  '718':'New York City (Boroughs), NY','719':'Colorado Springs, CO','720':'Denver, CO',
  '724':'Pittsburgh suburbs, PA','725':'Las Vegas, NV','726':'San Antonio, TX',
  '727':'St. Petersburg, FL','731':'Jackson, TN','732':'New Brunswick, NJ',
  '734':'Ann Arbor, MI','737':'Austin, TX','740':'Zanesville, OH','743':'Greensboro, NC',
  '747':'Los Angeles, CA','754':'Fort Lauderdale, FL','757':'Norfolk, VA',
  '760':'Palm Springs, CA','762':'Augusta, GA','763':'Minneapolis suburbs, MN',
  '765':'Lafayette, IN','769':'Jackson, MS','770':'Atlanta suburbs, GA',
  '772':'Fort Pierce, FL','773':'Chicago, IL','774':'Worcester, MA','775':'Reno, NV',
  '779':'Rockford, IL','781':'Boston suburbs, MA','785':'Topeka, KS','786':'Miami, FL',
  '787':'Puerto Rico','801':'Salt Lake City, UT','802':'Vermont','803':'Columbia, SC',
  '804':'Richmond, VA','805':'Oxnard, CA','806':'Amarillo, TX','808':'Hawaii',
  '810':'Flint, MI','812':'Evansville, IN','813':'Tampa, FL','814':'Erie, PA',
  '815':'Rockford, IL','816':'Kansas City, MO','817':'Fort Worth, TX',
  '818':'San Fernando Valley, CA','828':'Asheville, NC','830':'Del Rio, TX',
  '831':'Santa Cruz, CA','832':'Houston, TX','838':'Albany, NY','843':'Charleston, SC',
  '845':'Poughkeepsie, NY','847':'Evanston, IL','848':'New Brunswick, NJ',
  '850':'Tallahassee, FL','854':'Charleston, SC','856':'Camden, NJ','857':'Boston, MA',
  '858':'San Diego, CA','859':'Lexington, KY','860':'Hartford, CT','862':'Newark, NJ',
  '863':'Lakeland, FL','864':'Greenville, SC','865':'Knoxville, TN','870':'Jonesboro, AR',
  '872':'Chicago, IL','878':'Pittsburgh, PA','901':'Memphis, TN','903':'Tyler, TX',
  '904':'Jacksonville, FL','906':'Marquette, MI','907':'Alaska','908':'Elizabeth, NJ',
  '909':'San Bernardino, CA','910':'Wilmington, NC','912':'Savannah, GA',
  '913':'Kansas City, KS','914':'Yonkers, NY','915':'El Paso, TX','916':'Sacramento, CA',
  '917':'New York City, NY','918':'Tulsa, OK','919':'Raleigh, NC','920':'Green Bay, WI',
  '925':'Contra Costa County, CA','928':'Flagstaff, AZ','929':'New York City, NY',
  '930':'Bloomington, IN','931':'Clarksville, TN','934':'Long Island, NY','936':'Lufkin, TX',
  '937':'Dayton, OH','938':'Huntsville, AL','940':'Wichita Falls, TX','941':'Sarasota, FL',
  '947':'Troy, MI','949':'Irvine, CA','951':'Riverside, CA','952':'Minneapolis suburbs, MN',
  '954':'Fort Lauderdale, FL','956':'Laredo, TX','959':'Hartford, CT',
  '970':'Grand Junction, CO','971':'Portland, OR','972':'Dallas, TX','973':'Newark, NJ',
  '978':'Lowell, MA','979':'Bryan, TX','980':'Charlotte, NC','984':'Raleigh, NC',
  '985':'Houma, LA','986':'Boise, ID','989':'Saginaw, MI',
  // Canadian area codes
  '204':'Manitoba, Canada','226':'Ontario, Canada','236':'British Columbia, Canada',
  '249':'Ontario, Canada','250':'British Columbia, Canada','289':'Ontario, Canada',
  '343':'Ontario, Canada','365':'Ontario, Canada','368':'Alberta, Canada',
  '382':'Ontario, Canada','403':'Alberta, Canada','418':'Quebec, Canada',
  '428':'New Brunswick, Canada','431':'Manitoba, Canada','437':'Ontario, Canada',
  '438':'Quebec, Canada','450':'Quebec, Canada','506':'New Brunswick, Canada',
  '514':'Montreal, Canada','519':'Ontario, Canada','548':'Ontario, Canada',
  '579':'Quebec, Canada','581':'Quebec, Canada','587':'Alberta, Canada',
  '604':'British Columbia, Canada','613':'Ottawa, Canada','639':'Saskatchewan, Canada',
  '647':'Toronto, Canada','672':'British Columbia, Canada','705':'Ontario, Canada',
  '709':'Newfoundland, Canada','778':'British Columbia, Canada','780':'Alberta, Canada',
  '782':'Nova Scotia / PEI, Canada','807':'Ontario, Canada','819':'Quebec, Canada',
  '825':'Alberta, Canada','867':'Yukon / NWT / Nunavut, Canada',
  '873':'Quebec, Canada','902':'Nova Scotia / PEI, Canada','905':'Ontario, Canada',
};

function getAreaCodeInfo(phone: any): string | null {
  const country = phone.country;
  if (country !== 'US' && country !== 'CA') return null;
  const national = String(phone.nationalNumber);
  const areaCode = national.slice(0, 3);
  return US_AREA_CODES[areaCode] ? `${areaCode} → ${US_AREA_CODES[areaCode]}` : `${areaCode} (area code)`;
}

const getCountryName = (code: string) => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch { return code; }
};

interface PhoneResult {
  valid: boolean; possible: boolean; country: string; countryName: string;
  callingCode: string; type: string; international: string; national: string;
  e164: string; nationalNumber: string; areaInfo: string | null;
}

function analyze(raw: string): PhoneResult | null {
  const cleaned = raw.trim().startsWith('+') ? raw.trim() : `+${raw.trim()}`;
  try {
    const phone = parsePhoneNumber(cleaned);
    if (!phone) return null;
    const country = phone.country || '';
    const type = phone.getType() || 'UNKNOWN';
    return {
      valid: phone.isValid(), possible: isPossiblePhoneNumber(cleaned),
      country, countryName: getCountryName(country),
      callingCode: String(phone.countryCallingCode),
      type, international: phone.formatInternational(),
      national: phone.formatNational(), e164: phone.format('E.164'),
      nationalNumber: String(phone.nationalNumber),
      areaInfo: getAreaCodeInfo(phone),
    };
  } catch { return null; }
}

export default function PhoneLookup() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PhoneResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    setError(''); setResult(null);
    const val = input.trim();
    if (!val) { setError('Enter a phone number to analyze.'); return; }
    const r = analyze(val);
    if (!r) { setError('Could not parse this number. Include the country code — e.g. +1 for US, +44 for UK.'); return; }
    setResult(r);
  };

  const typeColor = result ? (TYPE_COLORS[result.type] || '#5a7a94') : '#5a7a94';
  const use = result ? getLikelyUse(result.type) : null;
  const numForLinks = result ? result.e164.replace('+', '') : '';
  const intlEncoded = result ? encodeURIComponent(result.international) : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 1100; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .hero { padding: 48px 40px 36px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .hero-inner { max-width: 1200px; margin: 0 auto; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
        .hero-title span { color: #1e9eff; }
        .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; max-width: 600px; line-height: 1.7; }
        .tool-section { padding: 32px 40px 48px; max-width: 920px; margin: 0 auto; }
        .search-row { display: flex; gap: 2px; margin-bottom: 8px; }
        .search-input { flex: 1; background: #0a1520; border: 1px solid rgba(30,158,255,0.2); outline: none; padding: 15px 22px; font-family: 'Share Tech Mono', monospace; font-size: 16px; color: #d8e8f5; letter-spacing: 3px; }
        .search-input::placeholder { color: #5a7a94; letter-spacing: 1px; }
        .search-input:focus { border-color: rgba(30,158,255,0.5); }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 15px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .hint { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; margin-bottom: 24px; }
        .hint span { color: #1e9eff; }
        .error-bar { background: rgba(255,58,58,0.08); border: 1px solid rgba(255,58,58,0.2); padding: 12px 18px; margin-bottom: 20px; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #ff3a3a; }
        .result-card { border: 1px solid rgba(30,158,255,0.2); background: #0a1520; }
        .result-header { padding: 22px 28px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(30,158,255,0.04); }
        .result-number { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; margin-bottom: 12px; }
        .result-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; padding: 4px 12px; text-transform: uppercase; border: 1px solid; }
        .badge-valid { color: #00ff88; border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.06); }
        .badge-invalid { color: #ff3a3a; border-color: rgba(255,58,58,0.3); background: rgba(255,58,58,0.06); }
        .badge-possible { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }
        .section-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; padding: 12px 28px 8px; background: rgba(30,158,255,0.03); border-top: 1px solid rgba(30,158,255,0.08); border-bottom: 1px solid rgba(30,158,255,0.06); }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .info-field { padding: 16px 28px; border-bottom: 1px solid rgba(30,158,255,0.06); border-right: 1px solid rgba(30,158,255,0.06); }
        .info-field:nth-child(3n) { border-right: none; }
        .info-field.two { grid-column: span 2; }
        .info-field.full { grid-column: 1/-1; border-right: none; }
        .field-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; margin-bottom: 6px; }
        .field-value { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #c0cfe0; word-break: break-word; line-height: 1.4; }
        .field-value.cyan { color: #00ffff; } .field-value.green { color: #00ff88; }
        .field-value.amber { color: #f59e0b; } .field-value.blue { color: #1e9eff; }
        .field-value.muted { color: #5a7a94; font-size: 11px; }
        .use-block { margin: 0 28px 16px; padding: 14px 18px; background: #050d14; border-left: 3px solid; margin-top: 14px; }
        .use-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; margin-bottom: 4px; }
        .use-value { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 600; }
        .carrier-note { padding: 14px 28px 0; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #5a7a94; line-height: 1.7; }
        .carrier-note a { color: #1e9eff; text-decoration: none; }
        .osint-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 16px 28px 20px; }
        .osint-link { display: flex; flex-direction: column; gap: 3px; padding: 14px 16px; background: #050d14; border: 1px solid rgba(30,158,255,0.1); text-decoration: none; transition: all 0.2s; }
        .osint-link:hover { border-color: rgba(30,158,255,0.3); background: rgba(30,158,255,0.05); }
        .osint-link-name { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 600; color: #c0cfe0; }
        .osint-link-desc { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #5a7a94; }
        .osint-link-arrow { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #1e9eff; margin-top: 6px; }
        .privacy-note { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #5a7a94; padding: 12px 28px 18px; border-top: 1px solid rgba(30,158,255,0.06); line-height: 1.8; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 32px 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        .footer-copy span { color: #1e9eff; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .hero { padding: 32px 20px; } .tool-section { padding: 20px 20px 32px; }
          .info-grid { grid-template-columns: 1fr 1fr; }
          .info-field.two { grid-column: span 2; }
          .osint-grid { grid-template-columns: 1fr 1fr; }
          footer { padding: 24px 20px; } .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
        }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('plMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="plMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('plMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/cybersecurity">Cybersecurity</a><a href="/intelligence">Intelligence</a>
          <a href="/geopolitics">Geopolitics</a><a href="/national-security">National Security</a>
          <a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">Identity Intelligence</div></div>
            <div className="hero-title">Phone Number <span>OSINT</span></div>
            <p className="hero-sub">A phone number reveals more than most people think — the country it's registered in, whether it's a mobile, landline, or VoIP number, and the carrier that issued it. Enter any number to identify its origin and type, then launch directly into carrier lookups and open-source databases for deeper investigation.</p>
          </div>
        </div>

        <div className="tool-section">
          <div className="search-row">
            <input className="search-input" placeholder="+1 202 456 1111" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
            <button className="search-btn" onClick={handleAnalyze}>Analyze</button>
          </div>
          <div className="hint">Include country code — <span>+1</span> US, <span>+44</span> UK, <span>+7</span> Russia, <span>+86</span> China</div>
          {error && <div className="error-bar">{error}</div>}

          {result && (
            <div className="result-card">
              <div className="result-header">
                <div className="result-number">{result.international || result.e164}</div>
                <div className="result-badges">
                  <span className={`badge ${result.valid ? 'badge-valid' : result.possible ? 'badge-possible' : 'badge-invalid'}`}>
                    {result.valid ? 'Valid Number' : result.possible ? 'Possibly Valid' : 'Invalid Number'}
                  </span>
                  <span className="badge" style={{color: typeColor, borderColor:`${typeColor}44`, background:`${typeColor}0d`}}>
                    {TYPE_LABELS[result.type] || result.type}
                  </span>
                </div>
              </div>

              {/* Likely use */}
              {use && (
                <div className="use-block" style={{borderLeftColor: use.color}}>
                  <div className="use-label">Likely Use</div>
                  <div className="use-value" style={{color: use.color}}>{use.label}</div>
                </div>
              )}

              <div className="section-label">Number Intelligence</div>
              <div className="info-grid">
                <div className="info-field two">
                  <div className="field-label">Country</div>
                  <div className="field-value cyan">{result.countryName} ({result.country})</div>
                </div>
                <div className="info-field">
                  <div className="field-label">Calling Code</div>
                  <div className="field-value amber">+{result.callingCode}</div>
                </div>
                {result.areaInfo && (
                  <div className="info-field full">
                    <div className="field-label">Area Code Location</div>
                    <div className="field-value blue">{result.areaInfo}</div>
                  </div>
                )}
                <div className="info-field">
                  <div className="field-label">Line Type</div>
                  <div className="field-value" style={{color: typeColor}}>{TYPE_LABELS[result.type]}</div>
                </div>
                <div className="info-field two">
                  <div className="field-label">Carrier / Network</div>
                  <div className="field-value muted">Requires live HLR lookup — see carrier links below</div>
                </div>
              </div>

              <div className="section-label">Number Formats</div>
              <div className="info-grid">
                <div className="info-field full">
                  <div className="field-label">International Format</div>
                  <div className="field-value green">{result.international}</div>
                </div>
                <div className="info-field two">
                  <div className="field-label">National / Local Format</div>
                  <div className="field-value">{result.national}</div>
                </div>
                <div className="info-field">
                  <div className="field-label">E.164 (Standard)</div>
                  <div className="field-value muted">{result.e164}</div>
                </div>
                <div className="info-field">
                  <div className="field-label">National Number</div>
                  <div className="field-value muted">{result.nationalNumber}</div>
                </div>
              </div>

              <div className="section-label">Carrier & Identity Lookup</div>
              <div className="osint-grid">
                <a className="osint-link" href={`https://www.truecaller.com/search/${result.country?.toLowerCase()}/${result.nationalNumber}`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">TrueCaller</div>
                  <div className="osint-link-desc">Caller ID, spam reports, name lookup</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.spydialer.com/`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">SpyDialer</div>
                  <div className="osint-link-desc">Reverse lookup & voicemail reveal</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.carrierlookup.com/index.php?api_key=&number=${result.e164}`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">CarrierLookup</div>
                  <div className="osint-link-desc">Live carrier / network identification</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.numverify.com/`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">Numverify</div>
                  <div className="osint-link-desc">Carrier, line type, validity API</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.whitepages.com/phone/${numForLinks}`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">WhitePages</div>
                  <div className="osint-link-desc">Name, address, owner records (US)</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.shouldianswer.com/phone-number/${numForLinks}`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">Should I Answer</div>
                  <div className="osint-link-desc">Spam, scam & robocall reports</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.hlrlookup.com/`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">HLR Lookup</div>
                  <div className="osint-link-desc">SIM active status & real-time carrier</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.411.com/phone/${result.nationalNumber}`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">411.com</div>
                  <div className="osint-link-desc">Public directory & business records</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
                <a className="osint-link" href={`https://www.google.com/search?q=${intlEncoded}`} target="_blank" rel="noopener noreferrer">
                  <div className="osint-link-name">Google Search</div>
                  <div className="osint-link-desc">Open-web mentions & business listings</div>
                  <div className="osint-link-arrow">Search →</div>
                </a>
              </div>
              <div className="privacy-note">
                All parsing is client-side (libphonenumber-js) — this number is never sent to our servers. OSINT links open third-party services in a new tab. Carrier identification requires a live HLR lookup service.
              </div>
            </div>
          )}
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            
          </div>
        </footer>
      </div>
    </>
  );
}
