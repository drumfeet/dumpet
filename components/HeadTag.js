import Head from "next/head"

export default function HeadTag() {
  const meta = {
    title: "dumpet.fun",
    description: "Populartiy contest duel platform",
    image: "T2q7IO67TYEhuk1CIPVxHX9MdEmzTUocZjScmdWTHK0",
  }

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${meta.title}`} />
      <meta name="twitter:description" content={meta.description} />
      <meta
        name="twitter:image"
        content={`https://arweave.net/${meta.image}`}
      />
      <meta property="og:title" content={`${meta.title}`} />
      <meta name="og:description" content={meta.description} />
      <meta name="og:image" content={`https://arweave.net/${meta.image}`} />
      <link rel="icon" href="./favicon.svg" />
    </Head>
  )
}
