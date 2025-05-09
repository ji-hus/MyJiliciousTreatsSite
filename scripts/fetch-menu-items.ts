import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function fetchMenuItems() {
  try {
    // GitHub API endpoint for the menu-items.json file
    const response = await fetch(
      'https://api.github.com/repos/sanjidahhussain/crumb-and-connect/contents/src/data/menu-items.json',
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
    const menuItems = JSON.parse(content);

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