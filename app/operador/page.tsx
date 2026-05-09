'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

interface Contentor {
  id: string
  nome: string
  estado: string
}

interface ResultadoAnalise {
  estado: string
  percentagem: number
  observacao: string
}

export default function PaginaOperador() {
  const [contentores, setContentores] = useState<Contentor[]>([])
  const [contentorSeleccionado, setContentorSeleccionado] = useState<string>('')
  const [foto, setFoto] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregandoContentores, setCarregandoContentores] = useState(true)
  const inputFotoRef = useRef<HTMLInputElement>(null)

  const supabase = createSupabaseBrowser()

  // Carregar contentores
  // Carregar contentores
  useEffect(() => {
    fetch('/api/contentores')
      .then(res => res.json())
      .then(dados => {
        if (dados.sucesso) setContentores(dados.dados)
        setCarregandoContentores(false)
      })
      .catch(() => setCarregandoContentores(false))
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
    if (!foto || !contentorSeleccionado) {
      setErro('Seleccione um contentor e tire uma foto primeiro')
      return
    }

    setAnalisando(true)
    setErro(null)

    try {
      // Converter foto para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result)
        }
        reader.onerror = reject
        reader.readAsDataURL(foto)
      })

      // Enviar para a API de análise como base64
      const resposta = await fetch('/api/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentor_id: contentorSeleccionado,
          foto_base64: base64
        })
      })

      const dados = await resposta.json()

      if (!dados.sucesso) {
        setErro(dados.erro || 'Erro ao analisar a imagem')
        return
      }

      setResultado(dados.analise)

    } catch (e) {
      setErro('Erro ao processar a foto')
    } finally {
      setAnalisando(false)
    }
  }

  const corEstado = (estado: string) => {
    if (estado === 'cheio') return '#dc2626'
    if (estado === 'quase_cheio') return '#f97316'
    return '#16a34a'
  }

  const fundoEstado = (estado: string) => {
    if (estado === 'cheio') return '#fef2f2'
    if (estado === 'quase_cheio') return '#fff7ed'
    return '#f0fdf4'
  }

  const iconeEstado = (estado: string) => {
    if (estado === 'cheio') return '🔴'
    if (estado === 'quase_cheio') return '🟠'
    return '🟢'
  }

  return (
    <>
      <main style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '480px',
        margin: '0 auto'
      }}>
        {/* Cabeçalho */}
        <header style={{
          background: '#d97706',
          color: 'white',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            📷 Análise de Contentor
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>
            Tire uma foto para análise com IA
          </p>
        </header>

        <div style={{ padding: '20px' }}>

          {/* Seleccionar contentor */}
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '16px', marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <label style={{
              display: 'block', fontSize: '14px',
              fontWeight: '600', color: '#1e293b', marginBottom: '10px'
            }}>
              1. Seleccione o contentor
            </label>
            {carregandoContentores ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>A carregar contentores...</p>
            ) : (
              <select
                value={contentorSeleccionado}
                onChange={e => setContentorSeleccionado(e.target.value)}
                style={{
                  width: '100%', padding: '12px',
                  borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '15px', background: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Escolha um contentor --</option>
                {contentores.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.estado}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tirar foto */}
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '16px', marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <label style={{
              display: 'block', fontSize: '14px',
              fontWeight: '600', color: '#1e293b', marginBottom: '10px'
            }}>
              2. Tire ou escolha uma foto
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
                style={{
                  width: '100%', padding: '32px',
                  borderRadius: '12px', border: '2px dashed #d1d5db',
                  background: '#f8fafc', cursor: 'pointer',
                  fontSize: '14px', color: '#64748b',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
                Clique para tirar foto com a câmera
              </button>
            ) : (
              <div>
                <img
                  src={previewFoto}
                  alt="Preview"
                  style={{
                    width: '100%', borderRadius: '8px',
                    marginBottom: '10px', maxHeight: '300px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => inputFotoRef.current?.click()}
                  style={{
                    width: '100%', padding: '10px',
                    borderRadius: '8px', border: '1px solid #d1d5db',
                    background: 'white', cursor: 'pointer',
                    fontSize: '13px', color: '#64748b'
                  }}
                >
                  🔄 Mudar foto
                </button>
              </div>
            )}
          </div>

          {/* Erro */}
          {erro && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '12px 16px',
              color: '#dc2626', fontSize: '14px', marginBottom: '16px'
            }}>
              ❌ {erro}
            </div>
          )}

          {/* Botão analisar */}
          <button
            onClick={analisarFoto}
            disabled={analisando || !foto || !contentorSeleccionado}
            style={{
              width: '100%',
              background: analisando || !foto || !contentorSeleccionado ? '#94a3b8' : '#d97706',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '16px', fontSize: '16px', fontWeight: '700',
              cursor: analisando || !foto || !contentorSeleccionado ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {analisando ? '⏳ A analisar com Groq...' : '🧠 Analisar com IA'}
          </button>

          {/* Resultado */}
          {resultado && (
            <div style={{
              background: fundoEstado(resultado.estado),
              borderRadius: '16px', padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '16px' }}>
                ✅ Resultado da análise
              </h3>

              {/* Estado */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '12px', marginBottom: '16px'
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: corEstado(resultado.estado),
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '28px'
                }}>
                  {iconeEstado(resultado.estado)}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '20px', color: corEstado(resultado.estado) }}>
                    {resultado.estado.replace('_', ' ').toUpperCase()}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {resultado.percentagem}% de capacidade
                  </div>
                </div>
              </div>

              {/* Barra de percentagem */}
              <div style={{
                background: '#e2e8f0', borderRadius: '99px',
                height: '12px', overflow: 'hidden', marginBottom: '16px'
              }}>
                <div style={{
                  background: corEstado(resultado.estado),
                  height: '100%', width: `${resultado.percentagem}%`,
                  borderRadius: '99px', transition: 'width 0.5s ease'
                }} />
              </div>

              {/* Observação */}
              <div style={{
                background: 'white', borderRadius: '8px',
                padding: '12px', fontSize: '14px', color: '#475569'
              }}>
                💬 {resultado.observacao}
              </div>

              {/* Estado actualizado */}
              <div style={{
                marginTop: '12px', fontSize: '13px',
                color: '#64748b', textAlign: 'center'
              }}>
                ✅ Estado do contentor actualizado no sistema
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}