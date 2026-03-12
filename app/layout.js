import './globals.css'

export const metadata = {
  title: 'Outreach Personalizer',
  description: 'AI-powered LinkedIn outreach — find hiring managers, recruiters & team members with confidence scoring',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
