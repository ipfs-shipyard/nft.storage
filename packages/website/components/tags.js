import clsx from 'clsx'
import Button from './button'

/**
 * Tag Component
 *
 * @param {Object} props
 * @param {import("./types").Tag | string} props.tag
 * @returns {JSX.Element}
 */
export const Tag = ({ tag }) => {
  const isString = typeof tag === 'string'
  const inner = (
    <span className={clsx('ph2 pv1 f6 ba ttc mr2', isString && 'select-none')}>
      {isString ? tag : tag.label}
    </span>
  )
  return isString ? (
    inner
  ) : (
    <div className="ma2">
      <Button
        onClick={tag.onClick}
        unstyled
        className={clsx(
          'ph2 pv1 f6 ba b--black ttc mr2 grow',
          tag.selected
            ? 'bg-black nspeach pointer-default'
            : 'black bg-transparent pointer'
        )}
      >
        {tag.label}
      </Button>
    </div>
  )
}

/**
 * Tags Component
 *
 * @param {Object} props
 * @param {import("./types").Tag[] | string[]} props.tags
 * @returns {JSX.Element}
 */
const Tags = ({ tags }) => (
  <div
    className={clsx(
      'blog-tags flex flex-wrap z-5',
      typeof tags[0] !== 'string' && 'blog-tags-buttons'
    )}
  >
    {tags.map((tag, index) => (
      <Tag tag={tag} key={`blog-tag-${tag}-${index}`} />
    ))}
  </div>
)

export default Tags
