'use client'

import { useState, useEffect, useRef } from 'react'

const MUNICIPIOS_LUANDA = [
  'Belas', 'Cacuaco', 'Cazenga', 'Icolo e Bengo',
  'Kilamba Kiaxi', 'Luanda', 'Maianga', 'Quissama',
  'Rangel', 'Samba', 'Sambizanga', 'Talatona', 'Viana'
]

interface ResultadoAnalise {
  estado: string
  percentagem: number
  observacao: string
}

export default function PaginaOperador() {
  const [foto, setFoto] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [municipio, setMunicipio] = useState('')
  const [bairro, setBairro] = useState('')
  const [rua, setRua] = useState('')
  const [dataHora, setDataHora] = useState('')
  const inputFotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const actualizarHora = () => {
      setDataHora(new Date().toLocaleString('pt-PT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }))
    }
    actualizarHora()
    const intervalo = setInterval(actualizarHora, 1000)
    return () => clearInterval(intervalo)
  }, [])

  const selecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    setFoto(ficheiro)
    setPreviewFoto(URL.createObjectURL(ficheiro))
    setResultado(null)
    setErro(null)
  }

  const analisarFoto = async () => {
    if (!foto || !municipio || !bairro || !rua) {
      setErro('Preencha todos os campos e tire uma foto antes de analisar')
      return
    }
    setAnalisando(true)
    setErro(null)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(foto)
      })
      const resposta = await fetch('/api/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentor_id: null,
          foto_base64: base64,
          localizacao: { municipio, bairro, rua },
          data_hora: dataHora
        })
      })
      const dados = await resposta.json()
      if (!dados.sucesso) { setErro(dados.erro || 'Erro ao analisar'); return }
      setResultado(dados.analise)
    } catch (e) {
      setErro('Erro ao processar a foto')
    } finally {
      setAnalisando(false)
    }
  }

  const corEstado = (e: string) => e === 'cheio' ? '#dc2626' : e === 'quase_cheio' ? '#f97316' : '#16a34a'
  const fundoEstado = (e: string) => e === 'cheio' ? '#fef2f2' : e === 'quase_cheio' ? '#fff7ed' : '#f0fdf4'
  const iconeEstado = (e: string) => e === 'cheio' ? '🔴' : e === 'quase_cheio' ? '🟠' : '🟢'

  return (
    <main style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      <nav style={{ background: '#92400e', padding: '10px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📊 Dashboard</a>
        <a href="/camionista" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>🚛 Camionista</a>
        <a href="/chefe" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📋 Chefe</a>
      </nav>

      <header style={{ background: '#d97706', color: 'white', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📷 Análise de Contentor</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>Luanda Limpa — Operador de Campo</p>
        <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', fontFamily: 'monospace', fontWeight: '600' }}>
          🕐 {dataHora}
        </div>
      </header>

      <div style={{ padding: '16px' }}>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            📍 Localização do contentor
          </label>
          <select
            value={municipio}
            onChange={e => setMunicipio(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', background: 'white', marginBottom: '10px', boxSizing: 'border-box' as const, color: '#1e293b', fontWeight: '500' }}
          >
            <option value="">-- Seleccione o município --</option>
            {MUNICIPIOS_LUANDA.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            value={bairro}
            onChange={e => setBairro(e.target.value)}
            placeholder="Ex: Bairro Operário"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', marginBottom: '10px', boxSizing: 'border-box' as const, color: '#1e293b' }}
          />
          <input
            value={rua}
            onChange={e => setRua(e.target.value)}
            placeholder="Ex: Rua da Independência, nº 45"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box' as const, color: '#1e293b' }}
          />
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>
            📸 Foto do contentor (câmera directa)
          </label>
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={selecionarFoto}
            style={{ display: 'none' }}
          />
          {!previewFoto ? (
            <button
              onClick={() => inputFotoRef.current?.click()}
              style={{ width: '100%', padding: '32px', borderRadius: '12px', border: '2px dashed #d1d5db', background: '#f8fafc', cursor: 'pointer', fontSize: '14px', color: '#64748b', textAlign: 'center' as const }}
            >
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
              Tirar foto com a câmera do telemóvel
            </button>
          ) : (
            <div>
              <img src={previewFoto} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '10px', maxHeight: '250px', objectFit: 'cover' as const }} />
              <button
                onClick={() => inputFotoRef.current?.click()}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#64748b' }}
              >
                🔄 Tirar nova foto
              </button>
            </div>
          )}
        </div>

        {erro && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', color: '#dc2626', fontSize: '14px', marginBottom: '12px' }}>
            ❌ {erro}
          </div>
        )}

        <button
          onClick={analisarFoto}
          disabled={analisando || !foto || !municipio || !bairro || !rua}
          style={{ width: '100%', background: analisando || !foto || !municipio || !bairro || !rua ? '#94a3b8' : '#d97706', color: 'white', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px' }}
        >
          {analisando ? '⏳ A analisar com Groq...' : '🧠 Analisar com IA'}
        </button>

        {resultado && (
          <div style={{ background: fundoEstado(resultado.estado), borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '15px' }}>✅ Resultado da análise</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: corEstado(resultado.estado), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {iconeEstado(resultado.estado)}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '18px', color: c