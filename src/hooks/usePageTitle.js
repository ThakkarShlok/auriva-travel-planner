import { useEffect } from 'react';

function usePageTitle(title, appName = 'Voyage AI') {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} · ${appName}` : appName;
    
    return () => {
      document.title = originalTitle;
    };
  }, [title, appName]);
}

export default usePageTitle;