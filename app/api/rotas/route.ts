import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('rotas')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) throw error

    return NextResponse.json({ sucesso: true, dados: data })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao buscar rotas' },
      { status: 500 }
    )
  }
}