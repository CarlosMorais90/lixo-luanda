'use client'

import { useEffect, useState } from 'react'
import { Contentor } from '@/lib/types'
import Estatisticas from '@/components/Estatisticas'
import Cabecalho from '@/components/Cabecalho'
import Rota from '@/components/Rota'
import VerificarAuth from '@/components/VerificarAuth'
import dynamic from 'next/dynamic'

const Mapa = dynamic(() => import('@/components/Mapa'), { ssr: false })

export default function Dashboard() {
  const [contentores, setContentores] = useState<Contentor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ultimaActualizacao, setUltimaActualizacao] = useState<string>('')
  const [montado, setMontado] = useState(false)

  useEffect(() => { setMontado(true) }, [])

  const buscarContentores = async () => {
    try {
      const resposta = await fetch('/api/contentores')
      const dados = await resposta.json()
      if (dados.sucesso) {
        setContentores(dados.dados)
        setUltimaActualizacao(new Date().toLocaleTimeString('pt-PT'))
        setErro(null)
      }
    } catch (e) {
      setErro('Erro ao carregar contentores')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarContentores()
    const intervalo = setInterval(buscarContentores, 30000)
    return () => clearInterval(intervalo)
  }, [])
  return (
    <VerificarAuth perfisPermitidos={['gestor', 'chefe']}>
      <main style={{ minHeight: '100vh', background: '#f0fdf4', fontFamily: 'system-ui, sans-serif' }}>
        <Cabecalho
          titulo="Dashboard — Luanda Limpa"
          subtitulo="Gestão inteligente de resíduos urbanos"
          corFundo="#064e3b"
        />

        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Última actualização */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '24px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#064e3b', fontWeight: '700' }}>
                📍 Visão geral de Luanda
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                Última actualização: {ultimaActualizacao || '...'}
              </p>
            </div>
            <button
              onClick={buscarContentores}
              style={{
                background: '#064e3b', color: 'white',
                border: 'none', borderRadius: '10px',
                padding: '10px 20px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              🔄 Actualizar
            </button>
          </div>

          {carregando && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>A carregar dados dos contentores...</p>
            </div>
          )}

          {erro && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '12px', padding: '16px',
              color: '#dc2626', marginBottom: '24px'
            }}>
              ❌ {erro}
            </div>
          )}

          {!carregando && !erro && (
            <>
              <Estatisticas contentores={contentores} />

              <div style={{
                background: 'white', borderRadius: '16px',
                padding: '24px', marginBottom: '24px',
                boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                border: '1px solid #d1fae5'
              }}>
                <h3 style={{ margin: '0 0 16px', color: '#064e3b', fontSize: '16px', fontWeight: '700' }}>
                  🗺️ Mapa de Contentores — Luanda
                </h3>
                {montado && <Mapa contentores={contentores} />}
              </div>

              <div style={{
                background: 'white', borderRadius: '16px',
                padding: '16px 24px', marginBottom: '24px',
                boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                border: '1px solid #d1fae5',
                display: 'flex', gap: '24px', flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <strong style={{ color: '#064e3b' }}>Legenda:</strong>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                  Cheio — recolha urgente
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
                  Quase cheio — recolha em breve
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Vazio — sem necessidade
                </span>
              </div>

              {contentores.filter(c => c.estado !== 'vazio').length > 0 && (
                <div style={{
                  background: 'white', borderRadius: '16px',
                  padding: '24px', marginBottom: '24px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #d1fae5'
                }}>
                  <h3 style={{ margin: '0 0 16px', color: '#064e3b', fontSize: '16px', fontWeight: '700' }}>
                    ⚠️ Contentores Críticos
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f0fdf4' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Nome</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Estado</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Última Actualização</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentores.filter(c => c.estado !== 'vazio').map((c, i) => (
                        <tr key={c.id} style={{ borderTop: '1px solid #f0fdf4', background: i % 2 === 0 ? 'white' : '#fafffe' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1e293b' }}>{c.nome}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              background: c.estado === 'cheio' ? '#fef2f2' : '#fff7ed',
                              color: c.estado === 'cheio' ? '#dc2626' : '#ea580c',
                              padding: '4px 12px', borderRadius: '20px',
                              fontSize: '13px', fontWeight: '600'
                            }}>
                              {c.estado === 'cheio' ? '🔴 Cheio' : '🟠 Quase cheio'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                            {new Date(c.ultima_atualizacao).toLocaleString('pt-PT')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Rota />
            </>
          )}
        </div>
      </main>
    </VerificarAuth>
  )
}