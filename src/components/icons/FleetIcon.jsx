import * as React from "react";

const FleetIcon = ({ size = 26, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 26 26"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.166}
    className={className}
    {...props}
  >
    <path d="M5.415 18.413H3.25a2.166 2.166 0 0 1-2.166-2.167V5.416A2.166 2.166 0 0 1 3.25 3.248h11.914l5.416 5.416v9.748a2.166 2.166 0 0 1-2.166 2.166h-2.167" />
    <path d="M10.83 18.954a2.708 2.708 0 1 1-5.415 0 2.708 2.708 0 0 1 5.416 0ZM21.662 18.954a2.708 2.708 0 1 1-5.416 0 2.708 2.708 0 0 1 5.416 0Z" />
  </svg>
);

export default FleetIcon;
