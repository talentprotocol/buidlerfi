"use client";
import anchorme from "anchorme";
import { marked } from "marked";
import sanitize from "sanitize-html";

declare global {
  interface Window {
    builderfiAnchorStopPropagation: (e: MouseEvent) => void;
  }
}

if (typeof window !== "undefined") {
  window.builderfiAnchorStopPropagation = function (event) {
    event.stopPropagation();
  };
}

export async function formatText(inputText: string) {
  const md = await marked.parse(inputText);
  return anchorme({
    input: sanitize(md),
    options: {
      attributes: () => ({
        target: "_blank",
        onClick: "window.builderfiAnchorStopPropagation(event)"
      })
    }
  });
}
