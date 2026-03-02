import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer, History, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Timer', icon: Timer },
  { path: '/history', label: 'Histórico', icon: History },
  { path: '/stats', label: 'Estatísticas', icon: BarChart3 },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-card border-t md:border-t-0 md:border-b border-border z-50">
      <div className="flex items-center justify-center gap-2 px-4 py-3 md:py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative"
            >
              <motion.div
                className={`
                  flex flex-col md:flex-row items-center gap-1 md:gap-2 px-5 py-2 rounded-lg
                  transition-colors duration-200
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-accent rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="text-xs md:text-sm font-medium relative z-10">
                  {item.label}
                </span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
