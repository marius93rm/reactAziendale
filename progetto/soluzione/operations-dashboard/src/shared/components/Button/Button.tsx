/**
 * Button standardizza aspetto e semantica, lasciando l'evento al chiamante.
 * Estende gli attributi HTML nativi: disabled, aria-*, onClick e gli altri
 * attributi mantengono tipi e comportamento del button del browser.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function Button({
  icon,
  variant = 'primary',
  children,
  className,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  // Le props native entrano per prime. Class, variant e type conservano le
  // regole dichiarate dal componente condiviso.
  return (
    <button
      {...buttonProps}
      className={['button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      type={type}
    >
      {icon}
      {children}
    </button>
  );
}
