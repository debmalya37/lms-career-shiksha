"use client"; // Mark this as a client-side component

import { useEffect, useState } from "react";

export default function DisableRightClickAndClipboard() {
  const [clipboardPermissionDenied, setClipboardPermissionDenied] = useState(false);

  useEffect(() => {
    // Function to try clearing the clipboard and handle permission denial
    const clearClipboard = async () => {
      try {
        // Attempt to write an empty string to the clipboard
        await navigator.clipboard.writeText("");
      } catch (err) {
        // If an error occurs, set permission denied flag
        console.error("Clipboard access denied", err);
        setClipboardPermissionDenied(true);
      }
    };

    // Set interval to clear clipboard every 1 second
    const clipboardInterval = setInterval(clearClipboard, 1000);

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

    // Add event listeners for disabling right-click and clipboard actions
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("keydown", handleKeyDown, true);

    // Cleanup on unmount
    return () => {
      clearInterval(clipboardInterval); // Clear the interval on unmount
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent clicks or taps outside of allowed areas
  useEffect(() => {
    if (clipboardPermissionDenied) {
      const handleClick = (e: MouseEvent) => {
        // Allow clicks on the URL box or the permission message
        const allowedArea = e.target as HTMLElement;
        if (
          !allowedArea.closest("#url-box") &&
          !allowedArea.closest("#permission-message")
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
          
        }
      };

      document.addEventListener("click", handleClick, true); // Use capturing phase
      
      // Cleanup event listener
      return () => {
        document.removeEventListener("click", handleClick, true);
        window.location.reload();
      };
    }
    
  }, [clipboardPermissionDenied]);

  // Handle interaction with the permission message
  const handlePermissionMessageClick = () => {
    
    // Refresh the page when the permission message is clicked
    window.location.reload();
  };

  return (
    <div>
      {clipboardPermissionDenied && (
        <div
          id="permission-message"
          onClick={handlePermissionMessageClick} // Add click handler for permission message
          style={{
            color: "red",
            textAlign: "center",
            marginTop: "20px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          Please grant clipboard access to proceed.
        </div>
      )}

      {/* URL box is hidden */}
      <div
        id="url-box"
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 9999,
          display: "none", // Hides the URL box
        }}
      >
        <input type="text" placeholder="Enter URL here" />
      </div>
    </div>
  );
}
