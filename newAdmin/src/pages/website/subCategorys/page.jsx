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
    --radius:    14px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .c-root {
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 60px;
  }

  /* ── Navbar ── */
  .c-nav {
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
.c-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-decoration: none;
  user-select: none;
}

.c-logo-mark {
  font-family: 'Arial Black', Arial, sans-serif;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
}

.c-logo-a { color: #f0ece4; }
.c-logo-c { color: #2196f3; }

.c-logo-divider {
  width: 1px;
  height: 34px;
  background: rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.c-logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 3px;
}

.c-logo-name {
  font-family: 'Arial Black', Arial, sans-serif;
  font-size: 0.88rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.c-logo-n1 { color: #f0ece4; }
.c-logo-n2 { color: #2196f3; }

.c-logo-tagline {
  font-size: 0.6rem;
  color: var(--muted);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
  .c-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .c-nav-pill {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--surface2);
    border: 1px solid var(--border2);
    padding: 6px 14px;
    border-radius: 20px;
  }

  .c-back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--muted);
    background: var(--surface2);
    border: 1px solid var(--border2);
    padding: 6px 14px;
    border-radius: 20px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }

  .c-back-btn:hover {
    color: var(--gold);
    border-color: var(--gold-dim);
  }

  /* ── Breadcrumb ── */
  .c-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 18px 40px 0;
    font-size: 0.76rem;
    color: var(--muted);
  }

  .c-breadcrumb-link {
    color: var(--gold-dim);
    cursor: pointer;
    transition: color 0.2s;
  }

  .c-breadcrumb-link:hover { color: var(--gold); }

  .c-breadcrumb-sep { color: var(--border2); }

  .c-breadcrumb-current { color: var(--muted); }

  /* ── Page header ── */
  .c-page-header {
    padding: 24px 40px 32px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }

  .c-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.8rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .c-page-title span { color: var(--gold); }

  .c-page-sub {
    font-size: 0.82rem;
    color: var(--muted);
    margin-top: 6px;
    letter-spacing: 0.04em;
  }

  /* ── Grid ── */
  .c-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 22px;
    padding: 36px 40px;
  }

  /* ── Card ── */
  .c-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
    animation: fadeUp 0.45s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .c-card:nth-child(1) { animation-delay: 0.04s; }
  .c-card:nth-child(2) { animation-delay: 0.08s; }
  .c-card:nth-child(3) { animation-delay: 0.12s; }
  .c-card:nth-child(4) { animation-delay: 0.16s; }
  .c-card:nth-child(5) { animation-delay: 0.20s; }
  .c-card:nth-child(6) { animation-delay: 0.24s; }

  .c-card:hover {
    border-color: var(--gold-dim);
    box-shadow: 0 0 28px var(--gold-glow), 0 12px 40px rgba(0,0,0,0.5);
    transform: translateY(-4px);
  }

  .c-card:hover .c-card-img { transform: scale(1.06); }

  .c-img-wrap {
    height: 210px;
    position: relative;
    overflow: hidden;
    background: var(--surface2);
  }

  /* Banner strip at top of card */
  .c-banner-strip {
    height: 56px;
    overflow: hidden;
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
    position: relative;
  }

  .c-banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0.6;
  }

  .c-banner-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding: 0 14px;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    background: linear-gradient(90deg, rgba(10,9,8,0.7) 0%, transparent 80%);
  }

  .c-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    display: block;
  }

  .c-img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.8rem;
    background: radial-gradient(ellipse at center, #1e1a14, var(--surface2));
  }

  .c-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10,9,8,0.75) 0%, transparent 55%);
    pointer-events: none;
  }

  .c-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .c-badge.active  { background: rgba(76,175,125,0.15); color: var(--green); border: 1px solid rgba(76,175,125,0.35); }
  .c-badge.inactive{ background: rgba(224,92,92,0.15);  color: var(--red);   border: 1px solid rgba(224,92,92,0.35); }

  .c-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  .c-card-body { padding: 18px 20px 20px; }

  .c-card-slug {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold-dim);
    margin-bottom: 5px;
  }

  .c-card-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.45rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
    line-height: 1.15;
  }

  .c-card-desc {
    font-size: 0.82rem;
    line-height: 1.65;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .c-card-desc.empty {
    font-style: italic;
    opacity: 0.5;
  }

  .c-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .c-card-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .c-card-date { font-size: 0.72rem; color: var(--muted); }

  .c-card-products {
    font-size: 0.68rem;
    color: var(--gold-dim);
    font-weight: 500;
    letter-spacing: 0.06em;
  }

  .c-card-btn {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    transition: gap 0.2s, color 0.2s;
  }

  .c-card:hover .c-card-btn { gap: 9px; color: #e8c96a; }

  /* ── Skeleton ── */
  .c-skeleton {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .c-skel-img {
    height: 210px;
    background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .c-skel-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 10px; }

  .c-skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--surface2) 25%, #201d19 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  /* ── Empty ── */
  .c-empty { text-align: center; padding: 100px 20px; color: var(--muted); }
  .c-empty-icon { font-size: 3.5rem; margin-bottom: 18px; }

  .c-empty h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    color: var(--text);
    margin-bottom: 8px;
  }

  .c-empty p { font-size: 0.88rem; }

  /* ── Pagination ── */
  .c-pag-wrap { padding: 0 40px; }

  .c-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 0;
    flex-wrap: wrap;
  }

  .c-page-info {
    font-size: 0.76rem;
    color: var(--muted);
    text-align: center;
    margin-top: 10px;
    letter-spacing: 0.04em;
  }

  .c-pg-btn {
    height: 38px;
    min-width: 38px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--border2);
    background: var(--surface);
    color: var(--muted);
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.2s;
  }

  .c-pg-btn:hover:not(:disabled) {
    border-color: var(--gold-dim);
    color: var(--gold);
    background: var(--gold-glow);
  }

  .c-pg-btn.active {
    background: var(--gold);
    color: #0a0908;
    border-color: var(--gold);
    font-weight: 700;
    box-shadow: 0 0 14px var(--gold-glow);
  }

  .c-pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .c-pg-ellipsis { font-size: 0.9rem; color: var(--muted); width: 24px; text-align: center; }

  .c-divider { height: 1px; background: var(--border); margin: 0 40px; }

  @media (max-width: 600px) {
    .c-nav { padding: 0 18px; }
    .c-breadcrumb { padding: 14px 18px 0; }
    .c-page-header { padding: 20px 18px 24px; flex-direction: column; align-items: flex-start; gap: 10px; }
    .c-grid { padding: 20px 18px; gap: 16px; }
    .c-pag-wrap { padding: 0 18px; }
    .c-page-title { font-size: 2rem; }
    .c-divider { margin: 0 18px; }
    .c-nav-right { gap: 8px; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateVal) {
    const raw = dateVal?.$date || dateVal;
    if (!raw) return "—";
    return new Date(raw).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function paginationRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Logo() {
    const navigate = useNavigate();
    return (
        <div className="c-logo" onClick={() => navigate("/main-category")}>
            <div className="c-logo-mark">
                <span className="c-logo-a">A</span>
                <span className="c-logo-c">C</span>
            </div>
            <div className="c-logo-divider" />
            <div className="c-logo-text">
                <div className="c-logo-name">
                    <span className="c-logo-n1">ANIBHAVI</span>
                    <span className="c-logo-n2"> CREATIONS</span>
                </div>
                <span className="c-logo-tagline">Fashion Studio</span>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="c-skeleton">
            <div className="c-skel-img" />
            <div className="c-skel-body">
                <div className="c-skel-line" style={{ height: 10, width: "35%" }} />
                <div className="c-skel-line" style={{ height: 22, width: "60%" }} />
                <div className="c-skel-line" style={{ height: 10, width: "90%" }} />
                <div className="c-skel-line" style={{ height: 10, width: "75%" }} />
            </div>
        </div>
    );
}

function SubCategoryCard({ item }) {
    const [imgError, setImgError] = useState(false);
    const [bannerError, setBannerError] = useState(false);
    const navigate = useNavigate();

    const image = item.images?.[0];
    const banner = item.categoryBanner?.[0];

    const handleClick = () => {
        navigate(`/products/${item.slug}`, {
            state: { subCategoryId: item._id, subCategoryName: item.name },
        });
    };
    console.log("item=====>category", item)
    return (
        <div className="c-card" onClick={handleClick}>

            {/* Main image */}
            <div className="c-img-wrap">
                {image && !imgError ? (
                    <img
                        className="c-card-img"
                        src={image}
                        alt={item?.name}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="c-img-fallback">🧵</div>
                )}
                <div className="c-img-overlay" />
                <span className={`c-badge ${item.status ? "active" : "inactive"}`}>
                    <span className="c-badge-dot" />
                    {item.status ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Body */}
            <div className="c-card-body">
                <div className="c-card-slug">/{item.slug}</div>
                <h2 className="c-card-name">{item.name}</h2>
                <div className="c-card-footer">
                    <div className="c-card-meta">

                    </div>
                    <button className="c-card-btn">
                        View <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = paginationRange(currentPage, totalPages);

    return (
        <div className="c-pagination">
            <button
                className="c-pg-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ← Prev
            </button>

            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`e-${i}`} className="c-pg-ellipsis">…</span>
                ) : (
                    <button
                        key={p}
                        className={`c-pg-btn${currentPage === p ? " active" : ""}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                className="c-pg-btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next →
            </button>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SubCategory() {
    const [subCategories, setSubCategories] = useState([]);   // ✅ fixed: was [setSubCategories, setSubCategories]
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const location = useLocation();
    const navigate = useNavigate();
    const categoryId = location.state?.categoryId;
    const categoryName = location.state?.categoryName || "Category";

    // ✅ Fixed: was calling fetchCategories (undefined); now correctly calls fetchSubCategories
    const fetchSubCategories = useCallback(async () => {
        if (!categoryId) {
            setSubCategories([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await getData(
                `api/category/get_category_by_main_category/${categoryId}`
            );
            if (response?.success) {
                setSubCategories(response?.data || []);
            } else {
                toast.error(response?.message || "Failed to fetch subcategories");
            }
        } catch (error) {
            console.error("fetchSubCategories:", error);
            toast.error("Failed to fetch subcategories");
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]);

    // Reset to page 1 whenever data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [subCategories]);

    const totalPages = Math.max(1, Math.ceil(subCategories.length / PAGE_SIZE));
    const paginatedData = subCategories.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );
    const startItem = subCategories.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, subCategories.length);

    return (
        <>
            <style>{styles}</style>
            <div className="c-root">

                {/* Navbar */}
                <nav className="c-nav">
                    <Logo />
                    <div className="c-nav-right">
                        <span className="c-nav-pill">{subCategories.length} Sub-categories</span>
                        <button className="c-back-btn" onClick={() => navigate(-1)}>
                            ← Back
                        </button>
                    </div>
                </nav>

                {/* Breadcrumb */}
                <div className="c-breadcrumb">
                    <span className="c-breadcrumb-link" onClick={() => navigate("/main-category")}>Home</span>
                    <span className="c-breadcrumb-sep">/</span>
                    <span className="c-breadcrumb-link" onClick={() => navigate(-1)}>Categories</span>
                    <span className="c-breadcrumb-sep">/</span>
                    <span className="c-breadcrumb-current">Sub Category</span>
                </div>

                {/* Page Header */}
                <div className="c-page-header">
                    <div>
                        <h1 className="c-page-title">Sub <span>Categories</span></h1>
                        <p className="c-page-sub">
                            Exploring subcategories under <strong style={{ color: "var(--gold-dim)" }}>{categoryName}</strong>
                        </p>
                    </div>
                </div>

                <div className="c-divider" />

                {/* Content */}
                {loading ? (
                    <div className="c-grid">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : subCategories.length === 0 ? (
                    <div className="c-empty">
                        <div className="c-empty-icon">📂</div>
                        <h2>No subcategories yet</h2>
                        <p>Add subcategories under this category to get started.</p>
                    </div>
                ) : (
                    <>
                        <div className="c-grid">
                            {paginatedData.map((item) => (
                                <SubCategoryCard
                                    key={item._id?.$oid || item._id || item.slug}
                                    item={item}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="c-pag-wrap">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                                <p className="c-page-info">
                                    Showing {startItem}–{endItem} of {subCategories.length} subcategories
                                </p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </>
    );
}