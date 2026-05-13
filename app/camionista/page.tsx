'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import ProtegerComLogin from '@/components/ProtegerComLogin'

const MapaRota = dynamic(() => import('@/components/MapaRota'), { ssr: false })

interface ParagemRota {
  ordem: number
  contentor_id: string
  nome: string
  latitude: number
  longitude: number
  estado: string
  motivo: string
}

interface DadosRota {
  rota_id: string
  rota_optimizada: ParagemRota[]
  distancia_total_km: number
  tempo_estimado_minutos: number
  observacoes: string
}

export default function PaginaCamionista() {
  const [rota, setRota] = useState<DadosRota | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [recolhidas, setRecolhidas] = useState<Set<string>>(new Set())
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [fotoConfirmacao, setFotoConfirmacao] = useState<{[key: string]: string}>({})
  const [rotaIniciada, setRotaIniciada] = useState(false)
  const [alertas, setAlertas] = useState<string[]>([])
  const inputRef = useRef<{[key: string]: HTMLInputElement | null}>({})

  const buscarRota = async () => {
    setCarregando(true)
    setErro(null)
    try {
      const resposta = await fetch('/api/rota')
      const dados = await resposta.json()
      if (dados.sucesso && dados.rota_optimizada) {
        setRota(dados)
        setRotaIniciada(true)
      } else {
        setErro(dados.mensagem || 'Nenhuma rota disponivel')
      }
    } catch (e) {
      setErro('Erro de ligacao ao servidor')
    } finally {
      setCarregando(false)
    }
  }

  const confirmarRecolha = async (paragem: ParagemRota, fotoBase64: string) => {
    setConfirmando(paragem.contentor_id)
    try {
      // Verificar com Groq se o contentor está vazio
      const respostaAnalise = await fetch('/api/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentor_id: paragem.contentor_id,
          foto_base64: fotoBase64
        })
      })
      const analise = await respostaAnalise.json()

      if (!analise.sucesso) {
        setAlertas(prev => [...prev, `Erro ao verificar ${paragem.nome}`])
        return
      }

      // Verificar se o contentor está vazio
      if (analise.analise.estado !== 'vazio') {
        // Enviar alerta ao chefe
        await fetch('/api/alertas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'incumprimento',
            contentor: paragem.nome,
            estado: analise.analise.estado,
            percentagem: analise.analise.percentagem,
            mensagem: `O camionista tentou confirmar a recolha do ${paragem.nome} mas o contentor ainda está ${analise.analise.estado} (${analise.analise.percentagem}% de capacidade)`
          })
        })
        setAlertas(prev => [...prev, `❌ ${paragem.nome}: contentor ainda ${analise.analise.estado} — alerta enviado ao chefe`])
        return
      }

      // Contentor vazio — confirmar recolha
      await fetch('/api/recolhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentor_id: paragem.contentor_id,
          estado_antes: paragem.estado,
          estado_depois: 'vazio'
        })
      })

      setRecolhidas(prev => new Set([...prev, paragem.contentor_id]))
      setFotoConfirmacao(prev => ({ ...prev, [paragem.contentor_id]: fotoBase64 }))

    } catch (e) {
      setAlertas(prev => [...prev, `Erro ao confirmar ${paragem.nome}`])
    } finally {
      setConfirmando(null)
    }
  }

  const processarFoto = (paragem: ParagemRota, e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    const reader = new FileReader()
    reader.onload = () => confirmarRecolha(paragem, reader.result as string)
    reader.readAsDataURL(ficheiro)
  }

  const totalRecolhidas = recolhidas.size
  const totalParagens = rota?.rota_optimizada?.length || 0
  const percentagem = totalParagens > 0 ? Math.round((totalRecolhidas / totalParagens) * 100) : 0

  return (
    <ProtegerComLogin perfisPermitidos={['camionista', 'gestor']} caminhoLogin="/camionista/login">
    <main style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      <nav style={{ background: '#14532d', padding: '10px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📊 Dashboard</a>
        <a href="/operador" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📷 Operador</a>
        <a href="/chefe" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📋 Chefe</a>
      </nav>

      <header style={{ background: '#15803d', color: 'white', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>🚛 Rota de Recolha</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>Luanda Limpa — Camionista</p>
      </header>

      <div style={{ padding: '16px' }}>

        {!rotaIniciada && !carregando && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
            <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>Pronto para começar?</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>Clique para receber a rota de hoje</p>
            <button onClick={buscarRota} style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: '12px', padding: '16px 32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
              🧠 Receber Rota com IA
            </button>
          </div>
        )}

        {carregando && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#64748b' }}>A calcular a rota...</p>
          </div>
        )}

        {erro && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '12px', padding: '16px', color: '#854d0e', marginBottom: '16px', textAlign: 'center' }}>
            ℹ️ {erro}
          </div>
        )}

        {alertas.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <strong style={{ color: '#dc2626', fontSize: '14px' }}>⚠️ Alertas:</strong>
            {alertas.map((a, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#dc2626', marginTop: '6px' }}>{a}</div>
            ))}
          </div>
        )}

        {rota && (
          <>
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Progresso</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#15803d' }}>{totalRecolhidas}/{totalParagens}</span>
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#15803d', height: '100%', width: `${percentagem}%`, borderRadius: '99px', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                <span>📏 {rota.distancia_total_km} km</span>
                <span>⏱️ ~{rota.tempo_estimado_minutos} min</span>
              </div>
            </div>

            {rota.observacoes && (
              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#1e40af', borderLeft: '3px solid #3b82f6' }}>
                💡 {rota.observacoes}
              </div>
            )}

            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#1e293b' }}>🗺️ Mapa da rota</h3>
              <MapaRota paragens={rota.rota_optimizada} recolhidas={recolhidas} />
            </div>

            <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paragens</h3>

            {rota.rota_optimizada?.map((paragem) => {
              const recolhida = recolhidas.has(paragem.contentor_id)
              const aConfirmar = confirmando === paragem.contentor_id
              return (
                <div key={paragem.contentor_id} style={{ background: recolhida ? '#f0fdf4' : 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: recolhida ? '1px solid #86efac' : '1px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: recolhida ? '0' : '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: recolhida ? '#15803d' : '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                      {recolhida ? '✓' : paragem.ordem}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px', textDecoration: recolhida ? 'line-through' : 'none' }}>{paragem.nome}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{paragem.motivo}</div>
                    </div>
                    <span style={{ background: paragem.estado === 'cheio' ? '#fef2f2' : '#fff7ed', color: paragem.estado === 'cheio' ? '#dc2626' : '#ea580c', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                      {paragem.estado === 'cheio' ? '🔴' : '🟠'}
                    </span>
                  </div>

                  {!recolhida && (
                    <>
                      <input
                        ref={el => { inputRef.current[paragem.contentor_id] = el }}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={e => processarFoto(paragem, e)}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => inputRef.current[paragem.contentor_id]?.click()}
                        disabled={!!aConfirmar}
                        style={{ background: aConfirmar ? '#94a3b8' : '#15803d', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', width: '100%', fontSize: '14px', fontWeight: '600', cursor: aConfirmar ? 'not-allowed' : 'pointer' }}
                      >
                        {aConfirmar ? '⏳ A verificar com IA...' : '📸 Tirar foto e confirmar recolha'}
                      </button>
                      <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', margin: '6px 0 0' }}>A IA vai verificar se o contentor está vazio</p>
                    </>
                  )}

                  {recolhida && (
                    <div style={{ textAlign: 'center', fontSize: '13px', color: '#15803d', fontWeight: '600' }}>✅ Recolhido e verificado pela IA</div>
                  )}
                </div>
              )
            })}

            {totalRecolhidas === totalParagens && totalParagens > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '8px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ color: '#15803d', margin: '0 0 8px' }}>Rota concluída!</h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Todos os contentores foram verificados e recolhidos.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
    </ProtegerComLogin>
  )
}