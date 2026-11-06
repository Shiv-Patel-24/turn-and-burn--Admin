import * as React from "react";

const PaymentIcon = ({ size = 25, className = "", ...props }) => (
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
    <path d="M3.069 4.092H21.48c1.13 0 2.046.916 2.046 2.045v12.275c0 1.13-.916 2.046-2.046 2.046H3.07a2.046 2.046 0 0 1-2.046-2.046V6.137c0-1.13.916-2.045 2.046-2.045ZM1.023 10.229h22.504" />
  </svg>
);

export default PaymentIcon;
