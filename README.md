# 📚 מנהל הספרים (Book Manager)

A personal book management application that helps you organize your library, track loans, and manage your literary collection.

![Book Manager Screenshot](https://your-screenshot-url-here.png)

## 🌟 Features

- **Complete Book Management**: Add, edit, delete, and categorize your books
- **Loan Tracking**: Keep track of who borrowed your books and when they're due
- **Author and Publisher Management**: Organize books by authors and publishers
- **Categories**: Create a custom categorization system with color coding
- **Search and Filter**: Find books quickly using various criteria
- **Statistics**: View your collection stats and identify trends
- **Import/Export**: Easily import and export your data using CSV files
- **Dark/Light Mode**: Choose your preferred color theme
- **RTL Support**: Full Hebrew language support with RTL layout
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🔧 Technology Stack

- **Frontend**: React (Vite + JSX)
- **UI Library**: Ant Design
- **State Management**: React Context API
- **Data Storage**: GitHub Gists (as a lightweight database)
- **Authentication**: GitHub Personal Access Token
- **Styling**: Styled Components
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A GitHub account
- A GitHub Personal Access Token with `gist` scope

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-username/book-manager.git
cd book-manager
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Create a GitHub Personal Access Token**

- Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
- Click "Generate new token"
- Give it a name (e.g., "Book Manager")
- Select the `gist` scope (this allows the app to create and manage Gists)
- Click "Generate token"
- **Important**: Copy the token immediately as you won't be able to see it again!

4. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Log in to the application**

- When the application starts, you'll be prompted to log in
- Paste your GitHub Personal Access Token
- The app will create a new Gist or use an existing one to store your data

## 💾 Data Storage

Book Manager uses GitHub Gists as a lightweight database to store your book collection. All data is stored in your personal GitHub account, ensuring privacy and data ownership.

### Data Structure

The app creates the following collections in your Gist:

- **books**: Your book collection with all details
- **authors**: Information about authors
- **categories**: Your custom category system
- **publishers**: Publisher information
- **loans**: Loan history and active loans
- **statistics**: Usage statistics

All data is stored in JSON format in separate files within the same Gist.

## 📊 Importing and Exporting Data

### Importing Books

You can import books from a CSV file. The CSV should have the following columns:

- `title` (required): The book title
- `author`: Author ID or name (if not found, a new author will be created)
- `publisher`: Publisher name
- `isbn`: ISBN number
- `publicationYear`: Year of publication
- `language`: Book language (defaults to Hebrew)
- `categories`: Comma-separated list of category names or IDs
- `pageCount`: Number of pages
- `description`: Book description
- `location`: Physical location of the book
- `acquisitionDate`: When you acquired the book (YYYY-MM-DD)
- `acquisitionMethod`: How you acquired the book (purchase, gift, etc.)
- `rating`: Your rating (1-5)
- `notes`: Any additional notes

### Exporting Data

You can export any collection (books, authors, loans, etc.) to a CSV file for backup or analysis.

## 🔐 Privacy and Security

- Your GitHub Personal Access Token is encrypted and stored in your browser's local storage
- Raw token never leaves your browser except when making API calls to GitHub
- All data is stored in your personal GitHub account
- The app runs entirely in the browser and doesn't use any external servers

## 🖼️ Screenshots

_Add some screenshots of your application here_

## 🛠️ Development

### Project Structure

```
book-manager/
├── src/
│   ├── components/        # UI components
│   ├── context/           # React context for state management
│   ├── pages/             # Main application pages
│   ├── services/          # API and utility services
│   ├── config/            # Configuration files
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Entry point
├── public/                # Static assets
└── ...configuration files
```

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` folder.

### Deployment to GitHub Pages

```bash
npm run deploy
# or
yarn deploy
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- [Ant Design](https://ant.design/) for the UI components
- [GitHub](https://github.com) for the Gist API
- [Vite](https://vitejs.dev/) for the fast development experience
- All the open-source libraries used in this project

---

Created with ❤️ for book lovers
