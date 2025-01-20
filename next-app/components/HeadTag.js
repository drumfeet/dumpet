import Head from "next/head"

export default function HeadTag() {
  return (
    <Head>
      <title>dumpet.fun</title>
      <meta name="description" content="Popularity contest duel platform" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="./favicon.ico" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="dumpet.fun" />
      <meta
        name="twitter:description"
        content="Popularity contest duel platform"
      />
      <meta
        name="twitter:image"
        content="https://arweave.net/QifSiTK9jez7w1km9r9QM7BdNM_ddhyjK0g-gD2hKn0"
      />

      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:url" content="https://dumpet.fun" />
      <meta property="og:title" content="dumpet.fun" />
      <meta name="og:description" content="Popularity contest duel platform" />
      <meta
        name="og:image"
        content="https://arweave.net/QifSiTK9jez7w1km9r9QM7BdNM_ddhyjK0g-gD2hKn0"
      />
    </Head>
  )
}
