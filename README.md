# oceanography-website-demo

oceanography-website-demo is a [nextjs](https://nextjs.org/) app with some server-side-rendering. The content of the app is re-implementation of the static html website [LiveOcean](https://faculty.washington.edu/pmacc/LO/LiveOcean.html). the codebase began with the next.js template "Documents"(deployed at [rubix-documents.vercel.app](rubix-documents.vercel.app) by rubixvi. 


---

## Quick Start

### Installation

```bash
git clone https://github.com/xanderfehsenfeld/oceanography-website-demo
cd oceanography-website-demo
pnpm install
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your project locally.

**For production:**

```bash
pnpm run build
pnpm run start
```



## Overview

the Web app is built using the following:

* **Next.js** and **React** as the framework
* **Tailwind CSS** to manage styling
* **TypeScript**
* **d3.js** and **leaflet.js** to render geographic data visualizations.
* **remark-mdx** for handling markdown pages.

---

## Features

### Content Management

- MDX support (Markdown with React components)
- Reusable custom components
- Mermaid.js for diagrams and flowcharts
- Tables and LaTeX math support

### Navigation & Structure

- Multi-level navigation
- Auto-generated table of contents
- Content pagination

### Development Experience

- Syntax highlighting with theme support
- Enhanced code blocks with titles and line highlighting
- Built-in light/dark mode with auto-detection
- SEO-ready with dynamic meta tags

### Search & Future Enhancements

- Fuzzy search with term highlighting



---

## Usage

oceanography-website-demo is designed to support:

- Learning about computer-generated oceanography ocean models at University of Washington.
- Viewing the oceanographic characteristics of the Puget Sound and Salish Sea. 
- Maintaining a scientific knowledge base.

---



## Contributing

We welcome contributions to improve this project. 

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---
