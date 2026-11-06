import * as React from "react";

const ContactUsIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M21.481 15.344a2.046 2.046 0 0 1-2.046 2.046H7.16L3.07 21.48V5.115a2.046 2.046 0 0 1 2.045-2.046h14.321a2.046 2.046 0 0 1 2.046 2.046v10.229Z" />
  </svg>
);

export default ContactUsIcon;
