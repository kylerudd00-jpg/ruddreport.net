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

  const runAnalyze = (val: string) => {
    setError(''); setResult(null);
    const v = val.trim();
    if (!v) { setError('Enter a phone number to analyze.'); return; }
    const r = analyze(v);
    if (!r) { setError('Could not parse this number. Include the country code — e.g. +1 for US, +44 for UK.'); return; }
    setResult(r);
  };
  const handleAnalyze = () => runAnalyze(input);
  const runExample = (v: string) => { setInput(v); runAnalyze(v); };

  const typeColor = result ? (TYPE_COLORS[result.type] || '#5a7a94') : '#5a7a94';
  const use = result ? getLikelyUse(result.type) : null;
  const numForLinks = result ? result.e164.replace('+', '') : '';
  const intlEncoded = result ? encodeURIComponent(result.international) : '';

  return (
    <>
      <style>{`
        .page-wrap { padding-top: 70px; }
        .hero { padding: 64px 40px 40px; border-bottom: 1px solid var(--border); }
        .hero-inner { max-width: 1200px; margin: 0 auto; }
        .hero-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .hero-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .hero-title { font-family: var(--font-display); font-size: clamp(36px, 5.5vw, 72px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; line-height: 0.98; margin-bottom: 16px; }
        .hero-title span { color: var(--accent); }
        .hero-sub { font-size: 16px; color: var(--text-secondary); max-width: 620px; line-height: 1.7; }
        .tool-section { padding: 40px 40px 56px; max-width: 920px; margin: 0 auto; }
        .search-row { display: flex; margin-bottom: 10px; }
        .search-input { flex: 1; background: var(--bg-secondary); border: 1px solid var(--border-bright); border-right: none; padding: 15px 18px; font-family: var(--font-mono); font-size: 16px; color: var(--text-primary); letter-spacing: 0.06em; }
        .search-input::placeholder { color: var(--text-muted); letter-spacing: 0.03em; }
        .search-input:focus { border-color: var(--accent); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #000; background: var(--accent); border: 1px solid var(--accent); padding: 15px 28px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
        .search-btn:hover { background: #4db3ff; }
        .hint { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.03em; color: var(--text-muted); margin-bottom: 14px; }
        .hint span { color: var(--text-secondary); }
        .ex-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
        .ex-row-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
        .ex-row button { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer; }
        .ex-row button:hover, .ex-row button:focus-visible { color: #fff; border-color: var(--accent); }
        .error-bar { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.3); padding: 12px 16px; margin-bottom: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.03em; color: var(--red); }
        .result-card { border: 1px solid var(--border); background: var(--bg-secondary); }
        .result-header { padding: 24px 28px; border-bottom: 1px solid var(--border); }
        .result-number { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: 0; margin-bottom: 14px; }
        .result-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; padding: 4px 11px; text-transform: uppercase; border: 1px solid; }
        .badge-valid { color: #22cc66; border-color: rgba(34,204,102,0.4); background: rgba(34,204,102,0.08); }
        .badge-invalid { color: var(--red); border-color: rgba(255,77,77,0.4); background: rgba(255,77,77,0.08); }
        .badge-possible { color: #ffaa00; border-color: rgba(255,170,0,0.4); background: rgba(255,170,0,0.08); }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; padding: 14px 28px 10px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .info-field { padding: 16px 28px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
        .info-field:nth-child(3n) { border-right: none; }
        .info-field.two { grid-column: span 2; }
        .info-field.full { grid-column: 1/-1; border-right: none; }
        .field-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 7px; }
        .field-value { font-family: var(--font-mono); font-size: 13.5px; color: var(--text-primary); word-break: break-word; line-height: 1.45; }
        .field-value.cyan { color: #00c9b0; } .field-value.green { color: #22cc66; }
        .field-value.amber { color: #ffaa00; } .field-value.blue { color: var(--accent); }
        .field-value.muted { color: var(--text-secondary); font-size: 12.5px; }
        .use-block { margin: 14px 28px 16px; padding: 14px 18px; background: var(--bg-card); border-left: 3px solid; }
        .use-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; }
        .use-value { font-family: var(--font-display); font-size: 17px; font-weight: 700; }
        .carrier-note { padding: 14px 28px 0; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; color: var(--text-secondary); line-height: 1.7; }
        .carrier-note a { color: var(--accent); text-decoration: none; }
        .osint-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; padding: 16px 28px 24px; }
        .osint-link { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--bg-card); border: 1px solid var(--border); text-decoration: none; transition: all 0.2s; }
        .osint-link:hover, .osint-link:focus-visible { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .osint-link-name { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .osint-link:hover .osint-link-name { color: var(--accent); }
        .osint-link-desc { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.01em; color: var(--text-secondary); }
        .osint-link-arrow { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin-top: 6px; }
        .privacy-note { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.01em; color: var(--text-muted); padding: 14px 28px 20px; border-top: 1px solid var(--border); line-height: 1.8; }
        footer { border-top: 1px solid var(--border); padding: 32px 40px; background: var(--bg-secondary); margin-top: 48px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); text-transform: uppercase; }
        @media (max-width: 768px) {
          .hero { padding: 48px 16px 32px; } .tool-section { padding: 28px 16px 40px; }
          .info-grid { grid-template-columns: 1fr 1fr; }
          .info-field.two { grid-column: span 2; }
          .osint-grid { grid-template-columns: 1fr 1fr; }
          footer { padding: 24px 16px; } .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">Identity Intelligence</div></div>
            <h1 className="hero-title">Phone Number <span>OSINT</span></h1>
            <p className="hero-sub">Find a number&apos;s country, line type, and carrier — then jump into deeper lookups.</p>
          </div>
        </div>

        <div className="tool-section">
          <div className="search-row">
            <input className="search-input" aria-label="Phone number to analyze" placeholder="+1 202 456 1111" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
            <button type="button" className="search-btn" onClick={handleAnalyze}>Analyze</button>
          </div>
          <div className="hint">Include the country code — <span>+1</span> US, <span>+44</span> UK, <span>+7</span> Russia, <span>+86</span> China</div>
          <div className="ex-row" role="group" aria-label="Example numbers to try">
            <span className="ex-row-label" aria-hidden="true">Try</span>
            {['+1 202 456 1111', '+44 20 7946 0958'].map(v => (
              <button key={v} type="button" onClick={() => runExample(v)}>{v}</button>
            ))}
          </div>
          <div aria-live="polite">
          {error && <div className="error-bar" role="alert">{error}</div>}

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

              <h2 className="section-label">Number Intelligence</h2>
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

              <h2 className="section-label">Number Formats</h2>
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

              <h2 className="section-label">Carrier &amp; Identity Lookup</h2>
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
        </div>

        <footer>
          <div className="footer-bottom">
            <span>© 2026 The Rudd Report</span>
            <span>Open-source intelligence &amp; analysis</span>
          </div>
        </footer>
      </main>
    </>
  );
}
