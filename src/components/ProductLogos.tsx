import type { ImgHTMLAttributes } from 'react';

type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  alt?: string;
};

export function BiowelLogo({ alt = 'Biowel', ...rest }: LogoProps) {
  return <img src="/logos/biowel.png" alt={alt} {...rest} />;
}

export function ActivosFijosLogo({ alt = 'Activos Fijos', ...rest }: LogoProps) {
  return <img src="/logos/activos-fijos.png" alt={alt} {...rest} />;
}
