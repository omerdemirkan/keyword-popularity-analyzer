import Link, { LinkProps } from "next/link";

export interface NewTabLinkProps extends LinkProps {
  newTab?: boolean;
  anchorProps?: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >;
}

const NavLink: React.FC<NewTabLinkProps> = ({
  children,
  newTab,
  anchorProps,
  ...linkProps
}) => {
  return (
    <Link {...linkProps}>
      <a
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noreferrer noopener" : undefined}
      >
        {children}
      </a>
    </Link>
  );
};

export default NavLink;
