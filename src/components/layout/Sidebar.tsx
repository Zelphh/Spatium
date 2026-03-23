
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer, History, BarChart3, Home, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home, end: true },
  { path: '/timer', label: 'Timer', icon: Timer, end: true },
  { path: '/history', label: 'Histórico', icon: History, end: true },
  { path: '/stats', label: 'Estatísticas', icon: BarChart3, end: true },
  { path: '/settings', label: 'Configurações', icon: Settings, end: true },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-50 shadow-sm">
      {/* Logo */}
      <div className="p-6 pb-5">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Timer size={18} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground tracking-tight">Spatium</span>
            <p className="text-[10px] text-muted-foreground leading-tight">Gerencie seu tempo</p>
          </div>
        </motion.div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 pt-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        <div className="space-y-0.5">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink key={item.path} to={item.path}>
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-1 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={17} className="shrink-0" />
                  <span>{item.label}</span>
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </nav>

    </aside>
  );
}
