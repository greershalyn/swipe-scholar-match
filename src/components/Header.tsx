
import { Link } from 'react-router-dom';
import { AccountDropdown } from './AccountDropdown';

const Header = () => {
  return (
    <div className="w-full bg-white/95 shadow-sm">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="inline-block">
          <img 
            src="/lovable-uploads/df51ad32-ac93-4a7c-9c40-9a0c72e8ac4d.png" 
            alt="SwipeScholar Logo" 
            className="h-12 w-auto"
          />
        </Link>
        <AccountDropdown />
      </div>
    </div>
  );
};

export default Header;
