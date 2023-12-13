import { SvgIcon, SvgIconProps } from "@mui/joy";

export const NotificationIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="none" viewBox="0 0 20 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M8.074 21.39a2.01 2.01 0 003.857 0M10 3.333V1.167M10.001 3.333a7.223 7.223 0 017.223 7.223c0 6.785 1.444 7.945 1.444 7.945H1.334s1.444-1.846 1.444-7.945a7.223 7.223 0 017.223-7.223z"
        ></path>
      </svg>
    </SvgIcon>
  );
};
