import { SvgIcon, SvgIconProps } from "@mui/joy";

export const ExportIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
        <path d="M13 11.25L13 0.625L13 11.25Z" fill="currentColor" />
        <path d="M13 11.25L13 0.625" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
        <path
          d="M10.5 3.125L13 0.625L15.5 3.125"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M8 8.75L8 19.375" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
        <path
          d="M10.5 16.875L8 19.375L5.5 16.875"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </SvgIcon>
  );
};
