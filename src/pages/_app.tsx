import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Set the GitHub token from environment variable
    if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
      window.GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    }
  }, []);

  return <Component {...pageProps} />;
} 