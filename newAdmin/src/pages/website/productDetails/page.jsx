import { useEffect, useState, useCallback } from "react";
import { getData } from "../../../services/FetchNodeServices";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:        #0a0908;
    --surface:   #131110;
    --surface2:  #1c1916;
    --border:    rgba(255,255,255,0.07);
    --border2:   rgba(255,255,255,0.12);
    --gold:      #c9a84c;
    --gold-dim:  #8a6e2f;
    --gold-glow: rgba(201,168,76,0.18);
    --text:      #f0ece4;
    --muted:     #7d7568;
    --green:     #4caf7d;
    --red:       #e05c5c;
    --blue:      #2196f3;
    --radius:    14px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pd-root {
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 80px;
  }

  /* ── Navbar ── */
  .pd-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 68px; background: var(--surface);
    border-bottom: 1px solid var(--border2);
    position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px);
  }
  .pd-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
  .pd-logo-mark { font-family: 'Arial Black', Arial, sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.02em; display: flex; align-items: center; }
  .pd-logo-a { color: #f0ece4; }
  .pd-logo-c { color: #2196f3; }
  .pd-logo-divider { width: 1px; height: 34px; background: rgba(255,255,255,0.1); flex-shrink: 0; }
  .pd-logo-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; }
  .pd-logo-name { font-family: 'Arial Black', Arial, sans-serif; font-size: 0.88rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
  .pd-logo-n1 { color: #f0ece4; }
  .pd-logo-n2 { color: #2196f3; }
  .pd-logo-tagline { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }
  .pd-nav-right { display: flex; align-items: center; gap: 12px; }
  .pd-back-btn { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.06em; color: var(--muted); background: var(--surface2); border: 1px solid var(--border2); padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .pd-back-btn:hover { color: var(--gold); border-color: var(--gold-dim); }
  .pd-stock-nav-badge { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; }
  .pd-stock-nav-badge.in  { background: rgba(76,175,125,0.15); color: var(--green); border: 1px solid rgba(76,175,125,0.35); }
  .pd-stock-nav-badge.out { background: rgba(224,92,92,0.15);  color: var(--red);   border: 1px solid rgba(224,92,92,0.35); }

  /* ── Breadcrumb ── */
  .pd-breadcrumb { display: flex; align-items: center; gap: 8px; padding: 18px 40px 0; font-size: 0.76rem; color: var(--muted); flex-wrap: wrap; }
  .pd-bc-link { color: var(--gold-dim); cursor: pointer; transition: color 0.2s; }
  .pd-bc-link:hover { color: var(--gold); }
  .pd-bc-sep { color: var(--border2); }
  .pd-bc-current { color: var(--muted); }

  /* ── Main layout ── */
  .pd-main { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 32px 40px; max-width: 1300px; }
  @media (max-width: 900px) { .pd-main { grid-template-columns: 1fr; gap: 24px; padding: 20px 18px; } }

  /* ── Gallery ── */
  .pd-gallery { display: flex; flex-direction: column; gap: 12px; }
  .pd-main-img-wrap {
    width: 100%; aspect-ratio: 4/3; border-radius: var(--radius);
    overflow: hidden; background: var(--surface2);
    border: 1px solid var(--border2); position: relative;
    cursor: zoom-in;
  }
  .pd-main-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
  .pd-main-img-wrap:hover .pd-main-img { transform: scale(1.05); }
  .pd-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 5rem; background: radial-gradient(ellipse at center, #1e1a14, var(--surface2)); }
  .pd-img-counter { position: absolute; bottom: 12px; right: 12px; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; background: rgba(10,9,8,0.75); color: var(--muted); padding: 4px 10px; border-radius: 10px; backdrop-filter: blur(6px); }

  .pd-thumb-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .pd-thumb {
    width: 72px; height: 72px; border-radius: 10px; overflow: hidden;
    border: 2px solid var(--border); cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    flex-shrink: 0;
  }
  .pd-thumb:hover { transform: translateY(-2px); border-color: var(--gold-dim); }
  .pd-thumb.active { border-color: var(--gold); box-shadow: 0 0 12px var(--gold-glow); }
  .pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── Info panel ── */
  .pd-info { display: flex; flex-direction: column; gap: 20px; animation: fadeUp 0.5s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

  .pd-lot-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dim); }
  .pd-lot-number { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 700; color: var(--text); line-height: 1; margin-top: 4px; }

  /* Status row */
  .pd-status-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .pd-badge { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; }
  .pd-badge.green { background: rgba(76,175,125,0.15); color: var(--green); border: 1px solid rgba(76,175,125,0.35); }
  .pd-badge.red   { background: rgba(224,92,92,0.15);  color: var(--red);   border: 1px solid rgba(224,92,92,0.35); }
  .pd-badge.blue  { background: rgba(33,150,243,0.15); color: var(--blue);  border: 1px solid rgba(33,150,243,0.35); }
  .pd-badge.gold  { background: var(--gold-glow);      color: var(--gold);  border: 1px solid rgba(201,168,76,0.35); }

  /* Price block */
  .pd-price-block { background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius); padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .pd-price-item { display: flex; flex-direction: column; gap: 3px; }
  .pd-price-item-label { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase; }
  .pd-price-main { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 700; color: var(--gold); line-height: 1; }
  .pd-price-sub { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: var(--text); line-height: 1; }
  .pd-price-divider { width: 1px; height: 44px; background: var(--border2); }

  /* Info grid */
  .pd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .pd-info-cell { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; transition: border-color 0.2s; }
  .pd-info-cell:hover { border-color: var(--border2); }
  .pd-info-cell-label { font-size: 0.58rem; color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 4px; }
  .pd-info-cell-val { font-size: 1rem; font-weight: 600; color: var(--text); }
  .pd-info-cell-val.gold { color: var(--gold); }
  .pd-info-cell-val.green { color: var(--green); }

  /* Sizes section */
  .pd-section-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 10px; }
  .pd-sizes { display: flex; gap: 8px; flex-wrap: wrap; }
  .pd-size-chip {
    font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em;
    padding: 6px 14px; border-radius: 8px;
    background: var(--surface2); color: var(--text);
    border: 1px solid var(--border2);
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .pd-size-chip:hover { border-color: var(--gold-dim); color: var(--gold); background: var(--gold-glow); }

  /* Barcode */
  .pd-barcode-wrap { display: flex; align-items: center; gap: 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; }
  .pd-barcode-icon { font-size: 1.2rem; }
  .pd-barcode-val { font-family: monospace; font-size: 0.85rem; color: var(--muted); letter-spacing: 0.14em; }
  .pd-barcode-label { font-size: 0.58rem; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; }

  /* Divider */
  .pd-divider { height: 1px; background: var(--border); }

  /* ── Description section ── */
  .pd-desc-section { padding: 0 40px 0; max-width: 1300px; }
  @media (max-width: 900px) { .pd-desc-section { padding: 0 18px; } }
  .pd-desc-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .pd-desc-title { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 700; color: var(--text); }
  .pd-desc-line { flex: 1; height: 1px; background: var(--border); }
  .pd-desc-body { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px 28px; }
  .pd-desc-text { font-size: 0.88rem; line-height: 1.85; color: var(--muted); white-space: pre-line; }

  /* Feature bullets parsed from description */
  .pd-features { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-top: 18px; }
  .pd-feature-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; transition: border-color 0.2s; }
  .pd-feature-card:hover { border-color: var(--gold-dim); }
  .pd-feature-title { font-size: 0.82rem; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .pd-feature-body { font-size: 0.76rem; color: var(--muted); line-height: 1.6; }

  /* ── Meta row ── */
  .pd-meta-row { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; padding: 16px 40px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--surface); }
  @media (max-width: 900px) { .pd-meta-row { padding: 14px 18px; gap: 16px; } }
  .pd-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .pd-meta-label { font-size: 0.58rem; color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase; }
  .pd-meta-val { font-size: 0.82rem; font-weight: 500; color: var(--text); }

  /* ── Skeleton ── */
  .pd-skel { padding: 32px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  @media (max-width: 900px) { .pd-skel { grid-template-columns: 1fr; padding: 20px 18px; } }
  .pd-skel-img { aspect-ratio: 4/3; border-radius: var(--radius); background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .pd-skel-line { border-radius: 6px; background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
  .pd-skel-info { display: flex; flex-direction: column; gap: 14px; padding-top: 8px; }

  /* Lightbox */
  .pd-lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; padding: 20px; cursor: zoom-out; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .pd-lightbox img { max-width: 92vw; max-height: 88vh; object-fit: contain; border-radius: 10px; border: 1px solid var(--border2); }
  .pd-lightbox-close { position: absolute; top: 20px; right: 24px; font-size: 1.6rem; color: var(--muted); cursor: pointer; transition: color 0.2s; }
  .pd-lightbox-close:hover { color: var(--text); }
  .pd-lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); background: var(--surface); border: 1px solid var(--border2); color: var(--muted); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: color 0.2s, border-color 0.2s; }
  .pd-lightbox-nav:hover { color: var(--gold); border-color: var(--gold-dim); }
  .pd-lightbox-nav.prev { left: 20px; }
  .pd-lightbox-nav.next { right: 20px; }

  @media (max-width: 600px) {
    .pd-nav { padding: 0 18px; }
    .pd-breadcrumb { padding: 12px 18px 0; }
    .pd-desc-section { padding: 0 18px; }
    .pd-meta-row { padding: 12px 18px; }
    .pd-lot-number { font-size: 2.2rem; }
    .pd-price-main { font-size: 1.8rem; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseSizes(raw) {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return String(raw).split(",").map(s => s.trim()); }
}

function parseFeatures(desc) {
    if (!desc) return [];
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    const features = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Lines ending with ':' are feature titles
        if (line.endsWith(':') && i + 1 < lines.length) {
            features.push({ title: line.slice(0, -1), body: lines[i + 1] });
            i++;
        }
    }
    return features;
}

function formatDate(str) {
    if (!str) return '—';
    try {
        return new Date(str).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    } catch { return str; }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Logo({ navigate }) {
    return (
        <div className="pd-logo" onClick={() => navigate("/main-category")}>
            <div className="pd-logo-mark"><span className="pd-logo-a">A</span><span className="pd-logo-c">C</span></div>
            <div className="pd-logo-divider" />
            <div className="pd-logo-text">
                <div className="pd-logo-name"><span className="pd-logo-n1">ANIBHAVI</span><span className="pd-logo-n2"> CREATIONS</span></div>
                <span className="pd-logo-tagline">Fashion Studio</span>
            </div>
        </div>
    );
}

function SkeletonLoader() {
    return (
        <div className="pd-skel">
            <div className="pd-skel-img" />
            <div className="pd-skel-info">
                <div className="pd-skel-line" style={{ height: 11, width: '28%' }} />
                <div className="pd-skel-line" style={{ height: 44, width: '55%' }} />
                <div className="pd-skel-line" style={{ height: 80, width: '100%' }} />
                <div className="pd-skel-line" style={{ height: 60, width: '100%' }} />
                <div className="pd-skel-line" style={{ height: 40, width: '80%' }} />
            </div>
        </div>
    );
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, onPrev, onNext]);

    return (
        <div className="pd-lightbox" onClick={onClose}>
            <button className="pd-lightbox-close" onClick={onClose}>✕</button>
            {images.length > 1 && (
                <button className="pd-lightbox-nav prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>‹</button>
            )}
            <img src={images[index]} alt={`view-${index}`} onClick={e => e.stopPropagation()} />
            {images.length > 1 && (
                <button className="pd-lightbox-nav next" onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>
            )}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProductDetails() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Accept either a full product object or just an id from location state
    const productId = location.state?.productId || location.state?.product?._id;
    const productData = location.state?.productData || location.state?.product || null;

    const fetchProduct = useCallback(async () => {
        if (!productId) { setLoading(false); return; }
        setLoading(true);
        try {
            const res = await getData(`api/subProduct/get-sub-product-by-id/${productId}`);
            if (res?.status === true || res?.success === true) {
                setProduct(res.data);
            } else {
                toast.error(res?.message || "Failed to load product details");
            }
        } catch (err) {
            console.error("fetchProduct:", err);
            toast.error("Failed to load product details");
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        // Use passed data immediately, fetch in background to get fresh data
        if (productData) setProduct(productData);
        fetchProduct();
    }, [fetchProduct]);

    const item = product;
    const images = item?.subProductImages || [];
    const sizes = parseSizes(item?.sizes);
    const inStock = item?.stock?.toLowerCase() === "in stock";
    const features = parseFeatures(item?.description);

    // Description intro (lines before features start)
    const descLines = item?.description?.split('\n').map(l => l.trim()).filter(Boolean) || [];
    const introLines = descLines.filter(l => !l.endsWith(':') && !features.some(f => f.body === l || l === f.title + ':'));
    const introText = introLines.slice(0, 4).join('\n');

    return (
        <>
            <style>{styles}</style>
            <div className="pd-root">

                {/* Navbar */}
                <nav className="pd-nav">
                    <Logo navigate={navigate} />
                    <div className="pd-nav-right">
                        {item && (
                            <span className={`pd-stock-nav-badge ${Number(item?.lotStock) ? 'in' : 'out'}`}>
                                {Number(item?.lotStock) > 0 ? "In Stock" : "Out Stock"||item.stock || 'Unknown'}
                            </span>
                        )}
                        <button className="pd-back-btn" onClick={() => navigate(-1)}>← Back</button>
                    </div>
                </nav>

                {/* Breadcrumb */}
                <div className="pd-breadcrumb">
                    <span className="pd-bc-link" onClick={() => navigate("/main-category")}>Home</span>
                    <span className="pd-bc-sep">/</span>
                    <span className="pd-bc-link" onClick={() => navigate(-3)}>Categories</span>
                    <span className="pd-bc-sep">/</span>
                    <span className="pd-bc-link" onClick={() => navigate(-2)}>Sub Category</span>
                    <span className="pd-bc-sep">/</span>
                    <span className="pd-bc-link" onClick={() => navigate(-1)}>Lots</span>
                    <span className="pd-bc-sep">/</span>
                    <span className="pd-bc-current">{item?.lotNumber || 'Details'}</span>
                </div>

                {/* ── Loading ── */}
                {loading && !item && <SkeletonLoader />}

                {/* ── Main Content ── */}
                {item && (
                    <>
                        {/* Meta strip */}
                        <div className="pd-meta-row">
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Lot Number</span>
                                <span className="pd-meta-val" style={{ color: 'var(--gold)', fontWeight: 700 }}>{item.lotNumber}</span>
                            </div>
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Date Added</span>
                                <span className="pd-meta-val">{formatDate(item.dateOfOpening || item.createdAt)}</span>
                            </div>
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Barcode</span>
                                <span className="pd-meta-val" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{item.barcode || '—'}</span>
                            </div>
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Color Code</span>
                                <span className="pd-meta-val">{item.color || '—'}</span>
                            </div>
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Last Updated</span>
                                <span className="pd-meta-val">{formatDate(item.updatedAt)}</span>
                            </div>
                        </div>

                        {/* Two-column main */}
                        <div className="pd-main">

                            {/* Gallery */}
                            <div className="pd-gallery">
                                <div className="pd-main-img-wrap" onClick={() => setLightbox(true)}>
                                    {images[activeImg] ? (
                                        <img className="pd-main-img" src={images[activeImg]} alt={`product-${activeImg}`} />
                                    ) : (
                                        <div className="pd-img-fallback">👕</div>
                                    )}
                                    {images.length > 1 && (
                                        <div className="pd-img-counter">{activeImg + 1} / {images.length}</div>
                                    )}
                                </div>

                                {images.length > 1 && (
                                    <div className="pd-thumb-row">
                                        {images.map((img, i) => (
                                            <div
                                                key={i}
                                                className={`pd-thumb${activeImg === i ? ' active' : ''}`}
                                                onClick={() => setActiveImg(i)}
                                            >
                                                <img src={img} alt={`thumb-${i}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Info panel */}
                            <div className="pd-info">

                                {/* Title */}
                                <div>
                                    <div className="pd-lot-label">Lot Number</div>
                                    <div className="pd-lot-number">{item.lotNumber}</div>
                                </div>

                                {/* Status badges */}
                                <div className="pd-status-row">
                                    <span className={`pd-badge ${Number(item?.lotStock) > 0 ? 'green' : 'red'}`}>{Number(item?.lotStock) > 0 ? "in-stock" : "out-stock" || 'Unknown'}</span>
                                    {item.isActive && <span className="pd-badge blue">Active</span>}
                                    <span className="pd-badge gold">Lot #{item.lotNumber}</span>
                                </div>

                                {/* Price block */}
                                <div className="pd-price-block">
                                    <div className="pd-price-item">
                                        <span className="pd-price-item-label">Per Piece</span>
                                        <span className="pd-price-main">₹{Number(item.singlePicPrice)?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="pd-price-divider" />
                                    <div className="pd-price-item">
                                        <span className="pd-price-item-label">Lot Total ({item.pcsInSet} pcs)</span>
                                        <span className="pd-price-sub">₹{Number(item.filnalLotPrice)?.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                {/* Info grid */}
                                <div className="pd-info-grid">
                                    <div className="pd-info-cell">
                                        <div className="pd-info-cell-label">Pieces / Set</div>
                                        <div className="pd-info-cell-val gold">{item.pcsInSet}</div>
                                    </div>
                                    <div className="pd-info-cell">
                                        <div className="pd-info-cell-label">Lot Stock</div>
                                        <div className="pd-info-cell-val green">{item.lotStock} pcs</div>
                                    </div>
                                    <div className="pd-info-cell">
                                        <div className="pd-info-cell-label">Color Code</div>
                                        <div className="pd-info-cell-val">{item.color || '—'}</div>
                                    </div>
                                    <div className="pd-info-cell">
                                        <div className="pd-info-cell-label">Images</div>
                                        <div className="pd-info-cell-val">{images.length} photo{images.length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>

                                {/* Sizes */}
                                {sizes.length > 0 && (
                                    <div>
                                        <div className="pd-section-label">Available Sizes</div>
                                        <div className="pd-sizes">
                                            {sizes.map((s, i) => (
                                                <span key={i} className="pd-size-chip">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Barcode */}
                                {item.barcode && (
                                    <div className="pd-barcode-wrap">
                                        <span className="pd-barcode-icon">▌▌▌▌▌</span>
                                        <div>
                                            <div className="pd-barcode-label">Barcode</div>
                                            <div className="pd-barcode-val">{item.barcode}</div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="pd-divider" style={{ margin: '0 40px' }} />

                        {/* Description section */}
                        {item.description && (
                            <div className="pd-desc-section" style={{ marginTop: 32 }}>
                                <div className="pd-desc-header">
                                    <h2 className="pd-desc-title">Product Description</h2>
                                    <div className="pd-desc-line" />
                                </div>

                                <div className="pd-desc-body">
                                    {introText && (
                                        <p className="pd-desc-text" style={{ marginBottom: features.length > 0 ? 20 : 0 }}>
                                            {introText}
                                        </p>
                                    )}

                                    {features.length > 0 && (
                                        <div className="pd-features">
                                            {features.map((f, i) => (
                                                <div key={i} className="pd-feature-card">
                                                    <div className="pd-feature-title">{f.title}</div>
                                                    <div className="pd-feature-body">{f.body}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {!loading && !item && (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: 18 }}>🗂️</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--text)', marginBottom: 8 }}>Product not found</h2>
                        <p style={{ fontSize: '0.88rem' }}>The product details could not be loaded.</p>
                    </div>
                )}

                {/* Lightbox */}
                {lightbox && images.length > 0 && (
                    <Lightbox
                        images={images}
                        index={activeImg}
                        onClose={() => setLightbox(false)}
                        onPrev={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                        onNext={() => setActiveImg(i => (i + 1) % images.length)}
                    />
                )}

            </div>
        </>
    );
}