import * as React from "react";

const AboutUsIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M22.504 12.275c0 5.65-4.58 10.23-10.23 10.23-5.649 0-10.228-4.58-10.228-10.23s4.58-10.23 10.229-10.23c5.65 0 10.229 4.58 10.229 10.23ZM12.275 8.183v4.092M12.275 16.367h.01" />
  </svg>
);

export default AboutUsIcon;
