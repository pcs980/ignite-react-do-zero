import styles from './banner.module.scss';

interface BannerProps {
  src: string;
  alt: string;
}

export default function Banner({ src, alt }: BannerProps): JSX.Element {
  return <img className={styles.banner} src={src} alt={alt} />;
}
