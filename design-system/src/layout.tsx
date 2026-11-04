import * as React from 'react';
import { usePopover } from './controls';
import { Logout, User } from './icons';

/* TopBar */
export interface TopBarProps {
  children?: React.ReactNode;
}
export function TopBar({ children }: TopBarProps) {
  return (
    <header className="ra-top">
      <span className="ra-logo">
        <i className="ra-logo-mark" aria-hidden="true" />
        <span className="ra-top-name">Решись Авиа</span>
      </span>
      <div className="ra-top-end">{children}</div>
    </header>
  );
}

/* ProfileMenu */
export interface ProfileUser {
  firstName: string;
  lastName: string;
}
export interface ProfileMenuProps {
  user: ProfileUser;
  onLogout?: () => void;
  defaultOpen?: boolean;
}
export function ProfileMenu({ user, onLogout, defaultOpen }: ProfileMenuProps) {
  const pop = usePopover(defaultOpen);
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  return (
    <div className="ra-profile" ref={pop.root}>
      <button ref={pop.trigger} type="button" className="ra-top-btn ra-top-btn-icon ra-profile-btn" aria-expanded={pop.open} aria-haspopup="dialog" onClick={() => pop.setOpen(!pop.open)}>
        <User />
        <span>Профиль</span>
      </button>
      {pop.open && (
        <div className="ra-pop ra-profile-pop" role="dialog" aria-label="Профиль">
          <div className="ra-profile-who">
            <span className="ra-avatar" aria-hidden="true">{initials}</span>
            <p className="ra-profile-name">{user.firstName} {user.lastName}</p>
          </div>
          <button type="button" className="ra-logout" onClick={() => { pop.close(); onLogout?.(); }}>
            <Logout />
            <span>Выйти</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* Card */
export interface CardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}
export function Card({ title, children, className }: CardProps) {
  return (
    <section className={['ra-card', className].filter(Boolean).join(' ')}>
      {title && <h2 className="ra-card-title">{title}</h2>}
      {children}
    </section>
  );
}
