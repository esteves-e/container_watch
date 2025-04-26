import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png" />

        {/* SEO básico */}
        <meta name="title" content="ContainerWatch | Gestão de Containers, Veículos e Embarcações" />
        <meta name="description" content="Facilite o acompanhamento de manutenção, inspeções e checklists técnicos de containers, veículos e embarcações com o ContainerWatch." />
        <meta name="theme-color" content="#0F172A" />

        {/* Cor do navegador no mobile */}
        <meta name="theme-color" content="#0F172A" /> {/* azul-escuro bonito */}

        {/* Open Graph (Compartilhamento bonito em redes sociais) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://container-watch-one.vercel.app/" /> {/* <-- coloca a URL real depois */}
        <meta property="og:title" content="ContainerWatch | Gestão de Containers, Veículos e Embarcações" />
        <meta property="og:description" content="Facilite o acompanhamento de manutenção, inspeções e checklists técnicos de containers, veículos e embarcações com o ContainerWatch." />
        <meta property="og:image" content="/logo.png" /> {/* <-- imagem para preview (ideal: 1200x630px) */}

        {/* Twitter Card (opcional, mas ajuda) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://container-watch-one.vercel.app/" /> {/* mesma URL aqui */}
        <meta name="twitter:title" content="ContainerWatch | Gestão de Containers, Veículos e Embarcações" />
        <meta name="twitter:description" content="Facilite o acompanhamento de manutenção, inspeções e checklists técnicos de containers, veículos e embarcações com o ContainerWatch." />
        <meta name="twitter:image" content="/logo.png" />

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
