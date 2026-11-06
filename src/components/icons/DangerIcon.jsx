import * as React from "react";

const DangerIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M10.526 3.948 1.862 18.413a2.046 2.046 0 0 0 1.75 3.068h17.327a2.045 2.045 0 0 0 1.75-3.069L14.024 3.949a2.045 2.045 0 0 0-3.498 0ZM12.275 9.206v4.092M12.275 17.39h.01" />
  </svg>
);

export default DangerIcon;
