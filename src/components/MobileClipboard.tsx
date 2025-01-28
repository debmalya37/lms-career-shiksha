"use client";

import React, { useEffect } from "react";

export default function MobileClipboardFunction  ()  {
  // useEffect(() => {
  //   const clearClipboard = async () => {
  //     try {
  //       await navigator.clipboard.writeText("");
  //       console.log("Clipboard cleared.");
  //     } catch (err) {
  //       console.error("Clipboard access denied or unsupported:", err);
  //       clearInterval(interval);
  //     }
  //   };

  //   const interval = setInterval(clearClipboard, 1000);

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

  return <div>
    {/* Clipboard cleaner is running... */}

  </div>;
};
