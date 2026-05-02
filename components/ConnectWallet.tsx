'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isReconnecting) return null

  if (!isConnected) {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isConnecting}
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              border: '0.5px solid #1a1a1a',
              background: 'transparent',
              color: '#1a1a1a',
              cursor: 'pointer',
              fontFamily: 'inherit',
              opacity: isConnecting ? 0.5 : 1,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1a1a1a'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#1a1a1a'
            }}
          >
            {connector.name === 'Base Account' ? 'Connect' : connector.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '11px', letterSpacing: '0.06em', color: '#999', fontFamily: 'monospace' }}>
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </span>
      <button
      onClick={() => disconnect()}
        style={{
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '6px 14px',
          border: '0.5px solid #ccc',
          background: 'transparent',
          color: '#999',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#1a1a1a'
          e.currentTarget.style.color = '#1a1a1a'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#ccc'
          e.currentTarget.style.color = '#999'
        }}
      >
        Disconnect
      </button>
    </div>
  )
}
