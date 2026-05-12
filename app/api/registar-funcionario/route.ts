import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, email, perfil, municipio, telefone, passwordTemp } = body

    if (!nome || !email || !perfil || !municipio || !passwordTemp) {
      return NextResponse.json({ sucesso: false, erro: 'Faltam campos obrigatórios' }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: passwordTemp,
      email_confirm: true,
      user_metadata: {
        nome,
        perfil,
        municipio,
        telefone,
      },
    })

    if (authError) {
      return NextResponse.json({ sucesso: false, erro: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ sucesso: false, erro: 'Erro ao criar utilizador' }, { status: 500 })
    }

    const perfilDisplay = perfil === 'chefe'
      ? 'Chefe Municipal'
      : perfil === 'camionista'
        ? 'Camionista'
        : 'Operador de Campo'

    const { error: perfilError } = await supabaseAdmin
      .from('perfis')
      .insert([{
        id: authData.user.id,
        nome,
        email,
        perfil,
        cargo: perfilDisplay,
        municipio,
        telefone,
        password_temp: passwordTemp,
        estado: 'activo'
      }])

    if (perfilError) {
      return NextResponse.json({ sucesso: false, erro: perfilError.message }, { status: 500 })
    }

    return NextResponse.json({ sucesso: true })
  } catch (error: any) {
    return NextResponse.json({ sucesso: false, erro: error.message || 'Erro desconhecido' }, { status: 500 })
  }
}
