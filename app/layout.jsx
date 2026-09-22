import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: {
    default: 'PinTrend — Galeri Inspirasi Gambar Tanpa Batas',
    template: '%s | PinTrend',
  },
  description:
    'Jelajahi ribuan gambar inspirasi dari Pinterest: dekorasi, fashion, resep, travel, dan banyak lagi — dengan deskripsi yang diolah AI.',
  openGraph: {
    title: 'PinTrend — Galeri Inspirasi Gambar Tanpa Batas',
    description: 'Ribuan gambar inspirasi dari Pinterest dengan deskripsi AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {/* Iklan (ProfitableRateCPM Network — invoke.js) */}
        <Script
          src="https://pl30875068.profitableratecpmnetwork.com/d49e7a6a96a3a99a4f4d6d20b51dc6ba/invoke.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />
        <div id="container-d49e7a6a96a3a99a4f4d6d20b51dc6ba" />
        {children}
      </body>
    </html>
  );
}
