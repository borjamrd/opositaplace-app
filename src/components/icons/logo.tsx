import type { SVGProps } from 'react';

export function OpositaPlaceLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="160"
      height="36"
      viewBox="0 0 160 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="0"
        y="28"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        Oposita
        <tspan fill="hsl(var(--accent))">Place</tspan>
      </text>
    </svg>
  );
}
