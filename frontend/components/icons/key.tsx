import { SvgIcon, SvgIconProps } from "@mui/joy";

export const KeyIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 22 22">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M16.32 19.004h2.665M17.652 17.672v2.665M1 5.016h3.997M2.998 3.017v3.997M12.97 6.847a2.185 2.185 0 104.37 0 2.185 2.185 0 00-4.37 0z"
        ></path>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9.975 9.453l-8.438 8.438a1.821 1.821 0 002.576 2.576l1.283-1.285 1.295 1.295a1.457 1.457 0 102.06-2.06l-1.293-1.295 5.092-5.093a5.828 5.828 0 10-2.575-2.576z"
        ></path>
      </svg>
    </SvgIcon>
  );
};
