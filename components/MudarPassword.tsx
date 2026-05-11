'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

export default function MudarPassword() {
  const [aberto, setAberto] = useState(false)
  const [passwordActual, setPasswordActual] = useState('')
  const [novaPassword, setNovaPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const mudarPassword = async () => {
    if (novaPassword !== confirmar) {
      setErro('As passwords não coincidem')
      return
    }
    if (novaPassword.length < 6) {
      setErro('A password deve ter pelo menos 6 caracteres')
      return
    }

    setCarregando(true)
    setErro(null)

    try {
      const supabase = createSupabaseBrowser()
      const { error } = await supabase.auth.updateUser({ password: novaPassword })
      if (error) throw error
      setSucesso(true)
      setPasswordActual('')
      setNovaPassword('')
      setConfirmar('')
      setTimeout(() => { setSucesso(false); setAberto(false) }, 2000)
    } catch (e: any) {
      setErro(e.message || 'Erro ao mudar password')
    } finally {
      setCarregando(false)
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        style={{
          background: 'transparent',
          color: '#64748b',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >
        🔑 Mudar password
      </button>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      maxWidth: '380px',
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>🔑 Mudar password</h3>
        <button onClick={() => setAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
      </div>

      {sucesso && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px', color: '#15803d', marginBottom: '16px', textAlign: 'center' }}>
          ✅ Password alterada com sucesso!
        </div>
      )}

      {erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
          ❌ {erro}
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Nova password</label>
        <input
          type="password"
          value={novaPassword}
          onChange={e => setNovaPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' as const }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Confirmar nova password</label>
        <input
          type="password"
          value={confirmar}
          onChange={e => setConfirmar(e.target.value)}
          placeholder="Repita a nova password"
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' as const }}
        />
      </div>

      <button
        onClick={mudarPassword}
        disabled={carregando || !novaPassword || !confirmar}
        style={{
          width: '100%',
          background: carregando || !novaPassword || !confirmar ? '#94a3b8' : '#1e40af',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: carregando || !novaPassword || !confirmar ? 'not-allowed' : 'pointer'
        }}
      >
        {carregando ? '⏳ A alterar...' : '✅ Confirmar alteração'}
      </button>
    </div>
  )
}