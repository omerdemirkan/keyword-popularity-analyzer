import React from "react";
import NavLink from "../util/NavLink";

interface LayoutProps {
  scrollView?: any;
}

const Layout: React.FC<LayoutProps> = ({ children, scrollView }) => {
  return (
    <>
      <div className="min-h-screen">
        <Navbar />
        {children}
      </div>
      {scrollView}
      <Footer />
    </>
  );
};

export default Layout;

const Navbar: React.FC = () => {
  return (
    <nav className="max-w-6xl m-auto h-24 flex justify-between items-center">
      <Logo />
      <div>
        <NavLink
          newTab
          href="https://github.com/omerdemirkan/remind-me-about-bitcoin/issues"
        >
          <span className="text-sm font-medium text-font-secondary">
            REPORT A BUG
          </span>
        </NavLink>
        <NavLink newTab href="https://www.buymeacoffee.com/omerdemirkan">
          <span className="text-sm font-semibold ml-12 text-primary-700">
            BUY ME A COFFEE
          </span>
        </NavLink>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  return <footer></footer>;
};

const Logo: React.FC = () => {
  return <span className="text-lg font-medium">remindmeaboutbitcoin.com</span>;
};
