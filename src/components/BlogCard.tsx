import { Link } from 'react-router-dom'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import type { BlogPost } from '../data/blog'
import { unsplash, unsplashSrcSet } from '../lib/images'
import { formatDate } from '../lib/format'


/** Card used in the blog index and category pages. */
export default function BlogCard({ post, headingLevel = 'h3' }: { post: BlogPost; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <article className="card card-hover flex flex-col overflow-hidden h-full">
      <Link to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true" className="block relative aspect-[16/10] overflow-hidden bg-ink">
        <img
          src={unsplash(post.featured_image, { w: 640, q: 65 })}
          srcSet={unsplashSrcSet(post.featured_image, [480, 640, 960], 65)}
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          alt=""
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <Link to={`/blog/category/${post.category_slug}`} className="font-bold uppercase tracking-[0.08em] text-accent-text hover:underline underline-offset-2">
            {post.category}
          </Link>
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" aria-hidden="true" /> {post.reading_time}
          </span>
        </div>
        <Heading className="mt-3 text-lg font-bold text-ink leading-snug">
          <Link to={`/blog/${post.slug}`} className="hover:text-accent-text transition-colors duration-fast">{post.title}</Link>
        </Heading>
        <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
        <p className="mt-4 pt-4 border-t border-line text-xs text-muted">By {post.author}</p>
      </div>
    </article>
  )
}
