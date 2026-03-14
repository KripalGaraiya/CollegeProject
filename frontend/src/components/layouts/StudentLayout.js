import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  CreditCard, 
  FileText,
  Bell,
  LogOut,
  GraduationCap,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StudentLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/student/fees', icon: CreditCard, label: 'Fees' },
    { path: '/student/results', icon: FileText, label: 'Results' },
    { path: '/student/notices', icon: Bell, label: 'Notices' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-100 fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-secondary text-sm">B.G. Garaiya</h1>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-accent font-semibold">
                {user?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            data-testid="logout-button"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white animate-slideIn">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <span className="font-heading font-bold text-sm">Student Portal</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl lg:text-2xl font-heading font-bold text-gray-900">
                {title}
              </h1>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
