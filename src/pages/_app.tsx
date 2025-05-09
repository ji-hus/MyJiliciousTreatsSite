import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Debug: Log if we have the token
    console.log('Checking for GitHub token...');
    console.log('Token exists:', !!process.env.NEXT_PUBLIC_GITHUB_TOKEN);
    
    if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
      window.GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      console.log('GitHub token set successfully');
    } else {
      console.log('No GitHub token found in environment variables');
    }
  }, []);

  return <Component {...pageProps} />;
} 