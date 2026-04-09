import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const CyberInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono tracking-widest text-base-content/50 uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`input w-full bg-base-300 border-base-300 focus:border-primary
            text-base-content placeholder:text-base-content/25 font-mono
            ${icon ? 'pl-10' : ''} ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-error text-xs font-mono">{error}</p>}
    </div>
  ),
);
CyberInput.displayName = 'CyberInput';
