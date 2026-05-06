import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import groq from '@/lib/groq'

export async function GET() {
  try {
    // Buscar contentores críticos (cheios ou quase cheios)
    const { data: contentores, error } = await supabase
      .from('contentores')
      .select('*')
      .in('estado', ['cheio', 'quase_cheio'])
      .order('ultima_atualizacao', { ascending: false })

    if (error) throw error

    if (!contentores || contentores.length === 0) {
      return NextResponse.json({
        sucesso: true,
        mensagem: 'Nenhum contentor crítico no momento',
        rota: []
      })
    }

    // Groq calcula a rota optimizada
    const resposta = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `És um sistema de optimização de rotas de recolha de lixo em Luanda, Angola. 
          O teu objectivo é calcular a rota mais eficiente para recolher lixo nos contentores críticos.
          Responde SEMPRE apenas com JSON válido, sem texto adicional.`
        },
        {
          role: 'user',
          content: `Calcula a rota optimizada para recolher lixo nestes contentores críticos de Luanda:
          ${JSON.stringify(contentores.map(c => ({
            id: c.id,
            nome: c.nome,
            latitude: c.latitude,
            longitude: c.longitude,
            estado: c.estado
          })))}
          
          Responde APENAS com este JSON exacto:
          {
            "rota_optimizada": [
              {
                "ordem": 1,
                "contentor_id": "uuid",
                "nome": "nome do contentor",
                "latitude": número,
                "longitude": número,
                "estado": "cheio ou quase_cheio",
                "motivo": "razão para esta prioridade"
              }
            ],
            "distancia_total_km": número,
            "tempo_estimado_minutos": número,
            "observacoes": "dicas para o camionista"
          }`
        }
      ],
      max_tokens: 1000
    })

    // Extrair o JSON da resposta
    const textoResposta = resposta.choices[0].message.content || ''
    const jsonMatch = textoResposta.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Resposta inválida do Groq')
    const rotaData = JSON.parse(jsonMatch[0])

    // Guardar a rota na base de dados
    const { data: rotaGuardada, error: rotaError } = await supabase
      .from('rotas')
      .insert([{
        contentores_ids: contentores.map(c => c.id),
        rota_optimizada: rotaData,
        distancia_total: rotaData.distancia_total_km,
        estado: 'pendente'
      }])
      .select()

    if (rotaError) throw rotaError

    return NextResponse.json({
      sucesso: true,
      rota_id: rotaGuardada[0].id,
      ...rotaData
    })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao calcular rota' },
      { status: 500 }
    )
  }
}