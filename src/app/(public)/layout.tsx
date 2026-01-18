import { Newsreader } from 'next/font/google';

const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-newsreader' });

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className={newsreader.variable}>{children}</main>
    </>
  );
}
