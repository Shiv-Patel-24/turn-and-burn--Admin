import * as React from "react";

const TermsIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M14.321 2.046H6.138a2.046 2.046 0 0 0-2.046 2.046v16.366a2.046 2.046 0 0 0 2.046 2.046h12.275a2.046 2.046 0 0 0 2.046-2.046V8.183L14.32 2.046Z" />
    <path d="M14.32 2.046v6.137h6.138M16.366 13.298H8.183M16.366 17.39H8.183M10.229 9.206H8.183" />
  </svg>
);

export default TermsIcon;
