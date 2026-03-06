import React from "react";
import type { IconName } from "../index";

export type IconProps = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    name: IconName;
    title?: string;
    size?: number | string;
    color?: string;
    spriteUrl?: string;
  }
>;

export const Icon: IconProps = ({
  name,
  title,
  size = 16,
  color,
  spriteUrl = "/sprite.svg",
  className,
  style,
  ...props
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ color: color, ...style }}
      {...props}
    >
      {title && <title>{title}</title>}
      <use href={`${spriteUrl}#${name}`} />
    </svg>
  );
};
