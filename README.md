# OneTab2Markdown

Convert OneTab exported text into organized Markdown format, grouped or sorted by domain.

**[Live Demo](https://sandbox.saino.me/onetab2markdown/)**

## Features

- Convert OneTab format text to Markdown links
- Three conversion modes:
  - **As-is**: Convert in original order
  - **Sort by domain**: Alphabetically sort by domain
  - **Group by domain**: Group with headers by domain
- Browser-based (no data stored)
- Multi-language support (Japanese/English)
- One-click copy to clipboard

## Usage

1. Open OneTab and click "Import / Export URLs"
2. Click "Export all windows and tabs"
3. Paste the copied text into the left textarea
4. Select conversion mode (as-is / sort / group)
5. Click "Convert" button
6. Copy the generated Markdown from the right textarea

### Example Input (OneTab format)

```
https://github.com/user/repo | GitHub Repository
https://qiita.com/items/abc | Qiita Article
https://zenn.dev/articles/123 | Zenn Article
```

### Example Output (Group by domain mode)

```markdown
# github.com - 1 URLs

- [GitHub Repository](https://github.com/user/repo)

# qiita.com - 1 URLs

- [Qiita Article](https://qiita.com/items/abc)

# zenn.dev - 1 URLs

- [Zenn Article](https://zenn.dev/articles/123)
```

## Development

### Dev Container (Recommended)

This project includes a Dev Container configuration. If you have VS Code and Docker installed:

1. Clone the repository
2. Open the folder in VS Code
3. Click "Reopen in Container"

The Dev Container includes:

- Node.js LTS
- Required VS Code extensions
- Automatic dependency installation

### Local Development

#### Requirements

- Node.js 20+
- Yarn

#### Setup

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Development server runs at http://localhost:3000

#### Build

```bash
yarn build
```

Built files are output to the `dist` directory.

#### Linting

```bash
yarn lint
```

## Docker Deployment

### Using Docker Compose

```bash
# Build and start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Application will be accessible at http://localhost:8080

### Using Docker directly

```bash
# Build image
docker build -t onetab2markdown .

# Run container
docker run -d -p 8080:80 --name onetab2markdown onetab2markdown
```

## SEO Features

- Comprehensive meta tags (OGP, Twitter Card)
- Structured data (JSON-LD Schema.org)
- Static content for crawlers
- Multi-language support (hreflang)
- robots.txt and sitemap.xml

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **psl** - Public Suffix List for accurate domain extraction
- **react-i18next** - Internationalization (Japanese/English)
- **Yarn** - Package manager
- **Docker** + **Nginx** - Production deployment

## License

MIT
