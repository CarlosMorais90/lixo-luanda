import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentor_id, estado_antes, estado_depois } = body

    if (!contentor_id) {
      return NextResponse.json(
        { sucesso: false, erro: 'contentor_id é obrigatório' },
        { status: 400 }
      )
    }

    // Registar a recolha
    const { data: recolha, error: recolhaError } = await supabase
      .from('recolhas')
      .insert([{
        contentor_id,
        estado_antes: estado_antes || 'cheio',
        estado_depois: estado_depois || 'vazio'
      }])
      .select()

    if (recolhaError) throw recolhaError

    // Actualizar o estado do contentor para vazio
    const { error: updateError } = await supabase
      .from('contentores')
      .update({
        estado: 'vazio',
        ultima_atualizacao: new Date().toISOString()
      })
      .eq('id', contentor_id)

    if (updateError) throw updateError

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Recolha confirmada com sucesso',
      dados: recolha[0]
    })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao confirmar recolha' },
      { status: 500 }
    )
  }
}