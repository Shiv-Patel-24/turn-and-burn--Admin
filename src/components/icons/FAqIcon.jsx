import * as React from "react";

const FAqIcon = ({ size = 25, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 25 25"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.046}
    className={className}
    {...props}
  >
    <path d="M12.275 17.39h.002M9.59 10.357a2.685 2.685 0 1 1 3.683 2.494c-.523.21-.998.65-.998 1.214v.256m9.206-2.046a9.206 9.206 0 1 1-18.411 0 9.206 9.206 0 0 1 18.411 0Z" />
  </svg>
);

export default FAqIcon;
