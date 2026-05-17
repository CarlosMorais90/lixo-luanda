'use client'

import VerificarAuth from '@/components/VerificarAuth'
import { useState, useEffect, useRef } from 'react'
import ProtegerComLogin from '@/components/ProtegerComLogin'
const MUN = ['Belas','Cacuaco','Cazenga','Icolo e Bengo','Kilamba Kiaxi','Luanda','Maianga','Quissama','Rangel','Samba','Sambizanga','Talatona','Viana']
export default function PaginaOperador() {
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [municipio, setMunicipio] = useState('')
  const [bairro, setBairro] = useState('')
  const [rua, setRua] = useState('')
  const [hora, setHora] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const t = setInterval(() => setHora(new Date().toLocaleString('pt-PT')), 1000)
    return () => clearInterval(t)
  }, [])
  const tirarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFoto(f); setPreview(URL.createObjectURL(f)); setResultado(null); setErro(null)
  }
  const analisar = async () => {
    if (!foto || !municipio || !bairro || !rua) { setErro('Preencha todos os campos e tire uma foto'); return }
    setAnalisando(true); setErro(null)
    try {
      const b64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(foto) })
      const resp = await fetch('/api/analisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentor_id: null, foto_base64: b64, localizacao: { municipio, bairro, rua }, data_hora: hora }) })
      const d = await resp.json()
      if (!d.sucesso) { setErro(d.erro || 'Erro ao analisar'); return }
      setResultado(d.analise)
    } catch { setErro('Erro ao processar a foto') }
    finally { setAnalisando(false) }
  }
  const cor = (e: string) => e === 'cheio' ? '#dc2626' : e === 'quase_cheio' ? '#f97316' : '#16a34a'
  const bg = (e: string) => e === 'cheio' ? '#fef2f2' : e === 'quase_cheio' ? '#fff7ed' : '#f0fdf4'
  return (
    <VerificarAuth perfisPermitidos={['operador']}>
    <main style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      <nav style={{ background: '#92400e', padding: '10px 20px', display: 'flex', gap: '8px' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📊 Dashboard</a>
        <a href="/camionista" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>🚛 Camionista</a>
        <a href="/chefe" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📋 Chefe</a>
      </nav>
      <header style={{ background: '#d97706', color: 'white', padding: '16px 20px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📷 Análise de Contentor</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>Luanda Limpa — Operador de Campo</p>
        <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '6px 10px', fontSize: '13px' }}>🕐 {hora}</div>
      </header>
      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>📍 Localização do contentor</label>
          <select value={municipio} onChange={e => setMunicipio(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', background: 'white', marginBottom: '10px', color: '#1e293b', fontWeight: '500' }}>
            <option value="">-- Seleccione o município --</option>
            {MUN.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', marginBottom: '10px', color: '#1e293b', display: 'block' }} />
          <input value={rua} onChange={e => setRua(e.target.value)} placeholder="Rua / Referência" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', color: '#1e293b', display: 'block' }} />
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>📸 Foto do contentor</label>
          <input ref={ref} type="file" accept="image/*" capture="environment" onChange={tirarFoto} style={{ display: 'none' }} />
          {!preview ? (
            <button onClick={() => ref.current?.click()} style={{ width: '100%', padding: '32px', borderRadius: '12px', border: '2px dashed #d1d5db', background: '#f8fafc', cursor: 'pointer', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
              Tirar foto com a câmera
            </button>
          ) : (
            <div>
              <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '10px', maxHeight: '250px', objectFit: 'cover' }} />
              <button onClick={() => ref.current?.click()} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#64748b' }}>🔄 Tirar nova foto</button>
            </div>
          )}
        </div>
        {erro && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', color: '#dc2626', fontSize: '14px', marginBottom: '12px' }}>❌ {erro}</div>}
        <button onClick={analisar} disabled={analisando || !foto || !municipio || !bairro || !rua} style={{ width: '100%', background: analisando || !foto || !municipio || !bairro || !rua ? '#94a3b8' : '#d97706', color: 'white', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px' }}>
          {analisando ? '⏳ A analisar com Groq...' : '🧠 Analisar com IA'}
        </button>
        {resultado && (
          <div style={{ background: bg(resultado.estado), borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b' }}>✅ Resultado da análise</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: cor(resultado.estado), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {resultado.estado === 'cheio' ? '🔴' : resultado.estado === 'quase_cheio' ? '🟠' : '🟢'}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '18px', color: cor(resultado.estado) }}>{resultado.estado.replace('_', ' ').toUpperCase()}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{resultado.percentagem}% de capacidade</div>
              </div>
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '10px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ background: cor(resultado.estado), height: '100%', width: resultado.percentagem + '%', borderRadius: '99px' }} />
            </div>
            <div style={{ background: 'white', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#475569', marginBottom: '10px' }}>💬 {resultado.observacao}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {municipio} · {bairro} · {rua}<br/>🕐 {hora}</div>
          </div>
        )}
      </div>
    </main>
    </VerificarAuth>
  )
}