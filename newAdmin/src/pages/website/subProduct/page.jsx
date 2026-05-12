import { useEffect, useState, useCallback } from "react";
import { getData } from "../../../services/FetchNodeServices";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

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

  .sp-root {
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 60px;
  }

  /* ── Navbar ── */
  .sp-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 68px; background: var(--surface);
    border-bottom: 1px solid var(--border2); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px);
  }
  .sp-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
  .sp-logo-mark { font-family: 'Arial Black', Arial, sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.02em; display: flex; align-items: center; }
  .sp-logo-a { color: #f0ece4; }
  .sp-logo-c { color: #2196f3; }
  .sp-logo-divider { width: 1px; height: 34px; background: rgba(255,255,255,0.1); flex-shrink: 0; }
  .sp-logo-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; }
  .sp-logo-name { font-family: 'Arial Black', Arial, sans-serif; font-size: 0.88rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
  .sp-logo-n1 { color: #f0ece4; }
  .sp-logo-n2 { color: #2196f3; }
  .sp-logo-tagline { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }

  .sp-nav-right { display: flex; align-items: center; gap: 12px; }
  .sp-nav-pill { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); background: var(--surface2); border: 1px solid var(--border2); padding: 6px 14px; border-radius: 20px; }
  .sp-back-btn { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.06em; color: var(--muted); background: var(--surface2); border: 1px solid var(--border2); padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .sp-back-btn:hover { color: var(--gold); border-color: var(--gold-dim); }

  /* ── Product Hero Banner ── */
  .sp-hero {
    display: flex; align-items: center; gap: 24px;
    padding: 24px 40px; border-bottom: 1px solid var(--border);
    background: var(--surface); flex-wrap: wrap;
  }
  .sp-hero-imgs { display: flex; gap: 10px; flex-shrink: 0; }
  .sp-hero-img-wrap { width: 72px; height: 72px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border2); flex-shrink: 0; }
  .sp-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sp-hero-img-more { width: 72px; height: 72px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--muted); font-weight: 500; flex-shrink: 0; }
  .sp-hero-info { flex: 1; min-width: 200px; }
  .sp-hero-tag { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 4px; }
  .sp-hero-name { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 700; color: var(--text); line-height: 1.1; margin-bottom: 6px; }
  .sp-hero-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .sp-hero-sku { font-size: 0.72rem; color: var(--muted); }
  .sp-hero-price { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 700; color: var(--gold); }
  .sp-hero-type { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 9px; border-radius: 12px; background: rgba(33,150,243,0.2); color: var(--blue); border: 1px solid rgba(33,150,243,0.35); }
  .sp-hero-cats { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px; }
  .sp-hero-cat { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 9px; border-radius: 10px; background: var(--surface2); color: var(--muted); border: 1px solid var(--border); }

  /* ── Breadcrumb ── */
  .sp-breadcrumb { display: flex; align-items: center; gap: 8px; padding: 16px 40px 0; font-size: 0.76rem; color: var(--muted); flex-wrap: wrap; }
  .sp-breadcrumb-link { color: var(--gold-dim); cursor: pointer; transition: color 0.2s; }
  .sp-breadcrumb-link:hover { color: var(--gold); }
  .sp-breadcrumb-sep { color: var(--border2); }
  .sp-breadcrumb-current { color: var(--muted); }

  /* ── Page header ── */
  .sp-page-header { padding: 20px 40px 24px; display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
  .sp-page-title { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; font-weight: 700; line-height: 1; letter-spacing: -0.01em; }
  .sp-page-title span { color: var(--gold); }
  .sp-page-sub { font-size: 0.82rem; color: var(--muted); margin-top: 6px; letter-spacing: 0.04em; }

  /* ── Grid ── */
  .sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 22px; padding: 28px 40px; }

  /* ── Lot Card ── */
  .sp-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
    animation: fadeUp 0.45s ease both;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .sp-card:nth-child(1) { animation-delay: 0.04s; }
  .sp-card:nth-child(2) { animation-delay: 0.08s; }
  .sp-card:nth-child(3) { animation-delay: 0.12s; }
  .sp-card:nth-child(4) { animation-delay: 0.16s; }
  .sp-card:nth-child(5) { animation-delay: 0.20s; }
  .sp-card:nth-child(6) { animation-delay: 0.24s; }

  .sp-card:hover { border-color: var(--gold-dim); box-shadow: 0 0 28px var(--gold-glow), 0 12px 40px rgba(0,0,0,0.5); transform: translateY(-4px); }
  .sp-card:hover .sp-card-img { transform: scale(1.06); }

  /* Image gallery strip */
  .sp-img-wrap { height: 200px; position: relative; overflow: hidden; background: var(--surface2); }
  .sp-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
  .sp-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; background: radial-gradient(ellipse at center, #1e1a14, var(--surface2)); }
  .sp-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,9,8,0.8) 0%, transparent 50%); pointer-events: none; }

  /* Thumbnail row */
  .sp-thumb-row { display: flex; gap: 5px; padding: 8px 10px; background: var(--surface2); border-bottom: 1px solid var(--border); overflow-x: auto; }
  .sp-thumb { width: 38px; height: 38px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border); flex-shrink: 0; cursor: pointer; transition: border-color 0.2s; }
  .sp-thumb.active { border-color: var(--gold); }
  .sp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sp-thumb-count { width: 38px; height: 38px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: var(--muted); font-weight: 600; flex-shrink: 0; }

  /* Stock badge */
  .sp-stock-badge {
    position: absolute; top: 10px; right: 10px;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 12px;
  }
  .sp-stock-badge.in-stock   { background: rgba(76,175,125,0.2); color: var(--green); border: 1px solid rgba(76,175,125,0.35); }
  .sp-stock-badge.out-stock  { background: rgba(131, 13, 33, 0.95);  color: var(--red);   border: 1px solid rgba(0, 0, 0, 0.35); }

  /* Color swatch */
  .sp-color-dot {
    position: absolute; top: 10px; left: 10px;
    width: 22px; height: 22px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    font-size: 0.55rem; font-weight: 700; color: rgba(255,255,255,0.8);
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  }

  /* Card body */
  .sp-card-body { padding: 14px 16px 16px; }
  .sp-lot-label { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 4px; }
  .sp-lot-num { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 700; color: var(--text); line-height: 1.1; margin-bottom: 10px; }

  /* Info grid */
  .sp-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .sp-info-cell { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
  .sp-info-cell-label { font-size: 0.58rem; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 2px; }
  .sp-info-cell-val { font-size: 0.88rem; font-weight: 600; color: var(--text); }

  /* Sizes */
  .sp-sizes { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
  .sp-size-pill { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; padding: 3px 9px; border-radius: 8px; background: var(--surface2); color: var(--muted); border: 1px solid var(--border2); }

  /* Description */
  .sp-desc { font-size: 0.78rem; line-height: 1.6; color: var(--muted); margin-bottom: 12px; white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* Barcode */
  .sp-barcode { font-size: 0.62rem; color: var(--muted); letter-spacing: 0.18em; font-family: monospace; margin-bottom: 12px; }

  .sp-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border); }
  .sp-price-wrap { display: flex; flex-direction: column; gap: 1px; }
  .sp-price-label { font-size: 0.58rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }
  .sp-price { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 700; color: var(--gold); }
  .sp-lot-price { font-size: 0.72rem; color: var(--muted); margin-top: 1px; }

  .sp-card-btn { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 0; transition: gap 0.2s, color 0.2s; }
  .sp-card:hover .sp-card-btn { gap: 9px; color: #e8c96a; }

  /* ── Skeleton ── */
  .sp-skeleton { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .sp-skel-img { height: 200px; background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .sp-skel-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }
  .sp-skel-line { border-radius: 6px; background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }

  /* ── Empty ── */
  .sp-empty { text-align: center; padding: 80px 20px; color: var(--muted); }
  .sp-empty-icon { font-size: 3.5rem; margin-bottom: 18px; }
  .sp-empty h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: var(--text); margin-bottom: 8px; }
  .sp-empty p { font-size: 0.88rem; }

  /* ── Pagination ── */
  .sp-pag-wrap { padding: 0 40px; }
  .sp-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 0; flex-wrap: wrap; }
  .sp-page-info { font-size: 0.76rem; color: var(--muted); text-align: center; margin-top: 10px; letter-spacing: 0.04em; }
  .sp-pg-btn { height: 38px; min-width: 38px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border2); background: var(--surface); color: var(--muted); font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s; }
  .sp-pg-btn:hover:not(:disabled) { border-color: var(--gold-dim); color: var(--gold); background: var(--gold-glow); }
  .sp-pg-btn.active { background: var(--gold); color: #0a0908; border-color: var(--gold); font-weight: 700; box-shadow: 0 0 14px var(--gold-glow); }
  .sp-pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .sp-pg-ellipsis { font-size: 0.9rem; color: var(--muted); width: 24px; text-align: center; }

  .sp-divider { height: 1px; background: var(--border); margin: 0 40px; }

  @media (max-width: 600px) {
    .sp-nav { padding: 0 18px; }
    .sp-hero { padding: 16px 18px; }
    .sp-breadcrumb { padding: 12px 18px 0; }
    .sp-page-header { padding: 16px 18px 20px; }
    .sp-grid { padding: 16px 18px; gap: 14px; }
    .sp-pag-wrap { padding: 0 18px; }
    .sp-page-title { font-size: 1.8rem; }
    .sp-divider { margin: 0 18px; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function paginationRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
}

function parseSizes(raw) {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return String(raw).split(",").map((s) => s.trim()); }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Logo() {
    const navigate = useNavigate();
    return (
        <div className="sp-logo" onClick={() => navigate("/main-category")}>
            <div className="sp-logo-mark"><span className="sp-logo-a">A</span><span className="sp-logo-c">C</span></div>
            <div className="sp-logo-divider" />
            <div className="sp-logo-text">
                <div className="sp-logo-name"><span className="sp-logo-n1">ANIBHAVI</span><span className="sp-logo-n2"> CREATIONS</span></div>
                <span className="sp-logo-tagline">Fashion Studio</span>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="sp-skeleton">
            <div className="sp-skel-img" />
            <div className="sp-skel-body">
                <div className="sp-skel-line" style={{ height: 9, width: "30%" }} />
                <div className="sp-skel-line" style={{ height: 20, width: "55%" }} />
                <div className="sp-skel-line" style={{ height: 60, width: "100%" }} />
                <div className="sp-skel-line" style={{ height: 9, width: "70%" }} />
            </div>
        </div>
    );
}

// Product hero banner using productId data
function ProductHero({ productData }) {
    if (!productData) return null;
    const images = productData.images || [];
    const categories = productData.categoryId || [];
    const shown = images.slice(0, 3);
    const extra = images.length - shown.length;

    return (
        <div className="sp-hero">
            <div className="sp-hero-imgs">
                {shown.map((img, i) => (
                    <div key={i} className="sp-hero-img-wrap">
                        <img className="sp-hero-img" src={img} alt={`product-${i}`} />
                    </div>
                ))}
                {extra > 0 && <div className="sp-hero-img-more">+{extra}</div>}
            </div>
            <div className="sp-hero-info">
                <div className="sp-hero-tag">SKU: {productData.sku}</div>
                <div className="sp-hero-name">{productData.productName}</div>
                <div className="sp-hero-meta">
                    <span className="sp-hero-sku">₹{productData.price?.toLocaleString("en-IN")} / pc</span>
                    {productData.type && <span className="sp-hero-type">{productData.type}</span>}
                </div>
                {categories.length > 0 && (
                    <div className="sp-hero-cats">
                        {categories.map((cat) => (
                            <span key={cat._id} className="sp-hero-cat">{cat.name}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function LotCard({ item }) {
    const [activeImg, setActiveImg] = useState(0);
    const images = item.subProductImages || [];
    const sizes = parseSizes(item.sizes);
    const inStock = item.stock?.toLowerCase() === "in stock";
    const navigate = useNavigate()

    return (
        <div className="sp-card" onClick={() => navigate(`/product-details/${item?.color}`, { state: { productData: item, productId: item?._id } })}>
            {/* Main image */}
            <div className="sp-img-wrap">
                {images[activeImg] ? (
                    <img className="sp-card-img" src={images[activeImg]} alt={`lot-${item.lotNumber}`} />
                ) : (
                    <div className="sp-img-fallback">👕</div>
                )}
                <div className="sp-img-overlay" />
                <span className={`sp-stock-badge ${Number(item?.lotStock) > 0 ? "in-stock" : "out-stock"}`}>
                    {Number(item?.lotStock) > 0 ? "in-stock" : "out-stock" || "Unknown"}
                </span>
                {item.color && (
                    <div className="sp-color-dot" title={`Color: ${item.color}`}>{item.color}</div>
                )}
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
                <div className="sp-thumb-row">
                    {images.slice(0, 4).map((img, i) => (
                        <div
                            key={i}
                            className={`sp-thumb${activeImg === i ? " active" : ""}`}
                            onClick={() => setActiveImg(i)}
                        >
                            <img src={img} alt={`thumb-${i}`} />
                        </div>
                    ))}
                    {images.length > 4 && (
                        <div className="sp-thumb-count">+{images.length - 4}</div>
                    )}
                </div>
            )}

            {/* Body */}
            <div className="sp-card-body">
                <div className="sp-lot-label">Lot Number</div>
                <div className="sp-lot-num">{item.lotNumber}</div>

                <div className="sp-info-grid">
                    <div className="sp-info-cell">
                        <div className="sp-info-cell-label">Pcs / Set</div>
                        <div className="sp-info-cell-val">{item.pcsInSet}</div>
                    </div>
                    <div className="sp-info-cell">
                        <div className="sp-info-cell-label">Lot Stock</div>
                        <div className="sp-info-cell-val">{item.lotStock}</div>
                    </div>
                </div>

                {sizes.length > 0 && (
                    <div className="sp-sizes">
                        {sizes.map((s) => <span key={s} className="sp-size-pill">{s}</span>)}
                    </div>
                )}

                {item.description && (
                    <div className="sp-desc">{item.description}</div>
                )}

                {item.barcode && (
                    <div className="sp-barcode">Barcode: {item.barcode}</div>
                )}

                <div className="sp-card-footer">
                    <div className="sp-price-wrap">
                        <span className="sp-price-label">Per Piece</span>
                        <span className="sp-price">₹{Number(item.singlePicPrice)?.toLocaleString("en-IN")}</span>
                        <span className="sp-lot-price">Lot total: ₹{Number(item.filnalLotPrice)?.toLocaleString("en-IN")}</span>
                    </div>
                    <button className="sp-card-btn">Details <span>→</span></button>
                </div>
            </div>
        </div>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = paginationRange(currentPage, totalPages);
    return (
        <div className="sp-pagination">
            <button className="sp-pg-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>← Prev</button>
            {pages.map((p, i) =>
                p === "…" ? <span key={`e-${i}`} className="sp-pg-ellipsis">…</span> :
                    <button key={p} className={`sp-pg-btn${currentPage === p ? " active" : ""}`} onClick={() => onPageChange(p)}>{p}</button>
            )}
            <button className="sp-pg-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next →</button>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SubProduct() {
    const [subProducts, setSubProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const location = useLocation();
    const navigate = useNavigate();

    const productId = location.state?.productId;
    const productName = location.state?.productName || "Product";
    const productData = location.state?.productData || null;
    const subCategoryName = location.state?.subCategoryName || "Sub Category";

    const fetchSubProducts = useCallback(async () => {
        if (!productId) {
            setSubProducts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await getData(`api/subProduct/get-all-sub-products-by-productId/${productId}`);
            // console.log("response =>", response.data)
            if (response?.status === true) {
                setSubProducts(response?.data || []);
            } else {
                toast.error(response?.message || "Failed to fetch lots");
            }
        } catch (error) {
            console.error("fetchSubProducts:", error);
            toast.error("Failed to fetch lots");
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => { fetchSubProducts(); }, [fetchSubProducts]);
    useEffect(() => { setCurrentPage(1); }, [subProducts]);

    const totalPages = Math.max(1, Math.ceil(subProducts.length / PAGE_SIZE));
    const paginatedData = subProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const startItem = subProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, subProducts.length);

    return (
        <>
            <style>{styles}</style>
            <div className="sp-root">

                {/* Navbar */}
                <nav className="sp-nav">
                    <Logo />
                    <div className="sp-nav-right">
                        <span className="sp-nav-pill">{subProducts.length} Lots</span>
                        <button className="sp-back-btn" onClick={() => navigate(-1)}>← Back</button>
                    </div>
                </nav>

                {/* Product hero */}
                {/* <ProductHero productData={productData} /> */}

                {/* Breadcrumb */}
                <div className="sp-breadcrumb">
                    <span className="sp-breadcrumb-link" onClick={() => navigate("/main-category")}>Home</span>
                    <span className="sp-breadcrumb-sep">/</span>
                    <span className="sp-breadcrumb-link" onClick={() => navigate(-3)}>Categories</span>
                    <span className="sp-breadcrumb-sep">/</span>
                    <span className="sp-breadcrumb-link" onClick={() => navigate(-2)}>sub Category</span>
                    <span className="sp-breadcrumb-sep">/</span>
                    <span className="sp-breadcrumb-link" onClick={() => navigate(-1)}>product</span>
                    <span className="sp-breadcrumb-sep">/</span>
                    <span className="sp-breadcrumb-current">sub product</span>
                </div>

                {/* Page Header */}
                <div className="sp-page-header">
                    <div>
                        <h1 className="sp-page-title">Product <span>Lots</span></h1>
                        <p className="sp-page-sub">
                            All colour &amp; size variants for <strong style={{ color: "var(--gold-dim)" }}>{productName}</strong>
                        </p>
                    </div>
                </div>

                <div className="sp-divider" />

                {/* Content */}
                {loading ? (
                    <div className="sp-grid">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : subProducts.length === 0 ? (
                    <div className="sp-empty">
                        <div className="sp-empty-icon">🗂️</div>
                        <h2>No lots found</h2>
                        <p>No colour/size lots have been added for this product yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="sp-grid">
                            {paginatedData.map((item) => (
                                <LotCard key={item._id} item={item} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="sp-pag-wrap">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                <p className="sp-page-info">Showing {startItem}–{endItem} of {subProducts.length} lots</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </>
    );
}