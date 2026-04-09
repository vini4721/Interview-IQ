# InterviewIQ - Technical Interview Platform

A modern, full-featured technical interview platform where candidates can practice coding problems, conduct live interviews with video calls, and get real-time feedback across multiple programming languages.

## ✨ Features

- **Problem Practice**: 6+ curated coding problems with difficulty levels and categories
- **Multi-Language Support**: Write and execute code in JavaScript, Python, and Java
- **Live Interview Sessions**: Real-time video calls and code collaboration using Stream.io
- **Auto-Test Injection**: Automatically injects test cases when users submit function-only code
- **Live Code Sync**: Real-time code synchronization between interviewer and candidate
- **Smart Problem Search**: Find problems by title, category, or difficulty
- **Fetch from LeetCode**: Import problems directly from LeetCode
- **Test Case Viewer**: Visual display of test results with pass/fail status
- **Session Management**: Host and participant roles with session history
- **Dark Theme UI**: Modern, distraction-free interface with Tailwind CSS

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS + DaisyUI** - Styling
- **Vite** - Build tool
- **Monaco Editor** - Code editor with syntax highlighting
- **Stream.io Video SDK** - Real-time video calls
- **Clerk** - Authentication
- **React Hot Toast** - Notifications

### Backend
- **Node.js + Express.js** - Server framework
- **Child Process (spawn)** - Code execution
- **Stream Chat SDK** - Message synchronization
- **Clerk API** - User authentication

### Database & Services
- **localStorage** - Frontend problem storage
- **Stream.io** - Video, chat, and real-time sync

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- Clerk account (free tier works)
- Stream.io account (free tier works)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd InterviewIQ

# Install backend dependencies
cd Backend && npm install

# Install frontend dependencies
cd ../Frontend && npm install
```

### 2. Environment Setup

Create `.env` files:

**Backend/.env**
```
CLERK_SECRET_KEY=your_clerk_secret_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
PORT=4000
```

**Frontend/.env.local**
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STREAM_API_KEY=your_stream_api_key
```

### 3. Start Services

**Terminal 1 - Backend (port 4000)**
```bash
cd Backend
npm start
```

**Terminal 2 - Frontend (port 5173)**
```bash
cd Frontend
npm run dev -- --host
```

Open browser: `http://localhost:5173`

## 📖 Project Structure

```
InterviewIQ/
├── Backend/
│   ├── src/
│   │   ├── controllers/          # Business logic
│   │   │   ├── executeController.js    # Code execution (JS, Python, Java)
│   │   │   ├── leetcodeController.js   # LeetCode API integration
│   │   │   ├── sessionController.js    # Interview sessions
│   │   ├── models/               # Data models
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Auth, validation
│   │   └── server.js             # Express app setup
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── CodeEditorPanel.jsx
│   │   │   ├── TestCaseViewer.jsx
│   │   │   ├── VideoCallUI.jsx
│   │   │   └── FetchLeetCodeModal.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProblemPage.jsx
│   │   │   ├── SessionPage.jsx
│   │   │   └── HomePage.jsx
│   │   ├── data/
│   │   │   └── problems.js       # Problem definitions with test cases
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utilities & services
│   │   │   ├── piston.js         # Backend API client
│   │   │   ├── axios.js          # HTTP client
│   │   │   └── utils.js          # Helper functions
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

## 🎯 Core Features Explained

### Code Execution
The platform supports real-time code execution with proper error handling:
- **JavaScript**: Executed via Node.js
- **Python**: Executed via Python 3
- **Java**: Compiled and executed with automatic class detection

```bash
# Execution happens in temporary files with 5-second timeout
/tmp/code-{timestamp}.js|.py|.java
```

### Auto-Test Injection
When users submit only function code (no test invocations):
1. System detects missing `console.log()`, `print()`, or `System.out.println()`
2. Automatically appends testCode from problem definition
3. Executes combined code
4. Parses output and displays results

Example:
```javascript
// User submits:
function mySqrt(x) {
  return Math.floor(Math.sqrt(x));
}

// System injects:
console.log(mySqrt(4));   // 2
console.log(mySqrt(8));   // 2
console.log(mySqrt(0));   // 0
```

### Test Case Comparison
Output is normalized across languages:
- `[0,1]` ≈ `[0, 1]` ≈ `[0 , 1]` (all normalized to `[0,1]`)
- `True` vs `true` handled correctly
- Trailing whitespace ignored

### Interview Sessions
- **Host** creates a session with a problem
- **Participant** joins via share link
- **Real-time sync**: Code, language, problem changes sync instantly
- **Video call**: Stream.io integration for face-to-face interviews
- **Chat**: Session-scoped messaging between participants

## 🔐 Authentication

Uses Clerk for secure authentication:
- Sign up / Sign in
- Social login support
- User context available throughout app
- Protected routes for interviews

## 🧪 Testing a Problem

1. **Go to Dashboard** → **Problems** tab
2. **Search** for a problem (e.g., "Sqrt(x)")
3. **Click** to open in editor
4. **Select language** (JavaScript/Python/Java)
5. **Write just the function** (no test calls needed)
6. **Click "Run Code"** → Auto-injects tests
7. **See results** in Test Case Viewer

Example - Sqrt(x):
```python
def mySqrt(x):
    left, right = 0, x
    while left <= right:
        mid = (left + right) // 2
        if mid * mid == x:
            return mid
        elif mid * mid < x:
            left = mid + 1
        else:
            right = mid - 1
    return right

# Auto-injected tests will run and show pass/fail
```

## 📊 Included Problems

1. **Two Sum** (Easy) - Array, Hash Table
2. **Reverse String** (Easy) - String, Two Pointers
3. **Valid Palindrome** (Easy) - String, Two Pointers
4. **Maximum Subarray** (Medium) - Array, Dynamic Programming
5. **Container With Most Water** (Medium) - Array, Two Pointers
6. **Sqrt(x)** (Easy) - Math, Binary Search

Each problem includes:
- Problem description
- Multiple examples with explanations
- Constraints
- Starter code templates (JS, Python, Java)
- Expected test outputs
- Auto-injectable test cases

## 🔗 API Endpoints

### Code Execution
- `POST /api/execute` - Execute code
  - Body: `{ language, code }`
  - Response: `{ success, output, error }`

### Sessions
- `POST /api/sessions/create` - Create interview session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/join` - Join session
- `POST /api/sessions/:id/end` - End session
- `POST /api/sessions/:id/question` - Update problem

### LeetCode
- `GET /api/leetcode/question/:slug` - Fetch problem from LeetCode

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Adding New Problems

Edit `Frontend/src/data/problems.js`:

```javascript
"new-problem": {
  id: "new-problem",
  title: "Problem Title",
  difficulty: "Easy|Medium|Hard",
  category: "Category • Category",
  description: {
    text: "Problem description...",
    notes: ["Note 1", "Note 2"],
  },
  examples: [
    { input: "input string", output: "output", explanation: "why" },
  ],
  constraints: ["Constraint 1", "Constraint 2"],
  starterCode: {
    javascript: "function solve() { ... }",
    python: "def solve(): ...",
    java: "class Solution { ... }",
  },
  expectedOutput: {
    javascript: "expected\noutput",
    python: "expected\noutput",
    java: "expected\noutput",
  },
  testCode: {
    javascript: "console.log(solve(...));",
    python: "print(solve(...))",
    java: "System.out.println(solve(...));",
  },
}
```

## 🐛 Troubleshooting

### Code not executing
- Ensure backend is running on port 4000
- Check that Python3 and Node.js are installed
- For Java, ensure javac is in PATH

### Video call not connecting
- Verify Stream.io credentials in .env
- Check browser permissions for camera/microphone
- Clear browser cache and reload

### Tests showing "No output"
- Ensure code doesn't have syntax errors
- Check that testCode is defined in problem
- Hard refresh browser (Cmd+Shift+R)

### Server crashed
```bash
# Kill any hanging processes
pkill -f "node src/server.js"
pkill -f python3

# Restart
cd Backend && npm start
```

## 🚀 Deployment

### Deploy Frontend (Vercel)
```bash
npm run build
# Push to GitHub, connect to Vercel
```

### Deploy Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy server.js
```

## 📄 License

MIT

## 👨‍💻 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🤝 Support

For issues or questions:
- Create a GitHub issue
- Check existing documentation
- Review problem examples

## 🎓 Learning Resources

- [Clerk Docs](https://clerk.com/docs)
- [Stream.io Docs](https://getstream.io/docs/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [React Documentation](https://react.dev)

---

**InterviewIQ** - Master coding interviews, one problem at a time. 🚀
