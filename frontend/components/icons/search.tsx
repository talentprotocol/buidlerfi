import { SvgIcon, SvgIconProps } from "@mui/joy";

export const SearchIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 22 22">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M1.642 12.206a8.055 8.055 0 1014.827-6.302 8.055 8.055 0 00-14.827 6.302zM14.75 14.752L20.997 21"
        ></path>
      </svg>
    </SvgIcon>
  );
};
