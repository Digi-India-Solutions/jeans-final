import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/feature/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData, getData } from "../../../services/FetchNodeServices";

// ─── Default terms list ───────────────────────────────────────────────────────
let DEFAULT_TERMS = [];

// ─── Single term row ──────────────────────────────────────────────────────────
function TermRow({ index, value, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
    return (
        <div className="flex items-start gap-2 group">
            <span className="mt-2.5 min-w-[24px] text-center text-xs font-bold text-gray-400 select-none">
                {index + 1}.
            </span>
            <textarea
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                   hover:border-gray-300 transition-colors"
                placeholder="Enter term or condition..."
            />
            {/* Reorder + delete buttons */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    disabled={isFirst}
                    title="Move up"
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200
                     text-gray-400 hover:text-blue-600 hover:border-blue-300
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <i className="ri-arrow-up-s-line text-sm" />
                </button>
                <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    disabled={isLast}
                    title="Move down"
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200
                     text-gray-400 hover:text-blue-600 hover:border-blue-300
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <i className="ri-arrow-down-s-line text-sm" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(index)}
                    title="Delete"
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200
                     text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                >
                    <i className="ri-delete-bin-line text-sm" />
                </button>
            </div>
        </div>
    );
}

// ─── Preview modal ────────────────────────────────────────────────────────────
function PreviewModal({ terms, companyName, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Preview — As shown on invoice</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="ri-close-line text-xl" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                            📋 Terms &amp; Conditions
                        </p>
                        <ul className="space-y-2">
                            {terms.filter(Boolean).map((t, i) => (
                                <li key={i} className="text-xs text-gray-600 leading-relaxed">
                                    {i + 1}. {t}
                                </li>
                            ))}
                        </ul>
                        {companyName && (
                            <p className="text-[10px] text-gray-400 mt-4 border-t border-gray-200 pt-3">
                                — {companyName}
                            </p>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full h-9 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────onDelete──────────────────
export default function TermAndCondition() {
    const [terms, setTerms] = useState([...DEFAULT_TERMS]);
    const [companyName, setCompanyName] = useState("Anibhavi Creation Pvt. Ltd.");
    const [existingId, setExistingId] = useState(null);   // ✅ if already exists → UPDATE
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [isDirty, setIsDirty] = useState(false);  // unsaved changes

    // ── Fetch existing T&C ──────────────────────────────────────────────────────
    const fetchTerms = useCallback(async () => {
        setIsFetching(true);
        try {
            const res = await getData("api/termAndCondition/get");
            if (res?.success && res?.data) {
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                if (data) {
                    console.log("DEFAULT_TERMSDEFAULT_TERMSDEFAULT_TERMS===>", data)
                    setExistingId(data._id ?? data.id ?? null);
                    setTerms(data.terms ?? data.termsList ?? []);
                    DEFAULT_TERMS = data.terms ?? data.termsList
                    setCompanyName(data.companyName ?? companyName);
                }
            }
        } catch (err) {
            console.error("fetchTerms:", err);
            // keep defaults on error — don't show error for first-time users
        } finally {
            setIsFetching(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchTerms(); }, [fetchTerms]);

    // ── Term CRUD ───────────────────────────────────────────────────────────────
    const handleChange = (index, value) => {
        setTerms((prev) => { const n = [...prev]; n[index] = value; return n; });
        setIsDirty(true);
    };

    const handleAdd = () => {
        setTerms((prev) => [...prev, ""]);
        setIsDirty(true);
        // scroll to bottom after render
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 50);
    };

    const handleDelete = (index) => {
        setTerms((prev) => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        setTerms((prev) => {
            const n = [...prev];
            [n[index - 1], n[index]] = [n[index], n[index - 1]];
            return n;
        });
        setIsDirty(true);
    };

    const handleMoveDown = (index) => {
        setTerms((prev) => {
            if (index === prev.length - 1) return prev;
            const n = [...prev];
            [n[index], n[index + 1]] = [n[index + 1], n[index]];
            return n;
        });
        setIsDirty(true);
    };

    const handleReset = () => {
       fetchTerms()
        setIsDirty(true);
    };

    // ── Save / Update ───────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanedTerms = terms.filter((t) => t.trim());
        if (cleanedTerms.length === 0) {
            toast.error("Add at least one term before saving.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = { terms: cleanedTerms, companyName };

            // ✅ If already exists → UPDATE, else → CREATE
            const url = existingId
                ? `api/termAndCondition/update/${existingId}`
                : "api/termAndCondition/create";

            const res = await postData(url, payload);

            if (res?.success) {
                toast.success(existingId ? "Terms updated successfully!" : "Terms created successfully!");
                setExistingId(res?.data?._id ?? res?.data?.id ?? existingId);
                setTerms(cleanedTerms);
                setIsDirty(false);
            } else {
                toast.error(res?.message || "Failed to save terms");
            }
        } catch (err) {
            console.error("handleSubmit:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <ToastContainer />
            <div className="p-6 max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Terms &amp; Conditions</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            These terms appear on every printed order invoice.
                            {/* ✅ Show create vs update status */}
                            {!isFetching && (
                                <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${existingId
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                    }`}>
                                    {existingId ? "✓ Saved" : "Not created yet"}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300
                       text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <i className="ri-eye-line" /> Preview
                    </button>
                </div>

                {/* Loading */}
                {isFetching ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Company name field */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <i className="ri-building-line text-blue-500" />
                                Company Name (shown at footer of terms)
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => { setCompanyName(e.target.value); setIsDirty(true); }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Your company name"
                            />
                        </div>

                        {/* Terms list */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <i className="ri-list-check-2 text-blue-500" />
                                    Terms &amp; Conditions
                                    <span className="text-xs text-gray-400 font-normal ml-1">
                                        ({terms.filter(Boolean).length} terms)
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                                >
                                    Reset to default
                                </button>
                            </div>

                            <div className="space-y-3">
                                {terms.map((term, index) => (
                                    <TermRow
                                        key={index}
                                        index={index}
                                        value={term}
                                        onChange={handleChange}
                                        onDelete={handleDelete}
                                        onMoveUp={handleMoveUp}
                                        onMoveDown={handleMoveDown}
                                        isFirst={index === 0}
                                        isLast={index === terms.length - 1}
                                    />
                                ))}
                            </div>

                            {/* Add term button */}
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="w-full h-10 rounded-lg border-2 border-dashed border-gray-300
                           text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600
                           transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="ri-add-line" /> Add New Term
                            </button>
                        </div>

                        {/* Unsaved indicator */}
                        {isDirty && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50
                              border border-amber-200 rounded-lg px-4 py-2">
                                <i className="ri-error-warning-line" />
                                You have unsaved changes
                            </div>
                        )}

                        {/* Submit button — ✅ CREATE vs UPDATE based on existingId */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { fetchTerms(); setIsDirty(false); }}
                                disabled={isLoading || !isDirty}
                                className="h-10 px-5 rounded-lg border border-gray-300 text-sm font-medium
                           text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                Discard Changes
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-10 rounded-lg text-white text-sm font-semibold
                           flex items-center justify-center gap-2 transition-colors
                           bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin" />
                                        {existingId ? "Updating..." : "Creating..."}
                                    </>
                                ) : existingId ? (
                                    <>
                                        <i className="ri-save-line" />
                                        Update Terms &amp; Conditions
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-add-circle-line" />
                                        Create Terms &amp; Conditions
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <PreviewModal
                    terms={terms.filter(Boolean)}
                    companyName={companyName}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </AdminLayout>
    );
}