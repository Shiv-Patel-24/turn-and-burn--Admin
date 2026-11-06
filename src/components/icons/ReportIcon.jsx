import * as React from "react";

const ReportIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M18.413 20.458V10.23M12.275 20.458V4.092M6.138 20.458v-6.137M2.046 20.458h20.458" />
  </svg>
);

export default ReportIcon;
