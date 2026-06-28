export default function Loading() {
  return (
    <div className="page-scroll" style={{ background: "#EBF3FB", padding: "24px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Skeleton search box */}
        <div style={{ background: "white", borderRadius: 16, padding: "20px 16px", boxShadow: "0 1px 6px rgba(0,40,88,0.08)" }}>
          <div style={{ height: 14, width: 180, background: "#d9e8f8", borderRadius: 6, marginBottom: 16 }} />
          <div style={{ height: 40, background: "#EBF3FB", borderRadius: 8, marginBottom: 10 }} />
          <div style={{ height: 10, width: 120, background: "#d9e8f8", borderRadius: 4 }} />
        </div>
        {/* Skeleton cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ background: "white", borderRadius: 16, padding: "20px 16px", boxShadow: "0 1px 6px rgba(0,40,88,0.08)" }}>
            <div style={{ height: 18, width: "60%", background: "#d9e8f8", borderRadius: 6, marginBottom: 12 }} />
            <div style={{ height: 12, width: "40%", background: "#EBF3FB", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 12, width: "50%", background: "#EBF3FB", borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
