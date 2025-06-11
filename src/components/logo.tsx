import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className="flex items-center justify-center">
    <Image
      src="/opositaplace_logo_v1.png"
      width={40}
      height={40}
      className={cn("", className)}
      alt="Picture of the author"
    />
    <span className="text-xl font-bold text-primary">opositaplace</span>
    </div>
  );
};

export default Logo;
