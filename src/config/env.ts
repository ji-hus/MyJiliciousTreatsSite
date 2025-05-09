// Environment variables configuration
export const config = {
  githubToken: import.meta.env.VITE_GITHUB_TOKEN || '',
  isGitHubEnabled: !!import.meta.env.VITE_GITHUB_TOKEN
}; 