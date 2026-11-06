import * as React from "react";

const BlogsIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M12.275 20.458h9.206M16.878 3.58a2.17 2.17 0 1 1 3.069 3.069L7.16 19.435 3.07 20.458l1.023-4.091L16.878 3.58Z" />
  </svg>
);

export default BlogsIcon;
