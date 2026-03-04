import { NextResponse } from 'next/server';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'CAA'];

async function queryDNS(domain: string, type: string) {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
    const data = await res.json();
    return { type, answers: data.Answer || [], status: data.Status };
  } catch {
    return { type, answers: [], status: -1 };
  }
}

function detectEmailProvider(mxRecords: any[]) {
  const hosts = mxRecords.map(r => r.data?.toLowerCase() || '');
  if (hosts.some(h => h.includes('google') || h.includes('googlemail') || h.includes('aspmx'))) return 'Google Workspace';
  if (hosts.some(h => h.includes('outlook') || h.includes('microsoft') || h.includes('protection.outlook') || h.includes('mail.protection'))) return 'Microsoft 365';
  if (hosts.some(h => h.includes('mimecast'))) return 'Mimecast';
  if (hosts.some(h => h.includes('proofpoint') || h.includes('pphosted'))) return 'Proofpoint';
  if (hosts.some(h => h.includes('mailchimp') || h.includes('mandrillapp'))) return 'Mailchimp / Mandrill';
  if (hosts.some(h => h.includes('sendgrid'))) return 'SendGrid';
  if (hosts.some(h => h.includes('amazonses') || h.includes('amazonaws'))) return 'Amazon SES';
  if (hosts.some(h => h.includes('zoho'))) return 'Zoho Mail';
  if (hosts.some(h => h.includes('fastmail'))) return 'Fastmail';
  if (hosts.some(h => h.includes('protonmail') || h.includes('proton.me'))) return 'ProtonMail';
  if (hosts.some(h => h.includes('icloud') || h.includes('apple'))) return 'Apple iCloud Mail';
  if (hosts.some(h => h.includes('yahoo'))) return 'Yahoo Mail';
  if (hosts.some(h => h.includes('mailgun'))) return 'Mailgun';
  if (hosts.some(h => h.includes('sparkpost') || h.includes('messagebird'))) return 'SparkPost / MessageBird';
  if (hosts.some(h => h.includes('postmark'))) return 'Postmark';
  if (hosts.some(h => h.includes('rackspace'))) return 'Rackspace Email';
  if (hosts.some(h => h.includes('godaddy') || h.includes('secureserver'))) return 'GoDaddy Email';
  if (hosts.some(h => h.includes('namecheap') || h.includes('privateemail') || h.includes('registrar-servers'))) return 'Namecheap Private Email';
  if (hosts.some(h => h.includes('bluehost'))) return 'Bluehost Email';
  if (hosts.some(h => h.includes('hostgator'))) return 'HostGator Email';
  if (hosts.some(h => h.includes('dreamhost'))) return 'DreamHost Email';
  if (hosts.some(h => h.includes('hover'))) return 'Hover Email';
  if (hosts.some(h => h.includes('tutanota'))) return 'Tutanota';
  if (hosts.some(h => h.includes('hushmail'))) return 'Hushmail';
  if (hosts.some(h => h.includes('mx.yandex') || h.includes('yandex'))) return 'Yandex Mail';
  if (hosts.some(h => h.includes('barracuda'))) return 'Barracuda Email Security';
  if (hosts.some(h => h.includes('forcepoint'))) return 'Forcepoint Email Security';
  if (hosts.some(h => h.includes('cisco') || h.includes('ironport'))) return 'Cisco IronPort';
  if (hosts.some(h => h.includes('sophos'))) return 'Sophos Email';
  if (hosts.some(h => h.includes('trendmicro'))) return 'Trend Micro Email Security';
  if (hosts.some(h => h.includes('messagelabs') || h.includes('symantec'))) return 'Symantec / Broadcom Email';
  if (hosts.length > 0) return 'Self-hosted / Unknown';
  return null;
}

function detectDNSProvider(nsRecords: any[]) {
  const hosts = nsRecords.map(r => r.data?.toLowerCase() || '');
  if (hosts.some(h => h.includes('cloudflare'))) return 'Cloudflare';
  if (hosts.some(h => h.includes('awsdns') || h.includes('amazonaws'))) return 'AWS Route 53';
  if (hosts.some(h => h.includes('googledomains') || h.includes('google') || h.includes('googledomains'))) return 'Google Cloud DNS';
  if (hosts.some(h => h.includes('azure') || h.includes('microsoft') || h.includes('msft'))) return 'Azure DNS';
  if (hosts.some(h => h.includes('namecheap') || h.includes('registrar-servers.com'))) return 'Namecheap';
  if (hosts.some(h => h.includes('godaddy') || h.includes('domaincontrol'))) return 'GoDaddy';
  if (hosts.some(h => h.includes('dnsimple'))) return 'DNSimple';
  if (hosts.some(h => h.includes('nsone') || h.includes('ns1.com'))) return 'NS1';
  if (hosts.some(h => h.includes('vercel-dns') || h.includes('vercel'))) return 'Vercel';
  if (hosts.some(h => h.includes('netlify'))) return 'Netlify';
  if (hosts.some(h => h.includes('squarespace'))) return 'Squarespace';
  if (hosts.some(h => h.includes('wixdns') || h.includes('wix'))) return 'Wix';
  if (hosts.some(h => h.includes('shopify'))) return 'Shopify';
  if (hosts.some(h => h.includes('wordpress') || h.includes('automattic'))) return 'WordPress / Automattic';
  if (hosts.some(h => h.includes('bluehost'))) return 'Bluehost';
  if (hosts.some(h => h.includes('hostgator'))) return 'HostGator';
  if (hosts.some(h => h.includes('dreamhost'))) return 'DreamHost';
  if (hosts.some(h => h.includes('digitalocean'))) return 'DigitalOcean';
  if (hosts.some(h => h.includes('linode') || h.includes('akamai'))) return 'Akamai / Linode';
  if (hosts.some(h => h.includes('fastly'))) return 'Fastly';
  if (hosts.some(h => h.includes('dyn') || h.includes('dynect'))) return 'Dyn / Oracle';
  if (hosts.some(h => h.includes('ultradns'))) return 'UltraDNS';
  if (hosts.some(h => h.includes('neustar'))) return 'Neustar DNS';
  if (hosts.some(h => h.includes('verisign'))) return 'VeriSign';
  if (hosts.some(h => h.includes('networksolutions'))) return 'Network Solutions';
  if (hosts.some(h => h.includes('hover'))) return 'Hover';
  if (hosts.some(h => h.includes('gandi'))) return 'Gandi';
  if (hosts.some(h => h.includes('porkbun'))) return 'Porkbun';
  if (hosts.some(h => h.includes('name.com'))) return 'Name.com';
  if (hosts.some(h => h.includes('1and1') || h.includes('ionos'))) return 'IONOS / 1&1';
  if (hosts.some(h => h.includes('ovh'))) return 'OVH';
  if (hosts.some(h => h.includes('hetzner'))) return 'Hetzner';
  if (hosts.some(h => h.includes('vultr'))) return 'Vultr';
  if (hosts.some(h => h.includes('rackspace'))) return 'Rackspace';
  if (hosts.some(h => h.includes('hurricane') || h.includes('he.net'))) return 'Hurricane Electric';
  if (hosts.length > 0) return 'Unknown Provider';
  return null;
}

function detectServices(txtRecords: any[]) {
  const services: string[] = [];
  const txts = txtRecords.map(r => r.data?.toLowerCase() || '');
  if (txts.some(t => t.includes('google-site-verification'))) services.push('Google Search Console');
  if (txts.some(t => t.includes('facebook-domain-verification'))) services.push('Facebook / Meta');
  if (txts.some(t => t.includes('apple-domain-verification'))) services.push('Apple');
  if (txts.some(t => t.includes('ms='))) services.push('Microsoft 365');
  if (txts.some(t => t.includes('atlassian-domain-verification'))) services.push('Atlassian (Jira/Confluence)');
  if (txts.some(t => t.includes('docusign'))) services.push('DocuSign');
  if (txts.some(t => t.includes('stripe-verification'))) services.push('Stripe');
  if (txts.some(t => t.includes('hubspot'))) services.push('HubSpot');
  if (txts.some(t => t.includes('sendgrid'))) services.push('SendGrid');
  if (txts.some(t => t.includes('salesforce'))) services.push('Salesforce');
  if (txts.some(t => t.includes('zendesk'))) services.push('Zendesk');
  if (txts.some(t => t.includes('adobe'))) services.push('Adobe');
  if (txts.some(t => t.includes('shopify'))) services.push('Shopify');
  if (txts.some(t => t.includes('zoom'))) services.push('Zoom');
  if (txts.some(t => t.includes('slack'))) services.push('Slack');
  if (txts.some(t => t.includes('dropbox'))) services.push('Dropbox');
  if (txts.some(t => t.includes('twilio'))) services.push('Twilio');
  if (txts.some(t => t.includes('mailchimp'))) services.push('Mailchimp');
  if (txts.some(t => t.includes('intercom'))) services.push('Intercom');
  if (txts.some(t => t.includes('freshdesk') || t.includes('freshworks'))) services.push('Freshworks');
  if (txts.some(t => t.includes('datadog'))) services.push('Datadog');
  if (txts.some(t => t.includes('gitlab'))) services.push('GitLab');
  if (txts.some(t => t.includes('github'))) services.push('GitHub');
  if (txts.some(t => t.includes('notion'))) services.push('Notion');
  if (txts.some(t => t.includes('asana'))) services.push('Asana');
  if (txts.some(t => t.includes('monday'))) services.push('Monday.com');
  if (txts.some(t => t.includes('okta'))) services.push('Okta');
  if (txts.some(t => t.includes('duo'))) services.push('Duo Security');
  if (txts.some(t => t.includes('pingdom'))) services.push('Pingdom');
  if (txts.some(t => t.includes('segment'))) services.push('Segment');
  if (txts.some(t => t.includes('amplitude'))) services.push('Amplitude');
  if (txts.some(t => t.includes('mixpanel'))) services.push('Mixpanel');
  if (txts.some(t => t.includes('hotjar'))) services.push('Hotjar');
  if (txts.some(t => t.includes('optimizely'))) services.push('Optimizely');
  if (txts.some(t => t.includes('cloudflare'))) services.push('Cloudflare');
  if (txts.some(t => t.includes('fastly'))) services.push('Fastly');
  if (txts.some(t => t.includes('akamai'))) services.push('Akamai');
  if (txts.some(t => t.includes('twitch'))) services.push('Twitch');
  if (txts.some(t => t.includes('amazon'))) services.push('Amazon / AWS');
  if (txts.some(t => t.includes('protonmail') || t.includes('proton'))) services.push('ProtonMail');
  if (txts.some(t => t.includes('yandex'))) services.push('Yandex');
  if (txts.some(t => t.includes('zoho'))) services.push('Zoho');
  if (txts.some(t => t.includes('namecheap') || t.includes('registrar-servers'))) services.push('Namecheap');
  if (txts.some(t => t.includes('mailjet'))) services.push('Mailjet');
  if (txts.some(t => t.includes('postmark'))) services.push('Postmark');
  if (txts.some(t => t.includes('sparkpost'))) services.push('SparkPost');
  if (txts.some(t => t.includes('mandrill'))) services.push('Mandrill');
  if (txts.some(t => t.includes('klaviyo'))) services.push('Klaviyo');
  if (txts.some(t => t.includes('brevo') || t.includes('sendinblue'))) services.push('Brevo / Sendinblue');
  return services;
}

function decodeSPF(spf: string) {
  const parts = spf.replace('v=spf1', '').trim().split(' ').filter(Boolean);
  const decoded: string[] = [];
  for (const part of parts) {
    if (part === 'all') decoded.push('Allow all senders (dangerous)');
    else if (part === '-all') decoded.push('Reject all other senders (strict)');
    else if (part === '~all') decoded.push('Soft fail all other senders (permissive)');
    else if (part === '?all') decoded.push('Neutral for all other senders');
    else if (part.startsWith('include:')) decoded.push(`Allow senders from: ${part.replace('include:', '')}`);
    else if (part.startsWith('ip4:')) decoded.push(`Allow IPv4 range: ${part.replace('ip4:', '')}`);
    else if (part.startsWith('ip6:')) decoded.push(`Allow IPv6 range: ${part.replace('ip6:', '')}`);
    else if (part === 'mx') decoded.push('Allow MX record servers');
    else if (part === 'a') decoded.push('Allow A record IP addresses');
    else if (part === 'ptr') decoded.push('Allow PTR record matches (not recommended)');
    else if (part.startsWith('exists:')) decoded.push(`Allow if domain exists: ${part.replace('exists:', '')}`);
    else if (part.startsWith('redirect=')) decoded.push(`Redirect SPF to: ${part.replace('redirect=', '')}`);
    else if (part.startsWith('exp=')) decoded.push(`Explanation domain: ${part.replace('exp=', '')}`);
    else decoded.push(part);
  }
  return decoded;
}

function decodeDMARC(dmarc: string) {
  const parts = dmarc.split(';').map(p => p.trim()).filter(Boolean);
  const decoded: string[] = [];
  for (const part of parts) {
    if (part.startsWith('v=')) continue;
    else if (part.startsWith('p=')) {
      const policy = part.replace('p=', '');
      if (policy === 'none') decoded.push('Policy: Monitor only — no enforcement');
      else if (policy === 'quarantine') decoded.push('Policy: Quarantine suspicious emails (send to spam)');
      else if (policy === 'reject') decoded.push('Policy: Reject all unauthorized emails (strict)');
      else decoded.push(`Policy: ${policy}`);
    }
    else if (part.startsWith('sp=')) {
      const sp = part.replace('sp=', '');
      decoded.push(`Subdomain policy: ${sp}`);
    }
    else if (part.startsWith('rua=')) decoded.push(`Aggregate reports → ${part.replace('rua=', '')}`);
    else if (part.startsWith('ruf=')) decoded.push(`Forensic reports → ${part.replace('ruf=', '')}`);
    else if (part.startsWith('pct=')) decoded.push(`Enforcement on ${part.replace('pct=', '')}% of emails`);
    else if (part.startsWith('adkim=')) decoded.push(`DKIM alignment: ${part.replace('adkim=', '') === 'r' ? 'Relaxed' : 'Strict'}`);
    else if (part.startsWith('aspf=')) decoded.push(`SPF alignment: ${part.replace('aspf=', '') === 'r' ? 'Relaxed' : 'Strict'}`);
    else if (part.startsWith('fo=')) decoded.push(`Failure reporting: ${part.replace('fo=', '')}`);
    else if (part.startsWith('rf=')) decoded.push(`Report format: ${part.replace('rf=', '')}`);
    else if (part.startsWith('ri=')) decoded.push(`Report interval: ${part.replace('ri=', '')} seconds`);
    else decoded.push(part);
  }
  return decoded;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  if (!domain) return NextResponse.json({ error: 'No domain provided' }, { status: 400 });

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const results = await Promise.all(RECORD_TYPES.map(type => queryDNS(clean, type)));

  const recordMap: Record<string, any[]> = {};
  for (const result of results) {
    if (result.answers.length > 0) {
      recordMap[result.type] = result.answers;
    }
  }

  const emailProvider = detectEmailProvider(recordMap['MX'] || []);
  const dnsProvider = detectDNSProvider(recordMap['NS'] || []);
  const services = detectServices(recordMap['TXT'] || []);

  const spfRecord = (recordMap['TXT'] || []).find(r => r.data?.includes('v=spf1'));
  const dmarcResults = await queryDNS(`_dmarc.${clean}`, 'TXT');
  const dmarcRecord = dmarcResults.answers.find((r: any) => r.data?.includes('v=DMARC1'));

  return NextResponse.json({
    domain: clean,
    records: recordMap,
    intelligence: {
      emailProvider,
      dnsProvider,
      services,
      spfDecoded: spfRecord ? decodeSPF(spfRecord.data) : null,
      dmarcDecoded: dmarcRecord ? decodeDMARC(dmarcRecord.data) : null,
      dmarcRaw: dmarcRecord?.data || null,
      spfRaw: spfRecord?.data || null,
    }
  });
}