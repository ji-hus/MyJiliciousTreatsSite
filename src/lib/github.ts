import { MenuItem } from '@/data/menu-items';

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const REPO_OWNER = 'ji-hus';
const REPO_NAME = 'MyJiliciousTreatsSite';
const FILE_PATH = 'src/data/menu-items.ts';

interface GitHubFile {
  content: string;
  sha: string;
}

// Function to get the current content of menu-items.ts
export async function getMenuItemsFile(): Promise<GitHubFile> {
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch menu items file');
  }

  const data = await response.json();
  return {
    content: atob(data.content),
    sha: data.sha,
  };
}

// Function to update menu-items.ts with new menu items
export async function updateMenuItemsFile(menuItems: MenuItem[]): Promise<void> {
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
        Authorization: `token ${GITHUB_TOKEN}`,
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
    throw new Error('Failed to update menu items file');
  }
}

// Function to check if we have a valid GitHub token
export function hasGitHubToken(): boolean {
  return !!GITHUB_TOKEN;
} 