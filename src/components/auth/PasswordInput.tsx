import React, { useState } from 'react';
import styles from './PasswordInput.module.css';

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = (props: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Minimal Eye Icon (Arc + Circle)
  const EyeIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12c0-4.5 4-8 10-8s10 3.5 10 8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  // Minimal Eye Off Icon (Arc + Circle + Slash)
  const EyeOffIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12c0-4.5 4-8 10-8s10 3.5 10 8" />
      <circle cx="12" cy="12" r="3" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );

  return (
    <div className={styles.passwordWrapper}>
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        className={`${styles.input} ${props.className || ''}`}
      />
      <button
        type="button"
        className={styles.eyeButton}
        onClick={() => setIsVisible(!isVisible)}
        tabIndex={-1}
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;
