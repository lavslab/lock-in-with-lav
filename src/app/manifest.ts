import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lock In With Lav",
    short_name: "Lock In",
    description:
      "Build stronger routines, discipline and confidence. Lock in with Lav.",

    start_url: "/dashboard",
    scope: "/",

    display: "standalone",

    background_color: "#F7F1ED",
    theme_color: "#F7F1ED",

    orientation: "portrait",

    icons: [
      {
        src: "/lock-in.png",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}