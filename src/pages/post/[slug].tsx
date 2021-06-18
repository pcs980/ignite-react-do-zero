/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiLoader } from 'react-icons/fi';

import Banner from '../../components/Banner';
import Info from '../../components/Info';
import { getPrismicClient } from '../../services/prismic';
import { formatDate } from '../../shared/dates';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        <main className={styles.loading}>
          <FiLoader />
          <span>Carregando...</span>
        </main>
      </>
    );
  }

  const averageWordsPerMinute = Number(
    process.env.AVERAGE_WORDS_PER_MINUTE ?? 200
  );
  const postWords = post.data.content.reduce(
    (acc, c) =>
      acc +
      c.heading.split(' ').length +
      RichText.asText(c.body).split(' ').length,
    0
  );
  const timeReading = Math.ceil(postWords / averageWordsPerMinute);

  return (
    <>
      <Head>
        <title>spacetraveling : {post.data.title}</title>
      </Head>
      <main className={commonStyles.container}>
        <Banner src={post.data.banner.url} alt="post banner" />
        <div className={styles.postContainer}>
          <p className={styles.postTitle}>{post.data.title}</p>
          <div className={styles.infos}>
            <Info
              image="calendar"
              text={formatDate(post.first_publication_date)}
            />
            <Info image="user" text={post.data.author} />
            <Info image="clock" text={`${timeReading} min`} />
          </div>
          {post.data.content.map(content => (
            <div key={content.heading} className={styles.postContent}>
              <p className={styles.contentHeading}>{content.heading}</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 1 }
  );
  const paths = posts.results.map(p => ({ params: { slug: p.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug as string, {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 6, // 6 horas
  };
};

// Utilizar o método query para buscar todos os posts e o getByUID para buscar as informações do post específico.

/*

{
  "id": "YMqJ0xMAACEAjxIZ",
  "uid": "setting-up-testing-library-with-nextjs",
  "url": null,
  "type": "posts",
  "href": "https://posts-challenge.cdn.prismic.io/api/v2/documents/search?ref=YMqJ1xMAACEAjxIu&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22YMqJ0xMAACEAjxIZ%22%29+%5D%5D",
  "tags": [],
  "first_publication_date": "2021-06-16T23:31:35+0000",
  "last_publication_date": "2021-06-16T23:31:35+0000",
  "slugs": [
    "setting-up-testing-library-with-nextjs"
  ],
  "linked_documents": [],
  "lang": "pt-br",
  "alternate_languages": [],
  "data": {
    "title": "Setting Up Testing Library with NextJS",
    "subtitle": "Getting setup with Jest and React Testing Library",
    "author": "Malcolm L",
    "banner": {
      "dimensions": {
        "width": 672,
        "height": 488
      },
      "alt": null,
      "copyright": null,
      "url": "https://images.prismic.io/posts-challenge/93a1d5ab-28a8-406e-b0f1-62a95246b5db_CDHwCrFx13gTBzm3BkZ2WQ.png?auto=compress,format"
    },
    "content": [
      {
        "heading": "Writing our first test",
        "body": [
          {
            "type": "paragraph",
            "text": "Now that we have our test environment setup, it’s time to write our first test. Create a file called index.test.js file. Inside this file, we will test that when we
render our App, we can see the heading “Welcome to Next.JS”.",
            "spans": []
          }
        ]
      },
      {
        "heading": "Additional resources",
        "body": [
          {
            "type": "paragraph",
            "text": "Be sure to check out the documentation for testing-library.",
            "spans": [
              {
                "start": 43,
                "end": 58,
                "type": "hyperlink",
                "data": {
                  "link_type": "Web",
                  "url": "https://testing-library.com/"
                }
              }
            ]
          },
          {
            "type": "paragraph",
            "text": "If you would like to see this project in action, check it out on Github.",
            "spans": [
              {
                "start": 65,
                "end": 71,
                "type": "hyperlink",
                "data": {
                  "link_type": "Web",
                  "url": "https://github.com/montezume/create-next-app-testing"
                }
              }
            ]
          },
          {
            "type": "paragraph",
            "text": "And if you would like to learn more about how to test complex React projects, be sure to check out our previous article. In  this article, we test (from a user’s perspective) a basic CRUD  application. If you’re someone who struggles with testing asynchronous  code, we think it will help.",
            "spans": []
          }
        ]
      }
    ]
  }
}

*/
