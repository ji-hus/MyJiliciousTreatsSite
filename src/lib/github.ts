import { MenuItem } from '@/data/types';

const REPO_OWNER = 'ji-hus';
const REPO_NAME = 'MyJiliciousTreatsSite';
const FILE_PATH = 'src/data/menu-items.ts';

interface GitHubFile {
  content: string;
  sha: string;
}

// Function to get the current content of menu-items.ts
export async function getMenuItemsFile(): Promise<GitHubFile> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  console.log('Getting menu items file with token:', token?.substring(0, 4) + '...');
  
  if (!token) {
    console.error('GitHub token not found in environment variables');
    throw new Error('GitHub token not found');
  }

  if (!token.startsWith('ghp_')) {
    console.error('Invalid GitHub token format');
    throw new Error('Invalid GitHub token format');
  }

  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch menu items file:', response.status, response.statusText);
    throw new Error(`Failed to fetch menu items file: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: atob(data.content),
    sha: data.sha,
  };
}

// Function to update menu-items.ts with new menu items
export async function updateMenuItemsFile(menuItems: MenuItem[]): Promise<void> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  console.log('Updating menu items file with token:', token?.substring(0, 4) + '...');
  
  if (!token) {
    console.error('GitHub token not found in environment variables');
    throw new Error('GitHub token not found');
  }

  if (!token.startsWith('ghp_')) {
    console.error('Invalid GitHub token format');
    throw new Error('Invalid GitHub token format');
  }

  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      // Get the current file content and SHA
      const { sha } = await getMenuItemsFile();

      // Create the new file content
      const fileContent = `// This file is auto-generated. Do not edit manually.
import { MenuItem } from './types';

export const menuItems: MenuItem[] = ${JSON.stringify(menuItems, null, 2)};
`;

      // Update the file on GitHub
      const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Update menu items',
            content: btoa(fileContent),
            sha,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to update menu items file:', response.status, response.statusText, errorData);
        
        if (response.status === 409) {
          // Conflict error - wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
          continue;
        }
        
        throw new Error(`Failed to update menu items file: ${response.status} ${response.statusText}`);
      }

      // Success - exit the retry loop
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error('Error updating menu items:', lastError);
      
      if (retries > 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      retries--;
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error('Failed to update menu items after multiple attempts');
}

// Function to check if we have a valid GitHub token
export function hasGitHubToken(): boolean {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  console.log('Checking GitHub token in hasGitHubToken:');
  console.log('- Token exists:', !!token);
  console.log('- Token length:', token?.length || 0);
  console.log('- Token prefix:', token?.substring(0, 4) || 'none');
  console.log('- Full token:', token);
  
  // Check if token exists and has the correct prefix
  const hasToken = !!token && token.startsWith('ghp_');
  console.log('- Token is valid:', hasToken);
  
  if (!hasToken) {
    console.error('Invalid GitHub token. Token must start with "ghp_"');
    console.error('Environment variables:', {
      VITE_GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN,
      NODE_ENV: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL
    });
  }
  
  return hasToken;
} 