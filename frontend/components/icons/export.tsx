import { SvgIcon, SvgIconProps } from "@mui/joy";

export const ExportIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20">
        <path fill="currentColor" d="M13 11.25V.625 11.25z"></path>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 11.25V.625M10.5 3.125l2.5-2.5 2.5 2.5M8 8.75v10.625M10.5 16.875l-2.5 2.5-2.5-2.5"
        ></path>
      </svg>
    </SvgIcon>
  );
};
