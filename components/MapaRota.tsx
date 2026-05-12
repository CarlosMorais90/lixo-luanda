'use client'

import { useEffect, useState, type ComponentType } from 'react'

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
  const [MapaComponente, setMapaComponente] = useState<ComponentType<{ rota: [number, number][] }> | null>(null)
  const [rotaCoords, setRotaCoords] = useState<[number, number][]>([])

  useEffect(() => {
    if (!paragens || paragens.length === 0) return

    const buscarRota = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY

        const resposta = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${paragens[0].longitude},${paragens[0].latitude}&end=${paragens[paragens.length - 1].longitude},${paragens[paragens.length - 1].latitude}`,
          { headers: { 'Accept': 'application/json, application/geo+json' } }
        )

        if (!resposta.ok) throw new Error('Erro na API')

        const dados = await resposta.json()
        const geometry = dados.features?.[0]?.geometry?.coordinates

        if (geometry) {
          const pontos: [number, number][] = geometry.map((c: number[]) => [c[1], c[0]])
          setRotaCoords(pontos)
        }
      } catch {
        setRotaCoords(paragens.map(p => [p.latitude, p.longitude]))
      }
    }

    buscarRota()

    import('leaflet').then(() => {
      import('react-leaflet').then(({ MapContainer, TileLayer, CircleMarker, Popup, Polyline }) => {
        const Componente = ({ rota }: { rota: [number, number][] }) => {
          if (!paragens || paragens.length === 0) return null
          const centro: [number, number] = [paragens[0].latitude, paragens[0].longitude]

          return (
            <MapContainer center={centro} zoom={13} style={{ height: '280px', width: '100%', borderRadius: '8px' }}>
              <TileLayer attribution='OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {rota.length > 0 && (
                <Polyline positions={rota} color="#1e40af" weight={4} opacity={0.8} />
              )}
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
              {paragens.length > 1 && paragens.map((p, i) => (
                i < paragens.length - 1 && (
                  <CircleMarker
                    key={`label-${p.contentor_id}`}
                    center={[p.latitude, p.longitude]}
                    radius={10}
                    fillColor="white"
                    color="#1e40af"
                    weight={2}
                    fillOpacity={1}
                  />
                )
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
      <div className="map-loading">
        A carregar mapa...
      </div>
    )
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapaComponente rota={rotaCoords} />
    </>
  )
}
