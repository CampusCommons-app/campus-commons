import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router';

import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import { ThemeProvider } from '@/lib/theme-context';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ThemeProvider>
      <Website>
        <Helmet>
          <title>Campus Commons</title>
          <meta name="description" content="Campus club management platform for Bentley University." />
        </Helmet>
        <ScrollRestoration />
        <Header />
        {children}
        <Footer />
      </Website>
    </ThemeProvider>
  );
}
