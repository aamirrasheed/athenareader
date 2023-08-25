import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { doOnAuthStateChanged } from './firebase';
import { useState } from 'react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = doOnAuthStateChanged((user) => {
        if (!user) {
          // Redirect to login page if user is not authenticated
          router.push('/login');
        } else {
            setLoading(false)
        }
      });

      return () => unsubscribe();
    }, []);

    return loading ? <h1>Loading...</h1> : <WrappedComponent {...props} />

  };
};

export {withAuth};