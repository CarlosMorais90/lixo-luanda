export type EstadoContentor = 'vazio' | 'quase_cheio' | 'cheio'

export interface Contentor {
  id: string
  nome: string
  latitude: number
  longitude: number
  estado: EstadoContentor
  ultima_foto_url: string | null
  ultima_atualizacao: string
  criado_em: string
}

export interface Recolha {
  id: string
  contentor_id: string
  foto_antes_url: string | null
  foto_depois_url: string | null
  estado_antes: string
  estado_depois: string
  latitude: number
  longitude: number
  criado_em: string
}

export interface Rota {
  id: string
  contentores_ids: string[]
  rota_optimizada: any
  distancia_total: number
  estado: 'pendente' | 'em_curso' | 'concluida'
  avaliacao_groq: any
  criado_em: string
  concluida_em: string | null
}