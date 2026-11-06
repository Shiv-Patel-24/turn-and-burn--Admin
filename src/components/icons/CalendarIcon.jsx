import * as React from "react";

const CalendarIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M5.115 4.092h14.32c1.13 0 2.046.916 2.046 2.045v14.321c0 1.13-.916 2.046-2.046 2.046H5.116a2.046 2.046 0 0 1-2.046-2.046V6.138c0-1.13.916-2.046 2.046-2.046ZM16.367 2.046v4.092M8.184 2.046v4.092M3.069 10.23H21.48" />
  </svg>
);

export default CalendarIcon;
