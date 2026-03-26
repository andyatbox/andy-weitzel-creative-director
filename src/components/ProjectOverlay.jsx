import { useRef } from 'react'
import { PortableText } from '@portabletext/react'
import ContentOverlay from './ContentOverlay'

const getVimeoId = (url) => url?.match(/(?:vimeo\.com\/)(\d+)/)?.[1]

const ptComponents = {
  types: {
    image: ({ value }) => value.src ? (
      <figure className="my-8">
        <img src={value.src} alt={value.altText || ''} className="w-full" />
        {value.captionText && (
          <figcaption className="text-sm mt-2 text-white">{value.captionText}</figcaption>
        )}
      </figure>
    ) : null,
    code: ({ value }) => (
      <pre className="bg-white/10 rounded p-4 my-6 overflow-x-auto text-sm">
        <code>{value.code}</code>
      </pre>
    ),
  },
  block: {
    h2: ({ children }) => <h2 className="text-4xl mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-3xl mt-8 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-2xl mt-6 mb-2">{children}</h4>,
    normal: ({ children }) => <p className="text-2xl leading-relaxed mb-4">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-white pl-6 my-6 text-2xl italic">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value.href} className="underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
}

export default function ProjectOverlay({ open, project, onClose }) {
  // Cache last non-null project so content stays visible during close animation
  const cachedProject = useRef(null)
  if (project) cachedProject.current = project
  const p = cachedProject.current

  const vimeoId = getVimeoId(p?.videoUrl)

  return (
    <ContentOverlay open={open} onClose={onClose}>
      {p && (
        <div
          className={`text-white py-20 transition-all duration-700 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: open ? '150ms' : '0ms' }}
        >

          {/* Title */}
          <div className="max-w-7xl mx-auto px-6 mb-12">
            <h1 className="text-6xl md:text-8xl leading-none">{p.title}</h1>
          </div>

          {/* Vimeo embed */}
          {vimeoId && (
            <div className="max-w-7xl mx-auto px-6 mb-12">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}?color=ffffff&title=0&byline=0&portrait=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Gallery slider — full width */}
          {p.gallery?.length > 0 && (
            <div className="w-full mb-12">
              <div
                className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {p.gallery.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={img.alt || ''}
                    className="snap-start flex-none h-[60vh] object-cover"
                    style={{ maxWidth: '70vw' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          {p.body?.length > 0 && (
            <div className="max-w-4xl mx-auto px-6 mb-12">
              <PortableText value={p.body} components={ptComponents} />
            </div>
          )}

          {/* Columns content */}
          {p.columnsContent?.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 space-y-12">
              {p.columnsContent.map((group, i) => (
                <div
                  key={group._key || i}
                  className={`grid grid-cols-1 gap-8 ${
                    group.columns === '3' ? 'md:grid-cols-3' : 'md:grid-cols-2'
                  }`}
                >
                  <div><PortableText value={group.column1 || []} components={ptComponents} /></div>
                  <div><PortableText value={group.column2 || []} components={ptComponents} /></div>
                  {group.columns === '3' && (
                    <div><PortableText value={group.column3 || []} components={ptComponents} /></div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </ContentOverlay>
  )
}
