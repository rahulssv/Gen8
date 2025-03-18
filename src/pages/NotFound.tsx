
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-bioquery-500 to-bioquery-700 flex items-center justify-center mb-6">
        <span className="text-white font-bold text-3xl">404</span>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Page not found</h1>
      
      <p className="text-muted-foreground text-center max-w-md mb-8">
        We couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      
      <Link 
        to="/" 
        className="button-transition rounded-lg h-12 px-8 bg-bioquery-600 text-white font-medium hover:bg-bioquery-700 flex items-center justify-center"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
