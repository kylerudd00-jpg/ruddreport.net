'use client';
import { useState, useEffect, useRef } from 'react';

const OFFSHORE = ['KY','VG','BM','PA','LU','MT','CY','LI','MC','GG','JE','IM','MO','BH','AG','SC','MU','TC','AI','BZ'];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#00ff88', INACTIVE: '#ff3a3a', LAPSED: '#ffaa00',
  MERGED: '#c084fc', ANNULLED: '#ff3a3a', RETIRED: '#ff3a3a',
};

export default function CorporateInvestigator() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLei, setSelectedLei] = useState('');
  const [detailPanel, setDetailPanel] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<any>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearchResults([]);
    setSearched(false);
    setGraphData(null);
    setDetailPanel(null);
    setSelectedLei('');
    try {
      const res = await fetch(`/api/corporate?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.data || []);
      setSearched(true);
    } catch (e: any) { setError(`// ${e.message}`); }
    setLoading(false);
  };

  const investigate = async (entity: any) => {
    const lei = entity.attributes?.lei || entity.id;
    setSelectedLei(lei);
    setDetailPanel(entity);
    setGraphLoading(true);
    setGraphData(null);
    try {
      const res = await fetch(`/api/corporate?lei=${lei}`);
      const data = await res.json();
      buildGraph(data.entity || entity, data.parent, data.ultimate, data.children || [], data.childrenTotal || 0);
    } catch { buildGraph(entity, null, null, [], 0); }
    setGraphLoading(false);
  };

  const buildGraph = (entity: any, parent: any, ultimate: any, children: any[], childrenTotal: number) => {
    const a = entity.attributes;
    const lei = a?.lei || entity.id;
    const country = a?.entity?.legalAddress?.country || '';
    const nodes: any[] = [
      { id: lei, name: a?.entity?.legalName?.name || 'Unknown', type: 'target', status: a?.entity?.status || '', country, isOffshore: OFFSHORE.includes(country), entity }
    ];
    const links: any[] = [];

    const ultimateLei = ultimate?.attributes?.lei || ultimate?.id;
    const parentLei = parent?.attributes?.lei || parent?.id;

    if (ultimate && ultimateLei !== lei) {
      const ua = ultimate.attributes;
      const uc = ua?.entity?.legalAddress?.country || '';
      nodes.push({ id: ultimateLei, name: ua?.entity?.legalName?.name || 'Ultimate Parent', type: 'ultimate', status: ua?.entity?.status || '', country: uc, isOffshore: OFFSHORE.includes(uc), entity: ultimate });
      links.push({ source: ultimateLei, target: parentLei && parentLei !== lei ? parentLei : lei, type: 'ultimate' });
    }

    if (parent && parentLei !== lei) {
      const pa = parent.attributes;
      const pc = pa?.entity?.legalAddress?.country || '';
      nodes.push({ id: parentLei, name: pa?.entity?.legalName?.name || 'Parent', type: 'parent', status: pa?.entity?.status || '', country: pc, isOffshore: OFFSHORE.includes(pc), entity: parent });
      links.push({ source: parentLei, target: lei, type: 'owns' });
    }

    children.slice(0, 9).forEach((child: any, i: number) => {
      const ca = child.attributes;
      const cLei = ca?.lei || child.id;
      const cc = ca?.entity?.legalAddress?.country || '';
      nodes.push({ id: cLei, name: ca?.entity?.legalName?.name || 'Subsidiary', type: 'child', status: ca?.entity?.status || '', country: cc, isOffshore: OFFSHORE.includes(cc), entity: child });
      links.push({ source: lei, target: cLei, type: 'subsidiary' });
    });

    if (childrenTotal > 9) {
      nodes.push({ id: 'more', name: `+${childrenTotal - 9} more subsidiaries`, type: 'more', status: '', country: '', isOffshore: false, entity: null });
      links.push({ source: lei, target: 'more', type: 'more' });
    }

    if (country) {
      nodes.push({ id: `ctry-${country}`, name: country, type: 'country', status: '', country, isOffshore: false, entity: null });
      links.push({ source: lei, target: `ctry-${country}`, type: 'jurisdiction' });
    }

    const reg = a?.entity?.registeredAt?.id;
    if (reg) {
      nodes.push({ id: `reg-${reg}`, name: reg.replace('RA0', 'Registry '), type: 'registry', status: '', country: '', isOffshore: false, entity: null });
      links.push({ source: lei, target: `reg-${reg}`, type: 'registered' });
    }

    setGraphData({ nodes, links });
  };

  useEffect(() => { if (graphData && svgRef.current) drawGraph(); }, [graphData]);

  const drawGraph = async () => {
    const d3 = await import('d3');
    const svg = d3.select(svgRef.current!);
    svg.selectAll('*').remove();
    const W = svgRef.current!.clientWidth || 680;
    const H = 640;
    const g = svg.append('g');

    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 4]).on('zoom', e => g.attr('transform', e.transform)));

    const nodes = graphData.nodes.map((n: any) => ({ ...n }));
    const links = graphData.links.map((l: any) => ({ ...l }));

    if (simRef.current) simRef.current.stop();

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
        if (d.type === 'ultimate') return 220;
        if (d.type === 'owns') return 180;
        if (d.type === 'subsidiary') return 160;
        return 130;
      }))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(55));
    simRef.current = sim;

    svg.append('defs').append('marker')
      .attr('id', 'arr').attr('viewBox', '0 -5 10 10').attr('refX', 30)
      .attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', 'rgba(30,158,255,0.3)');

    const linkEl = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', (d: any) => d.type === 'ultimate' ? 'rgba(255,58,58,0.5)' : d.type === 'owns' || d.type === 'subsidiary' ? 'rgba(255,170,0,0.45)' : 'rgba(30,158,255,0.2)')
      .attr('stroke-width', (d: any) => d.type === 'ultimate' ? 2.5 : d.type === 'owns' ? 2 : 1)
      .attr('stroke-dasharray', (d: any) => ['jurisdiction','registered','more'].includes(d.type) ? '4,3' : 'none')
      .attr('marker-end', 'url(#arr)');

    const linkLbl = g.append('g').selectAll('text').data(links).join('text')
      .attr('fill', 'rgba(80,120,150,0.8)').attr('font-family', 'Share Tech Mono,monospace')
      .attr('font-size', '8px').attr('text-anchor', 'middle')
      .text((d: any) => ({ ultimate:'ULTIMATE PARENT', owns:'PARENT', subsidiary:'SUBSIDIARY', jurisdiction:'DOMICILE', registered:'REGISTRY', more:'' }[d.type as string] || ''));

    const nodeG = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('cursor', (d: any) => d.entity ? 'pointer' : 'default')
      .call(d3.drag<SVGGElement,any>()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
      .on('click', (_: any, d: any) => { if (d.entity) setDetailPanel(d.entity); });

    nodeG.append('circle')
      .attr('r', (d: any) => ({ target:34, ultimate:28, parent:24, child:18, country:16, registry:14, more:16 }[d.type as string] || 16))
      .attr('fill', (d: any) => {
        if (d.type === 'country') return 'rgba(30,158,255,0.08)';
        if (d.type === 'registry' || d.type === 'more') return 'rgba(60,80,100,0.12)';
        if (d.isOffshore) return 'rgba(255,170,0,0.12)';
        const sc = STATUS_COLORS[d.status?.toUpperCase()] || '#7a9bb5';
        return `${sc}18`;
      })
      .attr('stroke', (d: any) => {
        if (d.type === 'country') return 'rgba(30,158,255,0.35)';
        if (d.type === 'registry' || d.type === 'more') return 'rgba(60,80,100,0.3)';
        if (d.isOffshore) return 'rgba(255,170,0,0.7)';
        if (d.type === 'ultimate') return 'rgba(255,58,58,0.8)';
        return STATUS_COLORS[d.status?.toUpperCase()] || '#7a9bb5';
      })
      .attr('stroke-width', (d: any) => d.type === 'target' ? 2.5 : 1.5)
      .attr('stroke-dasharray', (d: any) => d.isOffshore ? '5,3' : 'none');

    nodeG.append('text').attr('text-anchor', 'middle').attr('dy', '4px')
      .attr('fill', (d: any) => {
        if (d.type === 'country') return '#1e9eff';
        if (d.type === 'registry' || d.type === 'more') return '#3d5870';
        if (d.type === 'ultimate') return '#ff6b6b';
        return STATUS_COLORS[d.status?.toUpperCase()] || '#7a9bb5';
      })
      .attr('font-family', 'Share Tech Mono,monospace')
      .attr('font-size', (d: any) => d.type === 'target' ? '10px' : '8px')
      .text((d: any) => {
        if (d.type === 'country') return d.name;
        if (d.type === 'registry') return 'REG';
        if (d.type === 'more') return '···';
        return d.status?.substring(0, 3) || '?';
      });

    nodeG.append('text').attr('text-anchor', 'middle')
      .attr('dy', (d: any) => ({ target:50, ultimate:42, parent:38, child:30, country:28, registry:26, more:28 }[d.type as string] || 28))
      .attr('fill', (d: any) => d.type === 'target' ? '#c0cfe0' : d.isOffshore ? '#ffaa00' : '#7a9bb5')
      .attr('font-family', 'Barlow Condensed,sans-serif')
      .attr('font-size', (d: any) => d.type === 'target' ? '13px' : '11px')
      .attr('font-weight', (d: any) => d.type === 'target' ? '700' : '400')
      .each(function(d: any) {
        const el = d3.select(this);
        const maxLen = d.type === 'target' ? 22 : 18;
        const name: string = d.name || '';
        if (name.length <= maxLen) { el.text(name); return; }
        const mid = Math.ceil(name.length / 2);
        const sp = name.lastIndexOf(' ', mid);
        const split = sp > 0 ? sp : mid;
        el.append('tspan').attr('x', 0).attr('dy', 0).text(name.substring(0, split));
        el.append('tspan').attr('x', 0).attr('dy', '13px').text(name.substring(split + 1, split + 1 + maxLen) + (name.length > split + maxLen ? '…' : ''));
      });

    nodeG.filter((d: any) => d.isOffshore).append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => d.type === 'target' ? -40 : -32)
      .attr('fill', '#ffaa00').attr('font-size', '9px').attr('font-family', 'Share Tech Mono,monospace')
      .attr('letter-spacing', '1px').text('⚠ OFFSHORE');

    sim.on('tick', () => {
      linkEl.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
             .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      linkLbl.attr('x', (d: any) => (d.source.x + d.target.x) / 2).attr('y', (d: any) => (d.source.y + d.target.y) / 2);
      nodeG.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  };

  const fmt = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }); } catch { return d; } };
  const sc = (s: string) => STATUS_COLORS[s?.toUpperCase()] || '#7a9bb5';

  const pa = detailPanel?.attributes;
  const addr = pa?.entity?.legalAddress;
  const isOffshore = OFFSHORE.includes(pa?.entity?.legalAddress?.country || '');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .tool-hero { padding: 36px 40px 24px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .hero-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #ffaa00; box-shadow: 0 0 8px #ffaa00; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #ffaa00; text-transform: uppercase; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(22px, 3vw, 38px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .source-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #ffaa00; border: 1px solid rgba(255,170,0,0.3); padding: 3px 10px; text-transform: uppercase; background: rgba(255,170,0,0.06); }
        .search-bar { padding: 16px 40px; max-width: 1400px; margin: 0 auto; display: flex; gap: 8px; }
        .search-input { flex: 1; background: #0a1520; border: 1px solid rgba(255,170,0,0.3); outline: none; padding: 14px 20px; font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #ffaa00; border: none; padding: 14px 28px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #ffc233; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .main-layout { display: grid; grid-template-columns: 260px 1fr 280px; gap: 2px; padding: 0 40px 40px; max-width: 1400px; margin: 0 auto; }
        .side-panel { background: #0a1520; border: 1px solid rgba(255,170,0,0.1); overflow-y: auto; max-height: 640px; }
        .panel-header { padding: 12px 16px; border-bottom: 1px solid rgba(255,170,0,0.08); font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; position: sticky; top: 0; background: #0a1520; z-index: 1; }
        .result-item { padding: 12px 16px; border-bottom: 1px solid rgba(255,170,0,0.05); cursor: pointer; transition: background 0.2s; }
        .result-item:hover { background: rgba(255,170,0,0.04); }
        .result-item.active { background: rgba(255,170,0,0.07); border-left: 3px solid #ffaa00; padding-left: 13px; }
        .ri-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: #c0cfe0; line-height: 1.3; margin-bottom: 3px; }
        .ri-meta { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #3d5870; }
        .ri-badges { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px; }
        .ri-badge { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; padding: 2px 6px; border: 1px solid; text-transform: uppercase; }
        .graph-panel { background: #070d12; border: 1px solid rgba(30,158,255,0.08); position: relative; min-height: 640px; overflow: hidden; }
        .graph-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 640px; gap: 10px; }
        .graph-empty-icon { font-size: 36px; opacity: 0.3; }
        .graph-empty-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .graph-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(7,13,18,0.75); pointer-events: none; }
        .graph-overlay-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #ffaa00; text-transform: uppercase; animation: blink 1.5s infinite; }
        .graph-legend { position: absolute; bottom: 14px; left: 14px; display: flex; flex-direction: column; gap: 5px; background: rgba(7,13,18,0.7); padding: 10px 12px; border: 1px solid rgba(30,158,255,0.08); }
        .legend-row { display: flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #3d5870; text-transform: uppercase; }
        .legend-dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid; flex-shrink: 0; }
        .detail-panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); overflow-y: auto; max-height: 640px; }
        .detail-empty { padding: 32px 16px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-align: center; line-height: 2.5; }
        .detail-name-block { padding: 16px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .detail-name { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 700; color: #ffaa00; line-height: 1.3; margin-bottom: 5px; }
        .detail-lei { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #3d5870; word-break: break-all; }
        .detail-field { padding: 9px 16px; border-bottom: 1px solid rgba(30,158,255,0.04); }
        .df-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 4px; }
        .df-value { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c0cfe0; letter-spacing: 1px; word-break: break-all; line-height: 1.6; }
        .offshore-warn { margin: 10px 12px; background: rgba(255,170,0,0.07); border: 1px solid rgba(255,170,0,0.3); padding: 10px 12px; font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #ffaa00; text-transform: uppercase; line-height: 1.9; }
        .gleif-btn { display: block; margin: 12px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #ffaa00; text-decoration: none; border: 1px solid rgba(255,170,0,0.3); padding: 9px 12px; text-transform: uppercase; text-align: center; transition: all 0.3s; }
        .gleif-btn:hover { background: rgba(255,170,0,0.07); }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 10px 40px; text-transform: uppercase; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 30px 40px; background: #070d12; margin-top: 2px; }
        .footer-bottom { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }
        @media (max-width: 1100px) { .main-layout { grid-template-columns: 1fr; } .graph-panel { min-height: 400px; } }
        @media (max-width: 768px) { nav{padding:0 16px} .nav-links{display:none} .hamburger{display:flex} .tool-hero{padding:20px 16px} .search-bar{padding:12px 16px;flex-direction:column} .main-layout{padding:0 16px 40px} .back-bar{padding:12px 16px} footer{padding:20px 16px} .footer-bottom{flex-direction:column;gap:10px;text-align:center} }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{color:'#00ff88'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('corpMenu')?.classList.toggle('open')}>
            <span/><span/><span/>
          </div>
        </nav>

        <div className="mobile-menu" id="corpMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('corpMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="hero-inner">
            <div>
              <div className="tool-eyebrow">
                <div className="tool-eyebrow-line"/>
                <div className="tool-eyebrow-text">// OSINT Hub — Corporate Intelligence</div>
              </div>
              <div className="tool-title">Corporate Investigator</div>
            </div>
            <div className="source-tags">
              {['Global LEI Database','2M+ Entities','Parent Mapping','Subsidiary Tree','Offshore Detection','Network Graph'].map(s => (
                <div key={s} className="source-tag">{s}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="search-bar">
          <input className="search-input" placeholder="Search any company — e.g. Tesla, BlackRock, Gazprom, Deutsche Bank"
            value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          <button className="search-btn" onClick={search} disabled={loading}>{loading ? 'Searching...' : 'Investigate →'}</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="main-layout">
          <div className="side-panel">
            <div className="panel-header">{searched ? `// ${searchResults.length} entities found` : '// Search results'}</div>
            {searchResults.map((entity: any, i: number) => {
              const a = entity.attributes;
              const name = a?.entity?.legalName?.name || 'Unknown';
              const country = a?.entity?.legalAddress?.country || '';
              const status = a?.entity?.status || '';
              const lei = a?.lei || entity.id;
              const offshore = OFFSHORE.includes(country);
              return (
                <div key={i} className={`result-item ${selectedLei === lei ? 'active' : ''}`} onClick={() => investigate(entity)}>
                  <div className="ri-name">{name}</div>
                  <div className="ri-meta">{country} · {lei?.substring(0,12)}…</div>
                  <div className="ri-badges">
                    {status && <div className="ri-badge" style={{color: sc(status), borderColor: sc(status)}}>{status}</div>}
                    {offshore && <div className="ri-badge" style={{color:'#ffaa00', borderColor:'#ffaa00'}}>⚠ OFFSHORE</div>}
                  </div>
                </div>
              );
            })}
            {searched && searchResults.length === 0 && (
              <div style={{padding:'24px 16px', fontFamily:'Share Tech Mono', fontSize:'10px', letterSpacing:'2px', color:'#3d5870', textAlign:'center'}}>// No entities found</div>
            )}
          </div>

          <div className="graph-panel">
            {!graphData && !graphLoading && (
              <div className="graph-empty">
                <div className="graph-empty-icon">⬡</div>
                <div className="graph-empty-text">// Select an entity to map its network</div>
              </div>
            )}
            {graphLoading && (
              <div className="graph-overlay"><div className="graph-overlay-text">// Building entity graph...</div></div>
            )}
            {graphData && (
              <>
                <svg ref={svgRef} width="100%" height="640"/>
                <div className="graph-legend">
                  <div className="legend-row"><div className="legend-dot" style={{background:'rgba(255,58,58,0.15)', borderColor:'#ff6b6b'}}/> Ultimate Parent</div>
                  <div className="legend-row"><div className="legend-dot" style={{background:'rgba(255,170,0,0.1)', borderColor:'#ffaa00'}}/> Direct Parent</div>
                  <div className="legend-row"><div className="legend-dot" style={{background:'rgba(0,255,136,0.1)', borderColor:'#00ff88'}}/> Target Entity</div>
                  <div className="legend-row"><div className="legend-dot" style={{background:'rgba(30,158,255,0.08)', borderColor:'rgba(30,158,255,0.4)'}}/> Subsidiary</div>
                  <div className="legend-row"><div className="legend-dot" style={{background:'rgba(255,170,0,0.1)', borderColor:'#ffaa00', borderStyle:'dashed'}}/> ⚠ Offshore</div>
                </div>
              </>
            )}
          </div>

          <div className="detail-panel">
            <div className="panel-header">// Entity Detail</div>
            {!detailPanel ? (
              <div className="detail-empty">// Click any node<br/>or result to inspect</div>
            ) : (
              <>
                <div className="detail-name-block">
                  <div className="detail-name">{pa?.entity?.legalName?.name || 'Unknown'}</div>
                  <div className="detail-lei">LEI: {pa?.lei || detailPanel.id}</div>
                </div>
                {isOffshore && (
                  <div className="offshore-warn">⚠ Offshore Jurisdiction — {pa?.entity?.legalAddress?.country} is a known low-tax or secrecy jurisdiction</div>
                )}
                {pa?.entity?.status && (
                  <div className="detail-field">
                    <div className="df-label">// Status</div>
                    <div className="df-value" style={{color: sc(pa.entity.status)}}>{pa.entity.status}</div>
                  </div>
                )}
                {pa?.entity?.legalAddress?.country && (
                  <div className="detail-field">
                    <div className="df-label">// Jurisdiction</div>
                    <div className="df-value" style={{color:'#ffaa00'}}>{pa.entity.legalAddress.country}</div>
                  </div>
                )}
                {pa?.entity?.creationDate && (
                  <div className="detail-field">
                    <div className="df-label">// Created</div>
                    <div className="df-value">{fmt(pa.entity.creationDate)}</div>
                  </div>
                )}
                {pa?.entity?.registeredAs && (
                  <div className="detail-field">
                    <div className="df-label">// Registration No.</div>
                    <div className="df-value" style={{color:'#ffaa00'}}>{pa.entity.registeredAs}</div>
                  </div>
                )}
                {addr && (
                  <div className="detail-field">
                    <div className="df-label">// Registered Address</div>
                    <div className="df-value">{[addr.addressLines?.join(', '), addr.city, addr.region, addr.postalCode, addr.country].filter(Boolean).join(', ')}</div>
                  </div>
                )}
                {pa?.entity?.registeredAt?.id && (
                  <div className="detail-field">
                    <div className="df-label">// Registry</div>
                    <div className="df-value" style={{color:'#3d5870'}}>{pa.entity.registeredAt.id}</div>
                  </div>
                )}
                {pa?.entity?.category && (
                  <div className="detail-field">
                    <div className="df-label">// Category</div>
                    <div className="df-value">{pa.entity.category}</div>
                  </div>
                )}
                <a href={`https://www.gleif.org/en/lei/${pa?.lei || detailPanel.id}`} target="_blank" rel="noopener noreferrer" className="gleif-btn">
                  View Full GLEIF Record →
                </a>
              </>
            )}
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