import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-blue-900 w-screen h-screen flex items-center">{children}</body>
    </html>
  )
}
