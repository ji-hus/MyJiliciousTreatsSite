import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchMenuItems() {
  try {
    // GitHub API endpoint for the menu-items.ts file
    const response = await fetch(
      'https://api.github.com/repos/ji-hus/MyJiliciousTreatsSite/contents/src/data/menu-items.ts',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString();

    // Extract the menuItems array from the TypeScript file content
    const match = content.match(/export const menuItems: MenuItem\[\] = (\[[\s\S]*?\]);/);
    if (!match) {
      throw new Error('Could not find menuItems array in the file content');
    }

    const menuItemsStr = match[1];
    const menuItems = JSON.parse(menuItemsStr);

    // Save to menu-items.ts
    const filePath = path.join(process.cwd(), 'src', 'data', 'menu-items.ts');
    const outputContent = `// This file is auto-generated. Do not edit directly.
import { MenuItem } from './types';

export const menuItems: MenuItem[] = ${JSON.stringify(menuItems, null, 2)};
`;

    fs.writeFileSync(filePath, outputContent);
    console.log('Successfully fetched and saved menu items from GitHub!');
  } catch (error) {
    console.error('Error fetching menu items:', error);
  }
}

fetchMenuItems(); 