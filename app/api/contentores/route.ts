import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET — Buscar todos os contentores
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('contentores')
      .select('*')
      .order('ultima_atualizacao', { ascending: false })

    if (error) throw error

    return NextResponse.json({ sucesso: true, dados: data })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao buscar contentores' },
      { status: 500 }
    )
  }
}

// POST — Registar novo contentor
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, latitude, longitude } = body

    if (!nome || !latitude || !longitude) {
      return NextResponse.json(
        { sucesso: false, erro: 'Nome, latitude e longitude são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('contentores')
      .insert([{ nome, latitude, longitude }])
      .select()

    if (error) throw error

    return NextResponse.json({ sucesso: true, dados: data[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao criar contentor' },
      { status: 500 }
    )
  }
}