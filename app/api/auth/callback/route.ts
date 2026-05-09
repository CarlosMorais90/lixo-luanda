import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const perfil = searchParams.get('perfil') || 'gestor'

  const destino = perfil === 'camionista' ? '/camionista'
    : perfil === 'operador' ? '/operador'
    : perfil === 'chefe' ? '/chefe'
    : '/'

  const response = NextResponse.redirect(new URL(destino, request.url))
  
  response.cookies.set('luanda-limpa-loggedin', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    sameSite: 'lax'
  })

  response.cookies.set('luanda-limpa-perfil', perfil, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    sameSite: 'lax'
  })

  return response
}