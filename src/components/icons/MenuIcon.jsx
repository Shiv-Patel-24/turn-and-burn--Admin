import * as React from "react";

const MenuIcon = ({ size = 24, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className={className}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeWidth={1.902}
      d="M2.853 5.706H19.97M2.853 11.412H19.97M2.853 17.117H19.97"
    />
  </svg>
);

export default MenuIcon;
