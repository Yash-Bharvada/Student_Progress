# Student Progress - Project Tracking & Performance System

A comprehensive project management and performance tracking system with GitHub integration, designed for academic institutions and training programs.

## 🎯 Features

### Core Features
- ✅ **Role-Based Access Control** - Student, Mentor, Admin roles
- ✅ **Project Management** - Create projects, assign teams, track progress
- ✅ **Task Tracking** - Kanban board with 4-column workflow
- ✅ **Mentor Feedback** - Review system with ratings
- ✅ **GitHub Integration** - Real-time repository and commit data
- ✅ **Analytics Dashboard** - Contribution charts and metrics
- ✅ **Admin Dashboard** - User and role management

### Advanced Features
- 🔄 **Real-time Data Sync** - Live GitHub activity tracking
- 📊 **Visual Analytics** - Charts, graphs, and heatmaps
- 🤖 **AI Code Analysis** - Powered by Google Gemini
- 🎨 **Modern UI** - Dark mode, responsive design
- 🔐 **Secure Authentication** - GitHub OAuth

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- GitHub App configured

### Installation

```bash
# Clone repository
git clone https://github.com/Yash-Bharvada/Student_Progress.git
cd Student_Progress

# Install dependencies
npm install

# Set up environment variables
cp .env.local.template .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
Student_Progress/
├── app/
│   ├── api/              # API endpoints
│   │   ├── projects/     # Project CRUD
│   │   ├── tasks/        # Task management
│   │   ├── feedback/     # Mentor feedback
│   │   ├── admin/        # Admin operations
│   │   └── ...
│   ├── projects/         # Projects UI
│   ├── tasks/            # Tasks Kanban
│   ├── admin/            # Admin dashboard
│   └── ...
├── lib/
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── Task.ts
│   │   ├── Milestone.ts
│   │   └── Feedback.ts
│   ├── auth.ts           # Authentication utilities
│   └── mongodb.ts        # Database connection
└── components/           # React components

```

## 🗄️ Database Schema

### Collections
- **users** - User profiles with roles
- **projects** - Project information
- **tasks** - Task assignments
- **milestones** - Project phases
- **feedback** - Mentor reviews

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for details.

## 🔌 API Endpoints

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks` - Update task status

### Feedback
- `GET /api/feedback` - Get feedback
- `POST /api/feedback` - Submit feedback

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]/role` - Update user role

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🎨 UI Pages

### Student View
- **Dashboard** - Overview of activity
- **Projects** - Assigned projects
- **Tasks** - Personal task board
- **Analytics** - Performance metrics
- **Repositories** - GitHub repos

### Mentor View
- All student features +
- **Create Projects** - Project setup
- **Assign Tasks** - Task delegation
- **Submit Feedback** - Student reviews

### Admin View
- All features +
- **User Management** - Role assignment
- **System Analytics** - Platform metrics

## 🔐 Authentication

Uses GitHub OAuth with GitHub App:

1. User clicks "Connect GitHub Account"
2. Redirects to GitHub authorization
3. GitHub App installed
4. User redirected back with installation ID
5. Session created with secure cookie

## 🎯 Role-Based Access

### Student
- View assigned projects
- Update own task status
- View received feedback
- Access analytics

### Mentor
- Create projects
- Assign tasks
- Submit feedback
- View team analytics

### Admin
- All mentor permissions
- Manage users
- Assign roles
- System administration

## 📊 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: GitHub OAuth
- **Charts**: Recharts
- **AI**: Google Gemini API

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 📝 Environment Variables

Required environment variables:

```env
MONGODB_URI=
GITHUB_APP_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_PRIVATE_KEY=
JWT_SECRET_KEY=
NEXT_PUBLIC_FRONTEND_URL=
GEMINI_API_KEY=
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run in development
npm run dev

# Build for production
npm run build
```

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Implementation Plan](./implementation_plan.md)
- [Walkthrough](./walkthrough.md)

## 🎓 Use Cases

### Academic Institutions
- Track student project progress
- Monitor team collaboration
- Provide structured feedback
- Evaluate performance

### Training Programs
- Manage bootcamp projects
- Track skill development
- Mentor-student communication
- Performance analytics

### Tech Organizations
- Onboard junior developers
- Track learning progress
- Code quality monitoring
- Team collaboration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer**: Yash Bharvada
- **Institution**: CHARUSAT
- **Event**: TechGenius Hackathon

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for beautiful UI components
- MongoDB for reliable database
- GitHub for API integration
- Google for Gemini AI

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: yash@example.com

---

**Built with ❤️ for TechGenius Hackathon**
