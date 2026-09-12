import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

/**
 * כפתור משותף לכל האפליקציה.
 * וריאנטים: primary (טורקיז), success ("התחל"), danger ("סיים משחק"), ghost (ביטול).
 * מקור: spec/DESIGN.md — Style Guide.
 */
export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
