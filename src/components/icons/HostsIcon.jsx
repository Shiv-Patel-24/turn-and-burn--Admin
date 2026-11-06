import * as React from "react";

const HostsIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M17.39 21.481v-2.046a4.091 4.091 0 0 0-4.092-4.091H5.115a4.091 4.091 0 0 0-4.092 4.091v2.046M13.298 7.16a4.092 4.092 0 1 1-8.183 0 4.092 4.092 0 0 1 8.183 0ZM23.527 21.481v-2.046a4.092 4.092 0 0 0-3.068-3.958M16.367 3.202a4.092 4.092 0 0 1 0 7.927" />
  </svg>
);

export default HostsIcon;
