import { useLocation, useNavigate } from "react-router-dom";

export default function ViewDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.rewardId;

    if (!data) {
        return (
            <div style={{ padding: 20 }}>
                <p style={{ color: "red", textAlign: "center", fontSize: "1.1rem" }}>
                    No data available to display.
                </p>
            </div>
        );
    }

    const { userId, points, history, status, createdAt, updatedAt } = data;

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "40px auto",
                padding: "30px",
                background: "#fefefe",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
        >
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: "20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                }}
            >
                ← Back
            </button>

            <h1
                style={{
                    marginBottom: "25px",
                    color: "#1c1c1c",
                    fontSize: "2rem",
                    borderBottom: "2px solid #eee",
                    paddingBottom: "10px",
                }}
            >
                Reward Point Details
            </h1>

            {/* User Info */}
            <section
                style={{
                    backgroundColor: "#eaf3ff",
                    padding: "20px",
                    borderRadius: "10px",
                    marginBottom: "30px",
                }}>
                <h2 style={sectionTitleStyle}>User Information</h2>
                <div style={rowStyle}><strong>Name:</strong> {userId?.name || "-"}</div>
                <div style={rowStyle}><strong>Email:</strong> {userId?.email || "-"}</div>
                <div style={rowStyle}><strong>Phone:</strong> {userId?.phone || "-"}</div>
                <div style={rowStyle}><strong>User ID:</strong> {userId?.uniqueUserId || "-"}</div>
                <div style={rowStyle}>
                    <strong>Account Status:</strong>{" "}
                    <span style={{ color: userId?.isActive ? "green" : "red", fontWeight: 600 }}>
                        {userId?.isActive ? "Active" : "Inactive"}
                    </span>
                </div>
            </section>

            {/* Points Summary */}
            <section style={{ backgroundColor: "#f5f7f9", padding: "20px", borderRadius: "10px", marginBottom: "30px", }}>
                <h2 style={sectionTitleStyle}>Summary</h2>
                <div style={rowStyle}>
                    <span style={labelStyle}>Total Points:</span>
                    <span style={{ ...valueStyle, fontSize: "1.3rem", fontWeight: 600, color: "#0077cc" }}>
                        {points}
                    </span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Created At:</span>
                    <span style={valueStyle}>{new Date(createdAt).toLocaleString()}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Updated At:</span>
                    <span style={valueStyle}>{new Date(updatedAt).toLocaleString()}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Status:</span>
                    <span
                        style={{ ...valueStyle, backgroundColor: status ? "#d4edda" : "#f8d7da", color: status ? "#155724" : "#721c24", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold", display: "inline-block", minWidth: "80px", textAlign: "center", }}>
                        {status ? "Active" : "Inactive"}
                    </span>
                </div>
            </section>

            {/* Points History */}
            <section>
                <h2 style={sectionTitleStyle}>Points History</h2>
                {history?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {history.map((item) => (
                            <div key={item._id} style={{ backgroundColor: "#ffffff", borderLeft: "6px solid #4caf50", padding: "15px 20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)", }}>
                                <div style={{ fontWeight: 600, color: "#333", marginBottom: 6 }}>{item.description}</div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#555" }}>
                                    <span style={{ color: "#28a745", fontWeight: "bold" }}>{item.type === 'earned' ? <>+</> : <>-</>}{item.amount}</span>
                                    <span>{new Date(item.date).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>No history available.</p>
                )}
            </section>
        </div>
    );
}

const rowStyle = { padding: "6px 0", fontSize: "0.95rem", };

const labelStyle = { fontWeight: "bold", color: "#444", marginRight: "8px", };

const valueStyle = { color: "#222", };

const sectionTitleStyle = { fontSize: "1.2rem", marginBottom: "15px", fontWeight: "600", color: "#222", borderBottom: "1px solid #ccc", paddingBottom: "5px", };
