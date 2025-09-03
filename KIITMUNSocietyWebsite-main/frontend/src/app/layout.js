import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'KIIT MUN Society',
  description: 'Official website of KIIT Model United Nations Society - Fostering diplomatic excellence and global awareness',
  keywords: ['MUN', 'Model United Nations', 'KIIT', 'Diplomacy', 'Student Organization'],
  openGraph: {
    title: 'KIIT MUN Society',
    description: 'Official website of KIIT Model United Nations Society',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <script src="https://sheet2api.com/v1/template.js" async></script>
      </head>
      <body className="bg-black text-white">
        <div className="bg-pattern-overlay"></div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
