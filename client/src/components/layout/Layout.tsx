import React from "react";
import Divider from "../ui/Divider";
import NavLink from "../util/NavLink";
import Container from "./Container";

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
      <Divider />
      <Footer />
    </>
  );
};

export default Layout;

const Navbar: React.FC = () => {
  return (
    <Container>
      <nav className="h-24 flex justify-between items-center flex-wrap">
        <NavLink href="/">
          <Logo />
        </NavLink>
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
    </Container>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-6 flex justify-center">
      <span className="text-right pr-4">
        <p className="text-xs text-font-secondary font-light mb-2">SHARE</p>
        <p className="text-xs text-font-secondary font-light mb-2">
          SUBSCRIBE TO ALERTS
        </p>
        <NavLink
          href="https://github.com/omerdemirkan/remind-me-about-bitcoin/issues"
          newTab
        >
          <p className="text-xs text-font-secondary font-light">REPORT A BUG</p>
        </NavLink>
      </span>
      <span className="pl-4">
        <NavLink href="https://github.com/omerdemirkan" newTab>
          <p className="text-xs text-font-secondary font-light mb-2">GITHUB</p>
        </NavLink>
        <NavLink href="https://www.linkedin.com/in/omer-d/">
          <p className="text-xs text-font-secondary font-light mb-2">
            LINKEDIN
          </p>
        </NavLink>
        <NavLink href="https://www.buymeacoffee.com/omerdemirkan">
          <p className="text-xs text-font-secondary font-light">
            BUY ME A COFFEE
          </p>
        </NavLink>
      </span>
    </footer>
  );
};

const Logo: React.FC = () => {
  return <span className="text-lg font-medium">remindmeaboutbitcoin.com</span>;
};
