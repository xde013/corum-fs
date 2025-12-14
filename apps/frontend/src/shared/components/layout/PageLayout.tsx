import { ReactNode } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  title?: string;
  subtitle?: string | ReactNode;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonTo?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
  className?: string;
}

export const PageLayout = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonText = 'Back to Dashboard',
  backButtonTo = '/dashboard',
  children,
  maxWidth = '4xl',
  className = '',
}: PageLayoutProps) => {
  const navigate = useNavigate();
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl',
  };

  return (
    <div className={`bg-gray-50 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {(showBackButton || title) && (
          <div className="mb-6">
            {showBackButton && (
              <Button
                variant="secondary"
                onClick={() => navigate(backButtonTo)}
                className="mb-4 cursor-pointer"
              >
                <FiArrowLeft className="h-4 w-4 mr-2" />
                {backButtonText}
              </Button>
            )}
            {title && (
              <>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="mt-2 text-gray-600">{subtitle}</p>
                )}
              </>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
