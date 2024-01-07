"use client";

import { Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import anchorme from "anchorme";
import { marked } from "marked";
import sanitize from "sanitize-html";

declare global {
  interface Window {
    builderfiAnchorStopPropagation?: (e: MouseEvent) => void;
  }
}

export const useMarkdown = (text?: string | null) => {
  if (!window.builderfiAnchorStopPropagation) {
    window.builderfiAnchorStopPropagation = function (event) {
      event.stopPropagation();
    };
  }

  const { data: formattedContent } = useQuery(
    [text],
    async () => {
      if (!text) return "";
      const md = await marked.parse(text);
      return anchorme({
        input: sanitize(md),
        options: {
          attributes: () => ({
            target: "_blank",
            onClick: "window.builderfiAnchorStopPropagation(event)"
          })
        }
      });
    },
    { enabled: !!text }
  );

  return (
    <Typography textColor="neutral.800" fontWeight={400} level="body-sm">
      <span className="remove-text-transform" dangerouslySetInnerHTML={{ __html: formattedContent || "" }} />
    </Typography>
  );
};
