export default function PageShell({ title, subtitle, right, children, maxWidth = 680 }) {
  return (
    <div className="page" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2a4a 0%, #0d1b33 100%)',
        borderBottom: '1px solid rgba(79,172,254,0.12)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                boxShadow: '0 0 8px rgba(79,172,254,0.6)',
              }} />
              <h1 style={{ fontSize: 18, fontWeight: 600, color: '#e8f4ff', letterSpacing: '-0.01em' }}>{title}</h1>
            </div>
            {subtitle && (
              <p style={{ fontSize: 13, color: '#8ba8c8', marginTop: 2, paddingLeft: 14 }}>{subtitle}</p>
            )}
          </div>
          {right && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{right}</div>}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth, margin: '0 auto', padding: '20px 16px' }}>
        {children}
      </div>
    </div>
  );
}