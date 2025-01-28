"use client"; // Mark this as a client-side component

import { useEffect, useState } from "react";

export default function DisableRightClickAndClipboard() {
  const [clipboardPermissionDenied, setClipboardPermissionDenied] = useState(false);

  useEffect(() => {
    // // Function to check clipboard permission
    // const checkClipboardPermission = async () => {
    //   try {
    //     const permission = await navigator.permissions.query({ name: "clipboard-write" });
    //     if (permission.state === "denied") {
    //       setClipboardPermissionDenied(true);
    //     }
    //   } catch (err) {
    //     console.error("Failed to check clipboard permission", err);
    //   }
    // };

    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable copy, cut, and paste actions
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Function to close the window tab when Shift + Ctrl + C is pressed
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        alert("WARNING! : You Can't Access Inspect Functions !!");
        e.preventDefault(); // Prevent the default behavior (open dev tools)
        // Close the window tab
        window.close();
      }
    };

    // // Function to clear the clipboard
    // const clearClipboard = async () => {
    //   try {
    //     // Set the clipboard content to an empty string
    //     await navigator.clipboard.writeText("");
    //   } catch (err) {
    //     console.error("Failed to clear clipboard", err);
    //   }
    // };

    // Add event listeners for disabling right-click and clipboard actions
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("keydown", handleKeyDown, true);

    // // Clear clipboard every 1000 milliseconds (1 second)
    // const intervalId = setInterval(clearClipboard, 100);

    // Check clipboard permission on mount
    // checkClipboardPermission();

    // Cleanup on unmount
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("keydown", handleKeyDown);
      // clearInterval(intervalId); // Stop clearing the clipboard when the component is unmounted
    };
  }, []);

  return (
    <div>
      {/* {clipboardPermissionDenied && (
        <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
          Please grant clipboard access to proceed.
        </div>
      )} */}
    </div>
  );
}
