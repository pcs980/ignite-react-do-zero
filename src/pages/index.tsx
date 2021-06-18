import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import Info from '../components/Info';
import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../shared/dates';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function parseResult(result: any[]): Post[] {
  return result.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      ...post.data,
    },
  }));
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMorePosts = (): void => {
    setLoadingMore(true);
    fetch(nextPage)
      .then(result => result.json())
      .then(response => {
        setPosts([...posts, ...parseResult(response.results)]);
        setNextPage(response.next_page);
        setLoadingMore(false);
      })
      .catch(error => {
        setLoadingMore(false);
        alert(`Error fetching more posts: ${error.message}`);
      });
  };

  return (
    <>
      <Head>
        <title>spacetraveling : home</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts?.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <Info
                    image="calendar"
                    text={formatDate(post.first_publication_date)}
                  />
                  <Info image="user" text={post.data.author} />
                </div>
              </a>
            </Link>
          ))}
          {!!nextPage && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={handleLoadMorePosts}
            >
              {loadingMore ? 'Carregando...' : 'Carregar mais posts'}
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const posts: Post[] = parseResult(postsResponse.results);

  return {
    revalidate: 60 * 60, // 1 hora
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
  };
};

/*
  Utilizar o método query para retornar todos os posts já com paginação.
  Por padrão, a paginação vem configurada como 20.
  Portanto se quiser testar sem ter que criar mais de 20 posts, altere a opção pageSize para o valor que deseja.
*/
