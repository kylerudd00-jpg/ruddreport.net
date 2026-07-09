'use client';
import { useState, useRef, useCallback } from 'react';
import { Camera, MapPin } from 'lucide-react';

export default function MetadataExtractor() {
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File must be an image (JPEG, PNG, TIFF, HEIC, WebP)');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const exifr = (await import('exifr')).default;
      const data = await exifr.parse(file, { tiff: true, exif: true, gps: true, iptc: true, xmp: true });

      setResult({
        filename: file.name,
        size: file.size,
        type: file.type,
        raw: data || null,
      });
    } catch (e: any) {
      setError(`Failed to parse metadata: ${e.message}`);
    }
    setLoading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const fmt = (val: any) => {
    if (val === null || val === undefined) return null;
    if (val instanceof Date) return val.toLocaleString();
    if (typeof val === 'number') return val.toString();
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const extract = (raw: any) => {
    if (!raw) return null;
    const d = raw;

    const date = d.DateTimeOriginal || d.CreateDate || d.ModifyDate || d.DateTime;
    const device = [d.Make, d.Model].filter(Boolean).join(' ');
    const lens = [d.LensMake, d.LensModel].filter(Boolean).join(' ');
    const software = d.Software;
    const lat = d.latitude;
    const lon = d.longitude;
    const altitude = d.GPSAltitude;
    const width = d.ExifImageWidth || d.ImageWidth;
    const height = d.ExifImageHeight || d.ImageHeight;
    const iso = d.ISO || d.ISOSpeedRatings;
    const exposure = d.ExposureTime;
    const fstop = d.FNumber;
    const focal = d.FocalLength;
    const flash = d.Flash;
    const whiteBalance = d.WhiteBalance;
    const orientation = d.Orientation;
    const artist = d.Artist || d.XPAuthor;
    const copyright = d.Copyright;
    const description = d.ImageDescription || d.XPTitle;
    const serialBody = d.BodySerialNumber;
    const serialLens = d.LensSerialNumber;
    const owner = d.CameraOwnerName;

    return {
      location: (lat && lon) ? { lat, lon, altitude } : null,
      datetime: fmt(date),
      device: device || null,
      lens: lens || null,
      software: software ? fmt(software) : null,
      dimensions: (width && height) ? `${width} × ${height} px` : null,
      camera: {
        iso: iso ? `ISO ${iso}` : null,
        exposure: exposure ? `${exposure}s` : null,
        fstop: fstop ? `f/${fstop}` : null,
        focal: focal ? `${focal}mm` : null,
        flash: flash !== undefined ? fmt(flash) : null,
        whiteBalance: whiteBalance !== undefined ? fmt(whiteBalance) : null,
        orientation: orientation !== undefined ? fmt(orientation) : null,
      },
      identity: {
        artist: artist ? fmt(artist) : null,
        copyright: copyright ? fmt(copyright) : null,
        description: description ? fmt(description) : null,
        serialBody: serialBody ? fmt(serialBody) : null,
        serialLens: serialLens ? fmt(serialLens) : null,
        owner: owner ? fmt(owner) : null,
      },
    };
  };

  const intel = result?.raw ? extract(result.raw) : null;
  const hasGPS = intel?.location?.lat && intel?.location?.lon;
  const mapsUrl = hasGPS && intel?.location ? `https://www.google.com/maps?q=${intel.location.lat},${intel.location.lon}` : null;

  const cameraFields = intel ? Object.entries(intel.camera).filter(([, v]) => v !== null) : [];
  const identityFields = intel ? Object.entries(intel.identity).filter(([, v]) => v !== null) : [];

  const CAMERA_LABELS: Record<string, string> = {
    iso: 'ISO Speed', exposure: 'Exposure Time', fstop: 'Aperture',
    focal: 'Focal Length', flash: 'Flash', whiteBalance: 'White Balance', orientation: 'Orientation',
  };

  const IDENTITY_LABELS: Record<string, string> = {
    artist: 'Artist / Author', copyright: 'Copyright', description: 'Description',
    serialBody: 'Body Serial Number', serialLens: 'Lens Serial Number', owner: 'Camera Owner',
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 700px; }
        .warning-bar { max-width: 1100px; margin: 24px auto 0; background: rgba(255,58,58,0.06); border: 1px solid rgba(255,58,58,0.2); padding: 14px 24px; display: flex; align-items: center; gap: 12px; }
        .warning-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); text-transform: uppercase; }
        .upload-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .drop-zone { border: 2px dashed var(--border-bright); background: var(--bg-card); padding: 60px 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; cursor: pointer; transition: all 0.3s; text-align: center; }
        .drop-zone:hover, .drop-zone.dragging { border-color: var(--accent); background: var(--bg-card-hover); }
        .drop-icon { color: var(--accent); opacity: 0.6; }
        .drop-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; text-transform: uppercase; }
        .drop-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .drop-formats { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); border: 1px solid var(--border); padding: 4px 14px; text-transform: uppercase; }
        .results { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
        .file-header { background: var(--bg-card); border: 1px solid var(--border); padding: 20px 28px; margin-bottom: 2px; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .file-preview { width: 80px; height: 80px; object-fit: cover; border: 1px solid var(--border); }
        .file-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--accent); letter-spacing: 0.05em; margin-bottom: 6px; word-break: break-all; }
        .file-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .file-meta-item { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .file-meta-item span { color: var(--text-primary); }
        .gps-alert { background: rgba(255,58,58,0.08); border: 1px solid rgba(255,58,58,0.3); padding: 20px 28px; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .gps-alert-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--red); text-transform: uppercase; margin-bottom: 8px; }
        .gps-alert-coords { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--red); }
        .gps-alt { font-family: var(--font-mono); font-size: 12px; color: var(--red); opacity: 0.7; margin-top: 4px; letter-spacing: 0.05em; }
        .gps-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--red); border: 1px solid rgba(255,58,58,0.4); padding: 10px 20px; text-decoration: none; text-transform: uppercase; transition: all 0.3s; white-space: nowrap; }
        .gps-link:hover { background: rgba(255,58,58,0.1); }
        .intel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 2px; }
        .intel-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; }
        .intel-card.highlight { border-color: var(--border); background: var(--bg-card-hover); }
        .intel-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
        .intel-value { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); line-height: 1.3; }
        .intel-value.green { color: var(--accent); }
        .intel-value.blue { color: var(--accent); }
        .intel-value.orange { color: #ffaa00; }
        .section-card { background: var(--bg-card); border: 1px solid var(--border); margin-bottom: 2px; }
        .section-head { padding: 14px 24px; border-bottom: 1px solid var(--border); }
        .section-head-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .field-rows { display: grid; grid-template-columns: repeat(2, 1fr); }
        .field-row { padding: 14px 24px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
        .field-row:nth-child(even) { border-right: none; }
        .field-key { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        .field-val { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); letter-spacing: 0.05em; word-break: break-all; }
        .no-metadata { background: var(--bg-card); border: 1px solid var(--border); padding: 40px; text-align: center; }
        .no-metadata-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; }
        .no-metadata-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); line-height: 1.8; }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--red); padding: 20px 0; text-transform: uppercase; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px; }
          .upload-wrap { padding: 24px 20px; }
          .results { padding: 0 20px 60px; }
          .intel-grid { grid-template-columns: 1fr; }
          .field-rows { grid-template-columns: 1fr; }
          .field-row { border-right: none; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">OSINT Hub — Image Intelligence</div>
            </div>
            <h1 className="tool-title">Metadata Extractor</h1>
            <p className="tool-desc">Most photos secretly embed GPS coordinates, the exact device that took them, and precise timestamps — information most people never know is there. Upload any image to extract this hidden data. Journalists use it to verify where a photo was actually taken. Investigators use it to catch inconsistencies in someone's claimed location or timeline. Runs entirely in your browser.</p>
          </div>
          <div className="warning-bar">
            <div className="warning-text">⚠ &nbsp; Privacy Warning — Photos taken on smartphones often contain exact GPS coordinates. Never share unstripped photos publicly.</div>
          </div>
        </div>

        <div className="upload-wrap">
          <input ref={fileRef} type="file" accept="image/*" aria-label="Upload image to extract metadata" style={{display:'none'}} onChange={onFileChange} />
          <div
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="drop-icon"><Camera size={48} strokeWidth={1} /></div>
            <div className="drop-title">Drop Image Here or Click to Upload</div>
            <div className="drop-sub">Your image never leaves your device</div>
            <div className="drop-formats">JPEG · PNG · TIFF · HEIC · WebP · RAW</div>
          </div>
        </div>

        <div className="results" aria-live="polite">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars" aria-hidden="true"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">Extracting metadata...</div>
            </div>
          )}
          {error && <div className="error-msg" role="alert">{error}</div>}

          {result && (
            <>
              <div className="file-header">
                {preview && <img src={preview} className="file-preview" alt="preview" />}
                <div>
                  <div className="file-name">{result.filename}</div>
                  <div className="file-meta">
                    <div className="file-meta-item">Size: <span>{formatFileSize(result.size)}</span></div>
                    <div className="file-meta-item">Type: <span>{result.type}</span></div>
                  </div>
                </div>
              </div>

              {!intel ? (
                <div className="no-metadata">
                  <div className="no-metadata-title">No Metadata Found</div>
                  <p className="no-metadata-sub">This image has no embedded metadata — it may have been stripped already,<br/>or it was a screenshot or web-exported image.</p>
                </div>
              ) : (
                <>
                {hasGPS && intel?.location && (
  <div className="gps-alert">
    <div>
      <div className="gps-alert-label">GPS Location Detected</div>
      <div className="gps-alert-coords">{intel.location.lat!.toFixed(6)}°, {intel.location.lon!.toFixed(6)}°</div>
      {intel.location.altitude && <div className="gps-alt">Altitude: {intel.location.altitude.toFixed(1)}m</div>}
    </div>
    <a href={mapsUrl!} target="_blank" rel="noopener noreferrer" className="gps-link" style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><MapPin size={14} strokeWidth={1.5} /> View on Map →</a>
  </div>
)}

                  <div className="intel-grid">
                    {intel.device && (
                      <div className="intel-card highlight">
                        <div className="intel-label">Device</div>
                        <div className="intel-value blue">{intel.device}</div>
                      </div>
                    )}
                    {intel.datetime && (
                      <div className="intel-card">
                        <div className="intel-label">Date & Time Taken</div>
                        <div className="intel-value orange">{intel.datetime}</div>
                      </div>
                    )}
                    {intel.dimensions && (
                      <div className="intel-card">
                        <div className="intel-label">Resolution</div>
                        <div className="intel-value">{intel.dimensions}</div>
                      </div>
                    )}
                    {intel.software && (
                      <div className="intel-card">
                        <div className="intel-label">Software / OS</div>
                        <div className="intel-value">{intel.software}</div>
                      </div>
                    )}
                    {intel.lens && (
                      <div className="intel-card">
                        <div className="intel-label">Lens</div>
                        <div className="intel-value">{intel.lens}</div>
                      </div>
                    )}
                  </div>

                  {cameraFields.length > 0 && (
                    <div className="section-card">
                      <div className="section-head">
                        <div className="section-head-label">Camera Settings</div>
                      </div>
                      <div className="field-rows">
                        {cameraFields.map(([key, val]) => (
                          <div key={key} className="field-row">
                            <div className="field-key">{CAMERA_LABELS[key] || key}</div>
                            <div className="field-val">{val as string}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {identityFields.length > 0 && (
                    <div className="section-card">
                      <div className="section-head">
                        <div className="section-head-label">Identity & Ownership</div>
                      </div>
                      <div className="field-rows">
                        {identityFields.map(([key, val]) => (
                          <div key={key} className="field-row">
                            <div className="field-key">{IDENTITY_LABELS[key] || key}</div>
                            <div className="field-val">{val as string}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>

          </div>
        </footer>
      </main>
    </>
  );
}
