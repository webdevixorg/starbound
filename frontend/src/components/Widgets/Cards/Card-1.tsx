import React from 'react';

interface Category {
  href: string;
  textColor: string;
  name: string;
}

interface Author {
  href: string;
  name: string;
  srcSet: string;
  src: string;
}

interface Post {
  href: string;
  srcSet: string;
  src: string;
  categories: Category[];
  title: string;
  description: string;
  author: Author;
  dateTime: string;
  date: string;
}

interface BlogPostCardProps {
  post: Post;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <div className="group cursor-pointer">
      <div className="overflow-hidden rounded-md bg-gray-100 transition-all hover:scale-105 dark:bg-gray-800">
        <a className="relative block aspect-video" href={post.href}>
          <img
            alt="Thumbnail"
            fetchPriority="high"
            decoding="async"
            className="object-cover transition-all"
            sizes="(max-width: 768px) 30vw, 33vw"
            srcSet={post.srcSet}
            src={post.src}
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              inset: '0px',
              color: 'transparent',
            }}
          />
        </a>
      </div>
      <div className="">
        <div>
          <div className="flex gap-3">
            {post.categories.map((category) => (
              <a key={category.href} href={category.href}>
                <span
                  className={`inline-block text-xs font-medium tracking-wider uppercase mt-5 ${category.textColor}`}
                >
                  {category.name}
                </span>
              </a>
            ))}
          </div>
          <h2 className="text-lg font-semibold leading-snug tracking-tight mt-2 dark:text-white">
            <a href={post.href}>
              <span className="bg-gradient-to-r from-green-200 to-green-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px] dark:from-purple-800 dark:to-purple-900">
                {post.title}
              </span>
            </a>
          </h2>
          <div className="hidden">
            <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
              <a href={post.href}>{post.description}</a>
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
            <a href={post.author.href}>
              <div className="flex items-center gap-3">
                <div className="relative h-5 w-5 flex-shrink-0">
                  <img
                    alt={post.author.name}
                    loading="lazy"
                    decoding="async"
                    className="rounded-full object-cover"
                    sizes="20px"
                    srcSet={post.author.srcSet}
                    src={post.author.src}
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      inset: '0px',
                      color: 'transparent',
                    }}
                  />
                </div>
                <span className="truncate text-sm">{post.author.name}</span>
              </div>
            </a>
            <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
            <time className="truncate text-sm" dateTime={post.dateTime}>
              {post.date}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
