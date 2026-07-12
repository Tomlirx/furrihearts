// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";
import { createClient } from '@/utils/supabase/server';
import { pickMessages } from '@/lib/intl';
import { SITE_URL } from '@/lib/site';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define the fonts here so they are available globally
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--font-fraunces" });

const SITE_NAME = 'FurriHearts';
const SITE_DESCRIPTION = "Malaysia's pet adoption platform — meet cats and dogs looking for a loving home, and connect with verified rescuers.";

// Site-wide defaults. metadataBase makes relative OG image paths (and the
// generated /opengraph-image) resolve to absolute URLs; per-page metadata
// (e.g. app/pet/[id]/layout.tsx) overrides title/description/images.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Adopt a Pet in Malaysia`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Adopt a Pet in Malaysia`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: `${SITE_NAME} — Adopt a Pet in Malaysia`, description: SITE_DESCRIPTION },
};

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
        {/* Set the saved theme before paint to avoid a light/dark flash.
            No stored choice → CSS falls back to prefers-color-scheme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
        <NextIntlClientProvider locale={locale} messages={chromeMessages}>
          <Navbar user={user} isAdmin={isAdmin} isAuditor={isAuditor} />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
