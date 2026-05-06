'use client'

import { useEffect, useState } from 'react'
import { Contentor } from '@/lib/types'

interface MapaProps {
  contentores: Contentor[]
}

const coresEstado = {
  vazio: '#22c55e',
  quase_cheio: '#f97316',
  cheio: '#ef4444'
}

const iconeEstado = {
  vazio: '🟢',
  quase_cheio: '🟠',
  cheio: '🔴'
}

export default function Mapa({ contentores }: MapaProps) {
  const [MapaComponente, setMapaComponente] = useState<any>(null)

  useEffect(() => {
    // Carregar o Leaflet apenas no browser (não no servidor)
    import('leaflet').then((L) => {
      import('react-leaflet').then(({ MapContainer, TileLayer, CircleMarker, Popup }) => {
        const Componente = () => (
          <MapContainer
            center={[-8.8383, 13.2344]}
            zoom={13}
            style={{ height: '500px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {contentores.map((contentor) => (
              <CircleMarker
                key={contentor.id}
                center={[contentor.latitude, contentor.longitude]}
                radius={16}
                fillColor={coresEstado[contentor.estado]}
                color="white"
                weight={2}
                fillOpacity={0.9}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <strong>{contentor.nome}</strong>
                    <br />
                    <span>Estado: {iconeEstado[contentor.estado]} {contentor.estado.replace('_', ' ')}</span>
                    <br />
                    <small>Última actualização: {new Date(contentor.ultima_atualizacao).toLocaleString('pt-PT')}</small>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )
        setMapaComponente(() => Componente)
      })
    })
  }, [contentores])

  if (!MapaComponente) {
    return (
      <div style={{
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
        borderRadius: '12px',
        fontSize: '16px',
        color: '#64748b'
      }}>
        A carregar mapa de Luanda...
      </div>
    )
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapaComponente />
    </>
  )
}