import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  CreditCard, 
  Settings, 
  Store,
  MessageCircle,
  BarChart3,
  Receipt,
  HelpCircle,
  LogOut,
  Workflow 
} from 'lucide-react';

const Sidebar = () => {
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Pipelines', icon: Workflow, path: '/pipelines' },
    { name: 'Leads', icon: UserPlus, path: '/leads' },
    { name: 'Budgets', icon: FileText, path: '/budgets' },
    { name: 'Documents', icon: Store, path: '/documents' },
    { name: 'Invoices', icon: Receipt, path: '/invoices' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
    { name: 'Statistics', icon: BarChart3, path: '/statistics' },
    { name: 'Finances', icon: CreditCard, path: '/finances' },
  ];

  const supportItems = [
    { name: 'Help & Center', icon: HelpCircle, path: '/help' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BB</span>
          </div>
          <span className="text-sidebar-textActive font-semibold">BROTHERS BROKERAGE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="px-4 mb-6">
          <p className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">
            Dashboard
          </p>
        </div>
        
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  sidebar-item ${isActive ? 'active' : ''}
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Support Section */}
        <div className="px-4 mb-4 mt-8">
          <p className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">
            Help & Support
          </p>
        </div>
        
        <ul className="space-y-1">
          {supportItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  sidebar-item ${isActive ? 'active' : ''}
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button className="sidebar-item w-full justify-start">
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 