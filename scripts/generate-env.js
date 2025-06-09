import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));

// Create .env file content
const envContent = `
VITE_APP_TITLE=${packageJson.title}
VITE_APP_VERSION=${packageJson.version}
VITE_APP_AUTHOR=${packageJson.author}
VITE_APP_REPOSITORY=${packageJson.repository.url}
`;

// Write to .env file
fs.writeFileSync(path.resolve(__dirname, '../.env'), envContent.trim());

console.log('Environment variables generated successfully!'); 