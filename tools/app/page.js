"use client";

import React, { useEffect } from "react";
import BoostViewsExplanation from "@/Components/Explanation";
import Faq from "@/Components/Faq";
import Hero from "@/Components/Hero";
import HowTiWork from "@/Components/HowTiWork";

function Page() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const slug = window.location.pathname;

      // base url
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";
      // console.log(baseUrl);

      if (slug === "/") {
        fetch(`${baseUrl}/api/views?slug=${slug}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "x-client-key": process.env.NEXT_PUBLIC_SECRETE_KEY,
          },
        });
      }
    }
  }, []);

  return (
    <>
      <Hero />
      <HowTiWork />
      <BoostViewsExplanation />
      <Faq />
//for de bug
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>
  eruda.init();
</script>
  
    </>
  );
}

export default Page;
