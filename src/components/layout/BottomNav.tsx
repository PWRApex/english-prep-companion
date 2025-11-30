import { Home, Plus, BookOpen, FileText, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tracks', icon: BookOpen, label: 'Tracks' },
  { to: '/add', icon: Plus, label: 'Add', isCenter: true },
  { to: '/exams', icon: FileText, label: 'Exams' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-full transition-all duration-200',
                item.isCenter ? 'relative -mt-4' : '',
                isActive && !item.isCenter
                  ? 'text-primary'
                  : !item.isCenter
                  ? 'text-muted-foreground hover:text-foreground'
                  : ''
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.isCenter ? (
                  <div
                    className={cn(
                      'flex items-center justify-center w-14 h-14 rounded-full shadow-elevated transition-all duration-200',
                      isActive
                        ? 'gradient-hero scale-110'
                        : 'gradient-primary hover:scale-105'
                    )}
                  >
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                ) : (
                  <>
                    <item.icon
                      className={cn(
                        'w-5 h-5 mb-1 transition-transform duration-200',
                        isActive && 'scale-110'
                      )}
                    />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
