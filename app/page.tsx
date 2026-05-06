'use client'

import { useEffect, useState } from 'react'
import { Contentor } from '@/lib/types'
import Estatisticas from '@/components/Estatisticas'
import dynamic from 'next/dynamic'

// Carregar o mapa dinamicamente (apenas no browser)
const Mapa = dynamic(() => import('@/components/Mapa'), { ssr: false })

export default function Dashboard() {
  const [contentores, setContentores] = useState<Contentor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ultimaActualizacao, setUltimaActualizacao] = useState<string>('')

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
    // Actualizar automaticamente a cada 30 segundos
    const intervalo = setInterval(buscarContentores, 30000)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Cabeçalho */}
      <header style={{
        background: '#1e40af',
        color: 'white',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
            🗺️ Sistema de Recolha de Lixo — Luanda
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>
            Dashboard de gestão municipal
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px', opacity: 0.8 }}>
          <div>Última actualização</div>
          <div style={{ fontWeight: '600' }}>{ultimaActualizacao || '...'}</div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Estado de carregamento */}
        {carregando && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#64748b',
            fontSize: '16px'
          }}>
            ⏳ A carregar dados dos contentores...
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            color: '#dc2626',
            marginBottom: '24px'
          }}>
            ❌ {erro}
          </div>
        )}

        {/* Dashboard */}
        {!carregando && !erro && (
          <>
            {/* Estatísticas */}
            <Estatisticas contentores={contentores} />

            {/* Mapa */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                  📍 Mapa de Contentores
                </h2>
                <button
                  onClick={buscarContentores}
                  style={{
                    background: '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔄 Actualizar
                </button>
              </div>
              <Mapa contentores={contentores} />
            </div>

            {/* Legenda */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              gap: '32px',
              flexWrap: 'wrap'
            }}>
              <strong style={{ color: '#1e293b' }}>Legenda:</strong>
              <span>🔴 Cheio — recolha urgente</span>
              <span>🟠 Quase cheio — recolha em breve</span>
              <span>🟢 Vazio — sem necessidade</span>
            </div>

            {/* Lista de contentores críticos */}
            {contentores.filter(c => c.estado !== 'vazio').length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                marginTop: '24px'
              }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1e293b' }}>
                  ⚠️ Contentores Críticos
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Nome</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Estado</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Última Actualização</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentores
                      .filter(c => c.estado !== 'vazio')
                      .map((c, i) => (
                        <tr key={c.id} style={{
                          borderTop: '1px solid #f1f5f9',
                          background: i % 2 === 0 ? 'white' : '#fafafa'
                        }}>
                          <td style={{ padding: '12px', fontWeight: '500', color: '#1e293b' }}>{c.nome}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              background: c.estado === 'cheio' ? '#fef2f2' : '#fff7ed',
                              color: c.estado === 'cheio' ? '#dc2626' : '#ea580c',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}>
                              {c.estado === 'cheio' ? '🔴 Cheio' : '🟠 Quase cheio'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                            {new Date(c.ultima_atualizacao).toLocaleString('pt-PT')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}