import { getImageProps } from "next/image";

type Props = {
  /** "exploded" is the SSR/LCP frame; "assembled" is used for reduced motion. */
  variant: "exploded" | "assembled";
  priority?: boolean;
  className?: string;
};

/**
 * Art-directed poster: landscape frame for landscape viewports, portrait
 * frame for phones. Rendered from the same procedural scene and camera as
 * the WebGL hero so the cross-fade is invisible. Swap points: README.
 */
export function HeroPoster({ variant, priority = false, className = "" }: Props) {
  const common = {
    alt:
      variant === "exploded"
        ? "Exploded view of a commercial truck wheel assembly: lug nuts, steel wheel, tire, hub, inner dual and brake drum separated along the axle"
        : "Assembled commercial truck wheel with a dual tire configuration",
    quality: 78,
    priority,
    sizes: "100vw",
  };
  const { props: landscape } = getImageProps({
    ...common,
    width: 1920,
    height: 1080,
    src: `/images/hero-poster-${variant}-landscape.jpg`,
  });
  const { props: portrait } = getImageProps({
    ...common,
    width: 1080,
    height: 1920,
    src: `/images/hero-poster-${variant}-portrait.jpg`,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { srcSet: _ignored, ...rest } = landscape;
  return (
    <picture className={className}>
      <source media="(max-aspect-ratio: 21/20)" srcSet={portrait.srcSet} sizes="100vw" />
      <source media="(min-aspect-ratio: 21/20)" srcSet={landscape.srcSet} sizes="100vw" />
      <img
        {...rest}
        alt={common.alt}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </picture>
  );
}
