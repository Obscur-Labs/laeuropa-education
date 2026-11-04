/** Shown instantly while a panel page loads its data. */
export default function Loading() {
  return (
    <div className="skeleton" role="status" aria-label="Loading">
      <div className="sk sk-title" />
      <div className="sk sk-line" />
      <div className="sk-grid">
        <div className="sk sk-card" />
        <div className="sk sk-card" />
      </div>
      <div className="sk sk-block" />
    </div>
  );
}
