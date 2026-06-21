// app/layout.tsx
import type { Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";
import { createClient } from '@/utils/supabase/server';
import { pickMessages } from '@/lib/intl';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define the fonts here so they are available globally
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--font-fraunces" });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let isAuditor = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin, is_auditor').eq('id', user.id).single();
    isAdmin = !!profile?.is_admin;
    isAuditor = !!profile?.is_auditor;
  }

  const locale = await getLocale();
  const messages = await getMessages();
  const chromeMessages = pickMessages(messages, ['Navbar']);

  return (
    <html lang={locale}>
      {/* Apply the font variables to the body */}
      <body className={`${dmSans.variable} ${fraunces.variable}`}>
        <NextIntlClientProvider locale={locale} messages={chromeMessages}>
          <Navbar user={user} isAdmin={isAdmin} isAuditor={isAuditor} />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
