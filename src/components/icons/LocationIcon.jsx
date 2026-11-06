import * as React from "react";

const LocationIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M21.481 10.23c0 7.16-9.206 13.297-9.206 13.297S3.07 17.39 3.07 10.23a9.206 9.206 0 1 1 18.412 0Z" />
    <path d="M15.344 10.23a3.069 3.069 0 1 1-6.138-.001 3.069 3.069 0 0 1 6.138 0Z" />
  </svg>
);

export default LocationIcon;
