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

  .p-root {
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 60px;
  }

  /* ── Navbar ── */
  .p-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 68px;
    background: var(--surface);
    border-bottom: 1px solid var(--border2);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }

  .p-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
  .p-logo-mark { font-family: 'Arial Black', Arial, sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.02em; display: flex; align-items: center; }
  .p-logo-a { color: #f0ece4; }
  .p-logo-c { color: #2196f3; }
  .p-logo-divider { width: 1px; height: 34px; background: rgba(255,255,255,0.1); flex-shrink: 0; }
  .p-logo-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; }
  .p-logo-name { font-family: 'Arial Black', Arial, sans-serif; font-size: 0.88rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
  .p-logo-n1 { color: #f0ece4; }
  .p-logo-n2 { color: #2196f3; }
  .p-logo-tagline { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }

  .p-nav-right { display: flex; align-items: center; gap: 12px; }

  .p-nav-pill {
    font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--muted); background: var(--surface2); border: 1px solid var(--border2);
    padding: 6px 14px; border-radius: 20px;
  }

  .p-back-btn {
    display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 500;
    letter-spacing: 0.06em; color: var(--muted); background: var(--surface2);
    border: 1px solid var(--border2); padding: 6px 14px; border-radius: 20px;
    cursor: pointer; transition: color 0.2s, border-color 0.2s;
  }
  .p-back-btn:hover { color: var(--gold); border-color: var(--gold-dim); }

  /* ── Breadcrumb ── */
  .p-breadcrumb { display: flex; align-items: center; gap: 8px; padding: 18px 40px 0; font-size: 0.76rem; color: var(--muted); flex-wrap: wrap; }
  .p-breadcrumb-link { color: var(--gold-dim); cursor: pointer; transition: color 0.2s; }
  .p-breadcrumb-link:hover { color: var(--gold); }
  .p-breadcrumb-sep { color: var(--border2); }
  .p-breadcrumb-current { color: var(--muted); }

  /* ── Page header ── */
  .p-page-header {
    padding: 24px 40px 28px;
    display: flex; align-items: flex-end; justify-content: space-between;
    border-bottom: 1px solid var(--border);
    gap: 16px; flex-wrap: wrap;
  }
  .p-page-title { font-family: 'Cormorant Garamond', serif; font-size: 2.8rem; font-weight: 700; line-height: 1; letter-spacing: -0.01em; }
  .p-page-title span { color: var(--gold); }
  .p-page-sub { font-size: 0.82rem; color: var(--muted); margin-top: 6px; letter-spacing: 0.04em; }

  /* ── Filter bar ── */
  .p-filter-bar {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 40px 0; flex-wrap: wrap;
  }
  .p-filter-label { font-size: 0.72rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-right: 4px; }
  .p-filter-btn {
    font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px; border: 1px solid var(--border2);
    background: var(--surface); color: var(--muted); cursor: pointer; transition: all 0.2s;
  }
  .p-filter-btn:hover { border-color: var(--gold-dim); color: var(--gold); }
  .p-filter-btn.active { background: var(--gold); color: #0a0908; border-color: var(--gold); font-weight: 700; }

  /* ── Grid ── */
  .p-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    padding: 28px 40px;
  }

  /* ── Product Card ── */
  .p-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
    animation: fadeUp 0.45s ease both;
    display: flex; flex-direction: column;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .p-card:nth-child(1) { animation-delay: 0.04s; }
  .p-card:nth-child(2) { animation-delay: 0.08s; }
  .p-card:nth-child(3) { animation-delay: 0.12s; }
  .p-card:nth-child(4) { animation-delay: 0.16s; }
  .p-card:nth-child(5) { animation-delay: 0.20s; }
  .p-card:nth-child(6) { animation-delay: 0.24s; }

  .p-card:hover {
    border-color: var(--gold-dim);
    box-shadow: 0 0 28px var(--gold-glow), 0 12px 40px rgba(0,0,0,0.5);
    transform: translateY(-4px);
  }
  .p-card:hover .p-card-img { transform: scale(1.06); }

  /* Image area with thumbnail strip */
  .p-img-wrap { height: 220px; position: relative; overflow: hidden; background: var(--surface2); flex-shrink: 0; }
  .p-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
  .p-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: radial-gradient(ellipse at center, #1e1a14, var(--surface2)); }
  .p-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,9,8,0.8) 0%, transparent 50%); pointer-events: none; }

  /* Image count chip */
  .p-img-count {
    position: absolute; bottom: 10px; right: 10px;
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.1em;
    background: rgba(10,9,8,0.75); color: var(--muted);
    border: 1px solid var(--border2); padding: 3px 8px; border-radius: 10px;
  }

  /* Type badge */
  .p-type-badge {
    position: absolute; top: 12px; left: 12px;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px;
  }
  .p-type-badge.best-seller { background: rgba(201,168,76,0.2); color: var(--gold); border: 1px solid rgba(201,168,76,0.4); }
  .p-type-badge.new-arrival { background: rgba(33,150,243,0.2); color: var(--blue); border: 1px solid rgba(33,150,243,0.4); }
  .p-type-badge.default     { background: rgba(255,255,255,0.08); color: var(--muted); border: 1px solid var(--border2); }

  /* Status dot */
  .p-status-dot {
    position: absolute; top: 12px; right: 12px;
    width: 8px; height: 8px; border-radius: 50%;
  }
  .p-status-dot.active   { background: var(--green); box-shadow: 0 0 6px rgba(76,175,125,0.6); }
  .p-status-dot.inactive { background: var(--red); }

  /* Card body */
  .p-card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; flex: 1; }
  .p-card-sku { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 4px; }
  .p-card-name { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 700; color: var(--text); line-height: 1.15; margin-bottom: 8px; }

  /* Category chips */
  .p-cat-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
  .p-cat-chip {
    font-size: 0.6rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 8px; border-radius: 10px;
    background: var(--surface2); color: var(--muted); border: 1px solid var(--border);
  }

  .p-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid var(--border); margin-top: auto;
  }
  .p-price { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 700; color: var(--gold); }
  .p-price-label { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; display: block; }

  .p-card-btn {
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--gold); background: none; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 5px; padding: 0; transition: gap 0.2s, color 0.2s;
  }
  .p-card:hover .p-card-btn { gap: 9px; color: #e8c96a; }

  /* ── Skeleton ── */
  .p-skeleton { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .p-skel-img { height: 220px; background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .p-skel-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }
  .p-skel-line { border-radius: 6px; background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }

  /* ── Empty ── */
  .p-empty { text-align: center; padding: 100px 20px; color: var(--muted); }
  .p-empty-icon { font-size: 3.5rem; margin-bottom: 18px; }
  .p-empty h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: var(--text); margin-bottom: 8px; }
  .p-empty p { font-size: 0.88rem; }

  /* ── Pagination ── */
  .p-pag-wrap { padding: 0 40px; }
  .p-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 0; flex-wrap: wrap; }
  .p-page-info { font-size: 0.76rem; color: var(--muted); text-align: center; margin-top: 10px; letter-spacing: 0.04em; }
  .p-pg-btn {
    height: 38px; min-width: 38px; padding: 0 12px; border-radius: 8px;
    border: 1px solid var(--border2); background: var(--surface); color: var(--muted);
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 500;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s;
  }
  .p-pg-btn:hover:not(:disabled) { border-color: var(--gold-dim); color: var(--gold); background: var(--gold-glow); }
  .p-pg-btn.active { background: var(--gold); color: #0a0908; border-color: var(--gold); font-weight: 700; box-shadow: 0 0 14px var(--gold-glow); }
  .p-pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .p-pg-ellipsis { font-size: 0.9rem; color: var(--muted); width: 24px; text-align: center; }

  .p-divider { height: 1px; background: var(--border); margin: 0 40px; }

  @media (max-width: 600px) {
    .p-nav { padding: 0 18px; }
    .p-breadcrumb { padding: 14px 18px 0; }
    .p-page-header { padding: 20px 18px 24px; }
    .p-filter-bar { padding: 16px 18px 0; }
    .p-grid { padding: 20px 18px; gap: 14px; }
    .p-pag-wrap { padding: 0 18px; }
    .p-page-title { font-size: 2rem; }
    .p-divider { margin: 0 18px; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function paginationRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
}

function typeBadgeClass(type = "") {
    const t = type.toLowerCase().replace(/\s+/g, "-");
    if (t.includes("best")) return "best-seller";
    if (t.includes("new")) return "new-arrival";
    return "default";
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Logo() {
    const navigate = useNavigate();
    return (
        <div className="p-logo" onClick={() => navigate("/main-category")}>
            <div className="p-logo-mark">
                <span className="p-logo-a">A</span>
                <span className="p-logo-c">C</span>
            </div>
            <div className="p-logo-divider" />
            <div className="p-logo-text">
                <div className="p-logo-name">
                    <span className="p-logo-n1">ANIBHAVI</span>
                    <span className="p-logo-n2"> CREATIONS</span>
                </div>
                <span className="p-logo-tagline">Fashion Studio</span>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="p-skeleton">
            <div className="p-skel-img" />
            <div className="p-skel-body">
                <div className="p-skel-line" style={{ height: 9, width: "30%" }} />
                <div className="p-skel-line" style={{ height: 20, width: "65%" }} />
                <div className="p-skel-line" style={{ height: 9, width: "80%" }} />
                <div className="p-skel-line" style={{ height: 9, width: "55%" }} />
            </div>
        </div>
    );
}

function ProductCard({ item }) {
    const [imgIdx, setImgIdx] = useState(0);
    const [imgError, setImgError] = useState(false);
    const navigate = useNavigate();

    const images = item.images || [];
    const currentImg = images[imgIdx];
    const categories = item.categoryId || [];

    const handleClick = () => {
        navigate(`/sub-products/${item?.productName}`, {
            state: { productId: item._id, productName: item.productName, productData: item },
        });
    };

    return (
        <div className="p-card" onClick={handleClick}
            onMouseEnter={() => images.length > 1 && setImgIdx(1)}
            onMouseLeave={() => setImgIdx(0)}
        >
            <div className="p-img-wrap">
                {currentImg && !imgError ? (
                    <img className="p-card-img" src={currentImg} alt={item.productName} onError={() => setImgError(true)} />
                ) : (
                    <div className="p-img-fallback">👖</div>
                )}
                <div className="p-img-overlay" />

                {item.type && (
                    <span className={`p-type-badge ${typeBadgeClass(item.type)}`}>{item.type}</span>
                )}
                <span className={`p-status-dot ${item.status && item.isActive ? "active" : "inactive"}`} title={item.status ? "Active" : "Inactive"} />
                {images.length > 1 && (
                    <span className="p-img-count">{images.length} photos</span>
                )}
            </div>

            <div className="p-card-body">
                <div className="p-card-sku">SKU: {item.sku}</div>
                <h2 className="p-card-name">{item.productName}</h2>

                {categories.length > 0 && (
                    <div className="p-cat-chips">
                        {categories.map((cat) => (
                            <span key={cat._id} className="p-cat-chip">{cat.name}</span>
                        ))}
                    </div>
                )}

                <div className="p-card-footer">
                    <div>
                        <span className="p-price-label">Price / pc</span>
                        <span className="p-price">₹{item.price?.toLocaleString("en-IN")}</span>
                    </div>
                    <button className="p-card-btn" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
                        Lots <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = paginationRange(currentPage, totalPages);
    return (
        <div className="p-pagination">
            <button className="p-pg-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>← Prev</button>
            {pages.map((p, i) =>
                p === "…" ? <span key={`e-${i}`} className="p-pg-ellipsis">…</span> :
                    <button key={p} className={`p-pg-btn${currentPage === p ? " active" : ""}`} onClick={() => onPageChange(p)}>{p}</button>
            )}
            <button className="p-pg-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next →</button>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Product() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeType, setActiveType] = useState("All");

    const location = useLocation();
    const navigate = useNavigate();
    const subCategoryId = location.state?.subCategoryId;
    const subCategoryName = location.state?.subCategoryName || "Products";
    const categoryName = location.state?.categoryName || "Category";

    const fetchProducts = useCallback(async () => {
        if (!subCategoryId) {
            setProducts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await getData(`api/product/get-product-by-sub-category/${subCategoryId}`);
            if (response?.success) {
                setProducts(response?.data || []);
            } else {
                toast.error(response?.message || "Failed to fetch products");
            }
        } catch (error) {
            console.error("fetchProducts:", error);
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }, [subCategoryId]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Build filter types from data
    const typeOptions = ["All", ...Array.from(new Set(products.map((p) => p.type).filter(Boolean)))];

    useEffect(() => {
        setCurrentPage(1);
        setFiltered(activeType === "All" ? products : products.filter((p) => p.type === activeType));
    }, [products, activeType]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, filtered.length);

    return (
        <>
            <style>{styles}</style>
            <div className="p-root">

                {/* Navbar */}
                <nav className="p-nav">
                    <Logo />
                    <div className="p-nav-right">
                        <span className="p-nav-pill">{filtered.length} Products</span>
                        <button className="p-back-btn" onClick={() => navigate(-1)}>← Back</button>
                    </div>
                </nav>

                {/* Breadcrumb */}
                <div className="p-breadcrumb">
                    <span className="p-breadcrumb-link" onClick={() => navigate("/main-category")}>Home</span>
                    <span className="p-breadcrumb-sep">/</span>
                    <span className="p-breadcrumb-link" onClick={() => navigate(-2)}>Categories</span>
                    <span className="p-breadcrumb-sep">/</span>
                    <span className="p-breadcrumb-link" onClick={() => navigate(-1)}>Sub Categories</span>
                    <span className="p-breadcrumb-sep">/</span>
                    <span className="p-breadcrumb-current">Product</span>
                </div>

                {/* Page Header */}
                <div className="p-page-header">
                    <div>
                        <h1 className="p-page-title">All <span>Products</span></h1>
                        <p className="p-page-sub">
                            Showing products under <strong style={{ color: "var(--gold-dim)" }}>{subCategoryName}</strong>
                        </p>
                    </div>
                </div>

                <div className="p-divider" />

                {/* Filter bar */}
                {!loading && typeOptions.length > 1 && (
                    <div className="p-filter-bar">
                        <span className="p-filter-label">Filter:</span>
                        {typeOptions.map((t) => (
                            <button
                                key={t}
                                className={`p-filter-btn${activeType === t ? " active" : ""}`}
                                onClick={() => setActiveType(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="p-grid">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-empty">
                        <div className="p-empty-icon">📦</div>
                        <h2>No products found</h2>
                        <p>{activeType !== "All" ? `No "${activeType}" products available.` : "Add products to this subcategory to get started."}</p>
                    </div>
                ) : (
                    <>
                        <div className="p-grid">
                            {paginatedData.map((item) => (
                                <ProductCard key={item._id} item={item} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="p-pag-wrap">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                <p className="p-page-info">Showing {startItem}–{endItem} of {filtered.length} products</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </>
    );
}