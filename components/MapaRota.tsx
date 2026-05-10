'use client'

import { useEffect, useState } from 'react'

interface Paragem {
  ordem: number
  contentor_id: string
  nome: string
  latitude: number
  longitude: number
  estado: string
}

interface MapaRotaProps {
  paragens: Paragem[]
  recolhidas: Set<string>
}

export default function MapaRota({ paragens, recolhidas }: MapaRotaProps) {
  const [MapaComponente, setMapaComponente] = useState<any>(null)

  useEffect(() => {
    import('leaflet').then((L) => {
      import('react-leaflet').then(({ MapContainer, TileLayer, CircleMarker, Popup, Polyline }) => {
        const Componente = () => {
          if (!paragens || paragens.length === 0) return null
          const centro: [number, number] = [paragens[0].latitude, paragens[0].longitude]
          const pontos: [number, number][] = paragens.map(p => [p.latitude, p.longitude])

          return (
            <MapContainer center={centro} zoom={13} style={{ height: '280px', width: '100%', borderRadius: '8px' }}>
              <TileLayer attribution='OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={pontos} color="#1e40af" weight={3} dashArray="8 4" />
              {paragens.map((p) => (
                <CircleMarker
                  key={p.contentor_id}
                  center={[p.latitude, p.longitude]}
                  radius={16}
                  fillColor={recolhidas.has(p.contentor_id) ? '#15803d' : p.estado === 'cheio' ? '#dc2626' : '#f97316'}
                  color="white"
                  weight={2}
                  fillOpacity={0.9}
                >
                  <Popup>
                    <strong>{p.ordem}. {p.nome}</strong><br/>
                    {recolhidas.has(p.contentor_id) ? '✅ Recolhido' : p.estado}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )
        }
        setMapaComponente(() => Componente)
      })
    })
  }, [paragens, recolhidas])

  if (!MapaComponente) {
    return (
      <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px', color: '#64748b', fontSize: '14px' }}>
        A carregar mapa...
      </div>
    )
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapaComponente />
    </>
  )
}