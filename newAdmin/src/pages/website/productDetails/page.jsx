import { useEffect, useState, useCallback } from "react";
import { getData } from "../../../services/FetchNodeServices";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../images/logowithText.png"

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:          #f4f6fb;
    --surface:     #ffffff;
    --surface2:    #e8f0fc;
    --blue:        #2196F3;
    --blue-dark:   #1565C0;
    --blue-light:  #e3f2fd;
    --border:      #d0dce8;
    --border2:     #b0c4d8;
    --text:        #0d1117;
    --text2:       #2c3a4a;
    --muted:       #607080;
    --green:       #2e7d52;
    --green-bg:    #e8f5ee;
    --red:         #c0392b;
    --red-bg:      #fdecea;
    --radius:      12px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pd-root {
    font-family: 'Poppins', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 80px;
  }

  /* ── Navbar ── */
  .pd-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 64px;
    background: var(--surface);
    border-bottom: 2px solid var(--blue);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  /* ── Logo ── */
  .pd-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
  .pd-logo-mark { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.02em; display: flex; align-items: center; }
  .pd-logo-a { color: #0d1117; }
  .pd-logo-c { color: #2196F3; }
  .pd-logo-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }
  .pd-logo-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; }
  .pd-logo-name { font-family: 'Poppins', sans-serif; sans-serif; font-size: 0.86rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
  .pd-logo-n1 { color: #0d1117; }
  .pd-logo-n2 { color: #2196F3; }
  .pd-logo-tagline { font-size: 0.58rem; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }

  /* ── Nav right ── */
  .pd-nav-right { display: flex; align-items: center; gap: 10px; }

  .pd-back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.76rem;
    font-weight: 600;
    color: #ffffff;
    background: var(--blue);
    border: none;
    padding: 7px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .pd-back-btn:hover { background: var(--blue-dark); }

  .pd-stock-nav-badge {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
  }
  .pd-stock-nav-badge.in  { background: var(--green-bg); color: var(--green); border: 1px solid #a5d6b7; }
  .pd-stock-nav-badge.out { background: var(--red-bg);   color: var(--red);   border: 1px solid #f1aaa3; }

  /* ── Breadcrumb ── */
  .pd-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 40px 0;
    font-size: 0.74rem;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .pd-bc-link { color: var(--blue); cursor: pointer; font-weight: 500; transition: color 0.2s; }
  .pd-bc-link:hover { color: var(--blue-dark); }
  .pd-bc-sep { color: var(--border2); }
  .pd-bc-current { color: var(--text2); font-weight: 500; }

  /* ── Meta strip ── */
  .pd-meta-row {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    padding: 14px 40px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    margin-top: 14px;
  }
  .pd-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .pd-meta-label { font-size: 0.56rem; color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase; }
  .pd-meta-val { font-size: 0.82rem; font-weight: 600; color: var(--text); }

  /* ── Main two-column layout ── */
  .pd-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 36px;
    padding: 28px 40px;
    max-width: 1300px;
  }
  @media (max-width: 900px) { .pd-main { grid-template-columns: 1fr; gap: 22px; padding: 18px; } }

  /* ── Gallery ── */
  .pd-gallery { display: flex; flex-direction: column; gap: 12px; }

  .pd-main-img-wrap {
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--surface2);
    border: 1px solid var(--border);
    position: relative;
    cursor: zoom-in;
  }

  .pd-main-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.45s ease; }
  .pd-main-img-wrap:hover .pd-main-img { transform: scale(1.04); }

  .pd-img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
    background: var(--surface2);
  }
  .c-logo-img {
    width: 106px;
    height: 106px;
    object-fit: contain;
    display: block;
    border-radius: 8px;
  }
  .pd-img-counter {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    background: rgba(0,0,0,0.55);
    color: #fff;
    padding: 3px 10px;
    border-radius: 10px;
  }

  /* Thumbnails */
  .pd-thumb-row { display: flex; gap: 8px; flex-wrap: wrap; }

  .pd-thumb {
    width: 68px;
    height: 68px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--border);
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    flex-shrink: 0;
  }
  .pd-thumb:hover { transform: translateY(-2px); border-color: var(--blue); }
  .pd-thumb.active { border-color: var(--blue); }
  .pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── Info panel ── */
  .pd-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: fadeUp 0.45s ease both;
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .pd-lot-label { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--blue); }
  .pd-lot-number { font-family: 'Poppins', sans-serif; font-size: 3rem; font-weight: 700; color: var(--text); line-height: 1; margin-top: 4px; }

  /* Status badges */
  .pd-status-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .pd-badge {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
  }
  .pd-badge.green { background: var(--green-bg); color: var(--green); border: 1px solid #a5d6b7; }
  .pd-badge.red   { background: var(--red-bg);   color: var(--red);   border: 1px solid #f1aaa3; }
  .pd-badge.blue  { background: var(--blue-light); color: var(--blue-dark); border: 1px solid #90caf9; }
  .pd-badge.black { background: var(--text); color: #ffffff; border: 1px solid var(--text); }

  /* Price block */
  .pd-price-block {
    background: var(--blue-light);
    border: 1px solid #90caf9;
    border-radius: var(--radius);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .pd-price-item { display: flex; flex-direction: column; gap: 3px; }
  .pd-price-item-label { font-size: 0.58rem; color: var(--blue-dark); letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; }
  .pd-price-main { font-family: 'Poppins', sans-serif; font-size: 2.2rem; font-weight: 700; color: var(--blue-dark); line-height: 1; }
  .pd-price-sub  { font-family: 'Poppins', sans-serif; font-size: 1.5rem; font-weight: 600; color: var(--text); line-height: 1; }
  .pd-price-divider { width: 1px; height: 44px; background: #90caf9; }

  /* Info grid */
  .pd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .pd-info-cell {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
    transition: border-color 0.2s;
  }
  .pd-info-cell:hover { border-color: var(--blue); }
  .pd-info-cell-label { font-size: 0.56rem; color: var(--muted); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 4px; }
  .pd-info-cell-val { font-size: 1rem; font-weight: 700; color: var(--text); }
  .pd-info-cell-val.blue  { color: var(--blue-dark); }
  .pd-info-cell-val.green { color: var(--green); }

  /* Sizes */
  .pd-section-label { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--blue); margin-bottom: 10px; }

  .pd-sizes { display: flex; gap: 8px; flex-wrap: wrap; }

  .pd-size-chip {
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 6px 16px;
    border-radius: 8px;
    background: var(--text);
    color: #ffffff;
    border: 1px solid var(--text);
    transition: background 0.2s, color 0.2s;
  }
  .pd-size-chip:hover { background: var(--blue); border-color: var(--blue); }

  /* Barcode */
  .pd-barcode-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
  }
  .pd-barcode-icon { font-size: 1.4rem; color: var(--blue); letter-spacing: -2px; }
  .pd-barcode-label { font-size: 0.56rem; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 2px; }
  .pd-barcode-val { font-family: 'Poppins', sans-serif; font-size: 0.88rem; color: var(--text); letter-spacing: 0.14em; font-weight: 600; }

  /* Divider */
  .pd-divider { height: 1px; background: var(--border); }

  /* ── Description ── */
  .pd-desc-section { padding: 0 40px; max-width: 1300px; margin-top: 28px; }
  @media (max-width: 900px) { .pd-desc-section { padding: 0 18px; } }

  .pd-desc-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .pd-desc-title { font-family: 'Poppins', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--text); white-space: nowrap; }
  .pd-desc-line { flex: 1; height: 1px; background: var(--border); }

  .pd-desc-body {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 26px;
  }
  .pd-desc-text { font-size: 0.88rem; line-height: 1.85; color: var(--muted); white-space: pre-line; }

  .pd-features { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-top: 18px; }

  .pd-feature-card {
    background: var(--blue-light);
    border: 1px solid #90caf9;
    border-radius: 10px;
    padding: 14px 16px;
    transition: border-color 0.2s;
  }
  .pd-feature-card:hover { border-color: var(--blue); }
  .pd-feature-title { font-size: 0.82rem; font-weight: 700; color: var(--blue-dark); margin-bottom: 4px; }
  .pd-feature-body  { font-size: 0.76rem; color: var(--muted); line-height: 1.6; }

  /* ── Skeleton ── */
  .pd-skel { padding: 28px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; }
  @media (max-width: 900px) { .pd-skel { grid-template-columns: 1fr; padding: 18px; } }

  .pd-skel-img {
    aspect-ratio: 4/3;
    border-radius: var(--radius);
    background: linear-gradient(90deg, var(--surface2) 25%, #dae4f0 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .pd-skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--surface2) 25%, #dae4f0 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  .pd-skel-info { display: flex; flex-direction: column; gap: 14px; padding-top: 8px; }

  /* ── Lightbox ── */
  .pd-lightbox {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0,0,0,0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    cursor: zoom-out;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .pd-lightbox img {
    max-width: 92vw;
    max-height: 88vh;
    object-fit: contain;
    border-radius: 10px;
    border: 1px solid var(--border2);
  }

  .pd-lightbox-close {
    position: absolute;
    top: 18px;
    right: 22px;
    font-size: 1.5rem;
    color: #ffffff;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    background: none;
    border: none;
    line-height: 1;
  }
  .pd-lightbox-close:hover { opacity: 1; }

  .pd-lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25);
    color: #ffffff;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.4rem;
    transition: background 0.2s;
    backdrop-filter: blur(4px);
  }
  .pd-lightbox-nav:hover { background: rgba(33,150,243,0.5); }
  .pd-lightbox-nav.prev { left: 18px; }
  .pd-lightbox-nav.next { right: 18px; }

  /* ── Empty ── */
  .pd-empty { text-align: center; padding: 80px 20px; color: var(--muted); }
  .pd-empty-icon { font-size: 3.5rem; margin-bottom: 16px; }
  .pd-empty h2 { font-family: 'Poppins', sans-serif; font-size: 1.5rem; color: var(--text); margin-bottom: 8px; }
  .pd-empty p { font-size: 0.88rem; }

  @media (max-width: 600px) {
    .pd-nav { padding: 0 16px; }
    .pd-breadcrumb { padding: 12px 16px 0; }
    .pd-meta-row { padding: 12px 16px; gap: 14px; }
    .pd-desc-section { padding: 0 16px; }
    .pd-lot-number { font-size: 2.2rem; }
    .pd-price-main { font-size: 1.8rem; }
  }
    .sp-desc ul,
.sp-desc ol {
  padding-left: 20px;
  margin: 8px 0;
}

.sp-desc ul { list-style-type: circle; }
.sp-desc ol { list-style-type: decimal; }

.sp-desc li {
  margin-bottom: 4px;
  line-height: 1.6;
}

.sp-desc p {
  margin: 6px 0;
  line-height: 1.6;
}

.sp-desc strong { font-weight: 700; }
.sp-desc em { font-style: italic; }

.sp-desc a {
  color: var(--blue);
  text-decoration: underline;
}
   /* ── WhatsApp Float Button ── */
.wa-float {
  position: fixed;
  right: 24px;
  bottom: 32px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: waBounce 2s ease-in-out infinite;
}

@keyframes waBounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.wa-float a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #25D366;
  box-shadow: 0 4px 16px rgba(37,211,102,0.45);
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.wa-float a:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 22px rgba(37,211,102,0.6);
}

.wa-float-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #25D366;
  text-transform: uppercase;
  background: #fff;
  border: 1px solid #25D366;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .wa-float { right: 16px; bottom: 80px; } /* above mobile bottom tab bar */
}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseSizes(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return String(raw).split(",").map((s) => s.trim()); }
}

function parseFeatures(desc) {
  if (!desc) return [];
  const lines = desc.split("\n").map((l) => l.trim()).filter(Boolean);
  const features = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].endsWith(":") && i + 1 < lines.length) {
      features.push({ title: lines[i].slice(0, -1), body: lines[i + 1] });
      i++;
    }
  }
  return features;
}

function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return str; }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Logo() {
  const navigate = useNavigate();
  return (
    <div className="c-logo" onClick={() => navigate("/main-category")}>
      <div className="c-logo-mark">
        <img
          src={logo}
          width={56}
          height={56}
          alt="Anibhavi Creations Logo"
          className="c-logo-img"
        />
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="pd-skel">
      <div className="pd-skel-img" />
      <div className="pd-skel-info">
        <div className="pd-skel-line" style={{ height: 11, width: "28%" }} />
        <div className="pd-skel-line" style={{ height: 44, width: "55%" }} />
        <div className="pd-skel-line" style={{ height: 80, width: "100%" }} />
        <div className="pd-skel-line" style={{ height: 60, width: "100%" }} />
        <div className="pd-skel-line" style={{ height: 36, width: "75%" }} />
      </div>
    </div>
  );
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="pd-lightbox" onClick={onClose}>
      <button className="pd-lightbox-close" onClick={onClose}>✕</button>
      {images.length > 1 && (
        <button
          className="pd-lightbox-nav prev"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >‹</button>
      )}
      <img src={images[index]} alt={`view-${index}`} onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && (
        <button
          className="pd-lightbox-nav next"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >›</button>
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
    // Show passed data instantly while fetching fresh data in background
    if (productData) setProduct(productData);
    fetchProduct();
  }, [fetchProduct]);

  const item = product;
  const images = item?.subProductImages || [];
  const sizes = parseSizes(item?.sizes);
  const inStock = Number(item?.lotStock) > 0;
  const features = parseFeatures(item?.description);

  // Intro text = description lines that aren't feature titles/bodies
  const descLines = item?.description?.split("\n").map((l) => l.trim()).filter(Boolean) || [];
  const featureBodies = features.map((f) => f.body);
  const featureTitles = features.map((f) => f.title + ":");
  const introLines = descLines.filter(
    (l) => !featureBodies.includes(l) && !featureTitles.includes(l)
  );
  const introText = introLines.slice(0, 4).join("\n");

  return (
    <>
      <style>{styles}</style>
      <div className="pd-root">

        {/* Navbar */}
        <nav className="pd-nav">
          <Logo navigate={navigate} />
          <div className="pd-nav-right">
            {item && (
              <span className={`pd-stock-nav-badge ${inStock ? "in" : "out"}`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            )}
            <button className="pd-back-btn" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </nav>

        {/* ── WhatsApp Float ── */}
        <div className="wa-float">
          <a href="https://wa.me/918506854624"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            {/* WhatsApp SVG icon — no extra package needed */}
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3C8.82 3 3 8.82 3 16c0 2.3.61 4.47 1.67 6.35L3 29l6.84-1.64A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3z" fill="#ffffff" />
              <path d="M21.75 18.92c-.31-.16-1.84-.91-2.13-1.01-.28-.1-.49-.16-.69.16-.2.31-.78.99-.96 1.2-.18.2-.35.22-.66.07-.31-.16-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.47.13-.63.14-.14.31-.35.47-.53.16-.18.21-.31.31-.52.1-.2.05-.38-.03-.53-.08-.16-.69-1.67-.95-2.28-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.52.07-.79.38-.27.31-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.28-.2-.59-.35z" fill="#25D366" />
            </svg>
          </a>
          <span className="wa-float-label">WhatsApp</span>
        </div>

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
          <span className="pd-bc-current">{item?.lotNumber || "Details"}</span>
        </div>

        {/* Skeleton */}
        {loading && !item && <SkeletonLoader />}

        {/* ── Main Content ── */}
        {item && (
          <>
            {/* Meta strip */}
            <div className="pd-meta-row">
              <div className="pd-meta-item">
                <span className="pd-meta-label">Lot Number</span>
                <span className="pd-meta-val" style={{ color: "var(--blue-dark)", fontWeight: 700 }}>
                  {item.lotNumber}
                </span>
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-label">Date Added</span>
                <span className="pd-meta-val">{formatDate(item.dateOfOpening || item.createdAt)}</span>
              </div>
              {/* <div className="pd-meta-item">
                <span className="pd-meta-label">Barcode</span>
                <span className="pd-meta-val" style={{ fontFamily: "monospace", letterSpacing: "0.1em" }}>
                  {item.barcode || "—"}
                </span>
              </div> */}
              <div className="pd-meta-item">
                <span className="pd-meta-label">Color Code</span>
                <span className="pd-meta-val">{item.color || "—"}</span>
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-label">Last Updated</span>
                <span className="pd-meta-val">{formatDate(item.updatedAt)}</span>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="pd-main">

              {/* Gallery */}
              <div className="pd-gallery">
                <div className="pd-main-img-wrap" onClick={() => images.length > 0 && setLightbox(true)}>
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
                        className={`pd-thumb${activeImg === i ? " active" : ""}`}
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

                <div>
                  <div className="pd-lot-label">Lot Number</div>
                  <div className="pd-lot-number">{item.lotNumber}</div>
                </div>

                {/* Status badges */}
                <div className="pd-status-row">
                  <span className={`pd-badge ${inStock ? "green" : "red"}`}>
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                  {item.isActive && <span className="pd-badge blue">Active</span>}
                  <span className="pd-badge black">Lot #{item.lotNumber}</span>
                </div>

                {/* Price block */}
                <div className="pd-price-block">
                  <div className="pd-price-item">
                    <span className="pd-price-item-label">Per Piece</span>
                    <span className="pd-price-main">
                      ₹{Number(item.singlePicPrice)?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="pd-price-divider" />
                  <div className="pd-price-item">
                    <span className="pd-price-item-label">
                      Lot Total ({item.pcsInSet} pcs)
                    </span>
                    <span className="pd-price-sub">
                      ₹{Number(item.filnalLotPrice)?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div className="pd-info-grid">
                  <div className="pd-info-cell">
                    <div className="pd-info-cell-label">Pieces / Set</div>
                    <div className="pd-info-cell-val blue">{item.pcsInSet}</div>
                  </div>
                  {/* <div className="pd-info-cell">
                    <div className="pd-info-cell-label">Lot Stock</div>
                    <div className="pd-info-cell-val green">{item.lotStock} pcs</div>
                  </div> */}
                  <div className="pd-info-cell">
                    <div className="pd-info-cell-label">Color Code</div>
                    <div className="pd-info-cell-val">{item.color || "—"}</div>
                  </div>
                  {/* <div className="pd-info-cell">
                    <div className="pd-info-cell-label">Images</div>
                    <div className="pd-info-cell-val">
                      {images.length} photo{images.length !== 1 ? "s" : ""}
                    </div>
                  </div> */}
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
                {/* {item.barcode && (
                  <div className="pd-barcode-wrap">
                    <span className="pd-barcode-icon">▌▌▌▌▌</span>
                    <div>
                      <div className="pd-barcode-label">Barcode</div>
                      <div className="pd-barcode-val">{item.barcode}</div>
                    </div>
                  </div>
                )} */}

              </div>
            </div>

            <div className="pd-divider" style={{ margin: "0 40px" }} />

            {/* Description */}
            {item.description && (
              <div className="pd-desc-section">
                <div className="pd-desc-header">
                  <h2 className="pd-desc-title">Product Description</h2>
                  <div className="pd-desc-line" />
                </div>
                <div className="pd-desc-body">
                  {item.description && (
                    <div
                      className="sp-desc"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
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
          <div className="pd-empty">
            <div className="pd-empty-icon">🗂️</div>
            <h2>Product not found</h2>
            <p>The product details could not be loaded.</p>
          </div>
        )}

        {/* Lightbox */}
        {lightbox && images.length > 0 && (
          <Lightbox
            images={images}
            index={activeImg}
            onClose={() => setLightbox(false)}
            onPrev={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
            onNext={() => setActiveImg((i) => (i + 1) % images.length)}
          />
        )}

      </div>
    </>
  );
}