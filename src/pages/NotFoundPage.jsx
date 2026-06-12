import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/UI/PageHeader';
import Button from '../components/UI/Button';
import { Home } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const NotFoundPage = () => {
  usePageTitle('Page Not Found')
  return (
    <div>
      <PageHeader
        eyebrow="404"
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
      />
      <div className="container-custom py-16 text-center">
        <Link to="/">
          <Button icon={Home} size="lg">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
