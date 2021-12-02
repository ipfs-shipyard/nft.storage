import Button from '../button'
import Link from 'next/link'
import React from 'react'
import Tags from '../tags'
import countly from '../../lib/countly'

// custom styles from /styles/blog.css

/**
 * Blog Card Component
 *
 * @param {Object} props
 * @param {import('../types').PostMeta} props.post
 * @param {() => void} props.onClick
 * @returns {JSX.Element}
 */

export const Card = ({ post, onClick }) => (
  <Link href={`/blog/post/${post.slug}`}>
    {/* 👇 because next/link won't accept onClick */}
    <a
      onClick={onClick}
      className="bg-white blog-card h-card w-card hologram card right interactive"
    >
      <img
        src={post.thumbnail}
        alt={`Banner for ${post.title}`}
        className="object-cover object-center w-100"
        style={{ height: '50%' }}
      />
      <div className="flex pa5 flex-column justify-evenly">
        <div className="mb4">{post.tags && <Tags tags={post.tags} />}</div>
        <div className="overflow-hidden mb2">
          <h1 className="chicagoflf f3 line-clamp-1" title={post.title}>
            {post.title}
          </h1>
        </div>
        <p className="line-clamp-2 mb2 f5" title={post.description}>
          {post.description}
        </p>
        <div className="flex">
          <span className="darker-gray f6 mr2">{post.author}</span>
          <span className="darker-gray f6">{post.date}</span>
        </div>
      </div>
    </a>
  </Link>
)

/**
 * Blog Highlighted Card Component
 *
 * @param {Object} props
 * @param {import('../types').PostMeta} props.post
 * @param {() => void} props.onClick
 * @returns {JSX.Element}
 */
export const HighlightCard = ({ post, onClick }) => (
  <div className="flex justify-center blog-highlight-card h-card w-100">
    <div className="relative flex w-100 mw9">
      <div className="flex justify-between highlight-info flex-column w-50">
        <div className="highlight-card-text">
          <div className="mb4">{post.tags && <Tags tags={post.tags} />}</div>
          <h1 className="chicagoflf f1 title" title={post.title}>
            {post.title}
          </h1>
          <p className="mw6 f3 mb2 description" title={post.description}>
            {post.description}
          </p>
          <div className="flex">
            <span className="darker-gray f6 mr2">{post.author}</span>
            <span className="darker-gray f6">{post.date}</span>
          </div>
        </div>
        <div className="flex highlight-card-buttons">
          <Button
            href={{
              pathname: `/blog/post/${post.slug}`,
            }}
            unstyled
            className="bg-white mw4 pv3 ph3 interactive hologram chicagoflf cta"
            id="read-more"
            onClick={onClick}
          >
            Read More
          </Button>
          <Button
            href={{
              pathname: '/blog/subscribe',
            }}
            unstyled
            className="bg-white mw4 ml4 pv3 ph3 interactive hologram chicagoflf cta"
            id="card-subscribe"
            tracking={{
              ui: countly.ui.BLOG_CARD,
              action: 'Subcribe',
            }}
          >
            Subscribe
          </Button>
        </div>
      </div>
      <img
        src={post.thumbnail}
        alt={`Banner for ${post.title}`}
        className="object-cover object-center h-card highlight-img w-50"
      />
    </div>
  </div>
)
