import * as React from 'react';

const base = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
};
type P = React.SVGProps<SVGSVGElement>;

export const Check = (p: P) => <svg {...base} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const Alert = (p: P) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>;
export const Chevron = (p: P) => <svg {...base} {...p}><path d="M6 9.5l6 6 6-6" /></svg>;
export const Calendar = (p: P) => <svg {...base} {...p}><rect x="4" y="5.5" width="16" height="15" rx="3" /><path d="M4 10.5h16M8.5 3.5v4M15.5 3.5v4" /></svg>;
export const Logout = (p: P) => <svg {...base} {...p}><path d="M10 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3M15.5 8l4 4-4 4M19 12H9.5" /></svg>;
export const User = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <circle cx="12" cy="7.5" r="4.5" />
    <path d="M4 20.2C4 16.4 7.6 14 12 14s8 2.4 8 6.2c0 .7-.6 1.3-1.3 1.3H5.3c-.7 0-1.3-.6-1.3-1.3z" />
  </svg>
);
const solid = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true };
export const Help = (p: P) => (
  <svg {...solid} {...p}><path fillRule="evenodd" d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm-.1 13.7a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zM12 6.2c2.2 0 3.9 1.4 3.9 3.4 0 1.5-.8 2.4-2 3.1-.8.5-1 .8-1 1.3v.3h-2v-.5c0-1.3.6-2 1.7-2.7.9-.5 1.3-.9 1.3-1.5 0-.8-.8-1.4-1.9-1.4-1.1 0-1.9.6-2 1.6H8c.1-2.1 1.8-3.6 4-3.6z" /></svg>
);
export const Bars = (p: P) => (
  <svg {...solid} {...p}><rect x="3" y="12" width="5" height="9" rx="1.6" /><rect x="9.5" y="7.5" width="5" height="13.5" rx="1.6" /><rect x="16" y="3" width="5" height="18" rx="1.6" /></svg>
);
export const Pin = (p: P) => (
  <svg {...solid} {...p}><path fillRule="evenodd" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.2 5.9 11.1 6.7 11.9.4.4 1.2.4 1.6 0 .8-.8 6.7-6.7 6.7-11.9A7.5 7.5 0 0 0 12 2zm0 10.2a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z" /></svg>
);
export const Login = (p: P) => (
  <svg {...solid} {...p}><path d="M13 3h5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5a1 1 0 1 1 0-2h5a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-5a1 1 0 1 1 0-2z" /><path d="M10.7 7.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4L13 13H4a1 1 0 1 1 0-2h9l-2.3-2.3a1 1 0 0 1 0-1.4z" /></svg>
);
export const Plane = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M21 12c0-.9-.8-1.5-1.7-1.5h-4.6L9.9 3.3C9.7 3 9.4 3 9.1 3H7.9c-.3 0-.5.3-.4.6l2.2 6.9H5.6L4 8.6c-.1-.1-.3-.2-.4-.2h-.9c-.3 0-.5.3-.4.6l.9 3-.9 3c-.1.3.1.6.4.6h.9c.2 0 .3-.1.4-.2l1.6-1.9h4.1l-2.2 6.9c-.1.3.1.6.4.6h1.2c.3 0 .6 0 .8-.3l4.8-7.2h4.6c.9 0 1.7-.6 1.7-1.5z" />
  </svg>
);
