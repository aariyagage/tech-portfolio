import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Render error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F2F0EC',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', opacity: 0.4, marginBottom: 16 }}>
            / ERROR
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#111', lineHeight: 1 }}>
            Something broke.
          </h1>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 24, lineHeight: 1.5 }}>
            Refresh the page, or reach out at{' '}
            <a href="mailto:aariyagage@gmail.com" style={{ color: '#2D5AFF' }}>aariyagage@gmail.com</a>.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              border: '1px solid #111',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
