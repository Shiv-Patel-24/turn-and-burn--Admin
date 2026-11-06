import * as React from "react";

const BellIcon = ({ size = 23, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 23 23"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M17.1176 7.60793C17.1176 6.09465 16.5165 4.64335 15.4464 3.5733C14.3764 2.50325 12.9251 1.9021 11.4118 1.9021C9.8985 1.9021 8.44719 2.50325 7.37714 3.5733C6.30709 4.64335 5.70594 6.09465 5.70594 7.60793C5.70594 14.2647 2.85303 16.1667 2.85303 16.1667H19.9705C19.9705 16.1667 17.1176 14.2647 17.1176 7.60793Z"
      strokeWidth={1.90194}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.057 19.9705C12.8898 20.2587 12.6498 20.4979 12.3611 20.6642C12.0723 20.8305 11.745 20.9181 11.4118 20.9181C11.0786 20.9181 10.7512 20.8305 10.4625 20.6642C10.1738 20.4979 9.93379 20.2587 9.7666 19.9705"
      strokeWidth={1.90194}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BellIcon;
