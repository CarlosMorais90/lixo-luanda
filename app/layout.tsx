import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Recolha de Lixo — Luanda',
  description: 'Sistema inteligente de gestão de recolha de lixo em Luanda, Angola',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body>
        {children}
      </body>
    </html>
  )
}