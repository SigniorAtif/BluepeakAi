import Image from "next/image";

/* The founder's photo, in its own colours. */
export default function Portrait({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="bp-portrait">
      <Image src={src} alt={alt} fill sizes="(min-width: 1200px) 1100px, 100vw" priority />
    </div>
  );
}
