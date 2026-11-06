import * as React from "react";

const DashboardIcon = ({ size = 25, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 25 25"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.841}
    className={className}
    {...props}
  >
    <path d="M4.092 3.069h5.114c.565 0 1.023.458 1.023 1.023v5.114c0 .565-.458 1.023-1.023 1.023H4.092a1.023 1.023 0 0 1-1.023-1.023V4.092c0-.565.458-1.023 1.023-1.023ZM15.344 3.069h5.115c.564 0 1.023.458 1.023 1.023v5.114c0 .565-.459 1.023-1.023 1.023h-5.115a1.023 1.023 0 0 1-1.023-1.023V4.092c0-.565.458-1.023 1.023-1.023ZM15.344 14.32h5.115c.564 0 1.023.459 1.023 1.024v5.114c0 .565-.459 1.023-1.023 1.023h-5.115a1.023 1.023 0 0 1-1.023-1.023v-5.114c0-.565.458-1.023 1.023-1.023ZM4.092 14.32h5.114c.565 0 1.023.459 1.023 1.024v5.114c0 .565-.458 1.023-1.023 1.023H4.092a1.023 1.023 0 0 1-1.023-1.023v-5.114c0-.565.458-1.023 1.023-1.023Z" />
  </svg>
);

export default DashboardIcon;
