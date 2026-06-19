// app/layout.tsx
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define the fonts here so they are available globally
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--font-fraunces" });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let roles: string[] = [];
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id);
    roles = roleData?.map((r: { role_id: string }) => r.role_id) || [];
  }

  return (
    <html lang="en">
      {/* Apply the font variables to the body */}
      <body className={`${dmSans.variable} ${fraunces.variable}`}>
        <Navbar user={user} roles={roles} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
