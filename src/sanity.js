import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'qdpuwnm5',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

const ptImageFields = `
  ...,
  _type == "image" => {
    "src": asset->url + "?w=1200&auto=format",
    "altText": alt,
    "captionText": caption
  }
`

const colImageFields = `
  ...,
  _type == "image" => {
    "src": asset->url + "?w=800&auto=format",
    "altText": alt,
    "captionText": caption
  }
`

const QUERY = `*[_type == "project" && defined(thumbnail)] | order(orderRank) {
  title,
  "slug": slug.current,
  category,
  "image": thumbnail.asset->url + "?w=1200&auto=format&fit=crop",
  videoUrl,
  "gallery": gallery[]{ "url": asset->url + "?w=1600&auto=format", alt },
  "body": body[]{ ${ptImageFields} },
  "columnsContent": columnsContent[]{
    _key,
    columns,
    "column1": column1[]{ ${colImageFields} },
    "column2": column2[]{ ${colImageFields} },
    "column3": column3[]{ ${colImageFields} }
  }
}`

const toItem = (p) => ({
  title:          p.title,
  image:          p.image,
  videoUrl:       p.videoUrl   || null,
  gallery:        p.gallery    || [],
  body:           p.body       || [],
  columnsContent: p.columnsContent || [],
})

export async function fetchPortfolios() {
  const projects = await client.fetch(QUERY)

  const branding = projects
    .filter(p => p.category === 'branding-print')
    .map(toItem)

  const interactive = projects
    .filter(p => p.category === 'immersive-ux')
    .map(toItem)

  return [branding, interactive]
}
