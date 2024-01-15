// SharedForm.tsx
import * as React from 'react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SharedFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  linkText: string;
  to: string;
  buttonText: string; // New prop for button text
  linkButtonText: string;
  children: ReactNode;
}

const SharedForm: React.FC<SharedFormProps> = ({ title, onSubmit ,  linkText, to, buttonText,linkButtonText, children }) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">{title}</h2>
          <form onSubmit={onSubmit}>
            {children}
            <button type="submit" className="btn btn-primary">{buttonText}</button>
            <div className="mt-3">
              <p>
                {linkText} <Link to={to}>{linkButtonText}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SharedForm;
