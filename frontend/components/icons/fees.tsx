import { SvgIcon, SvgIconProps } from "@mui/joy";

export const FeesIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" fill="none" viewBox="0 0 20 21">
        <g clipPath="url(#clip0_3296_5308)">
          <path fill="currentColor" d="M13.125 1.125l2.5 2.5-2.5 2.5"></path>
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.125 1.125l2.5 2.5-2.5 2.5M15.625 3.625h-15M13.125 14.875l2.5 2.5-2.5 2.5M15.625 17.375h-15M6.875 13l-2.5-2.5 2.5-2.5M4.375 10.5h15"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_3296_5308">
            <path fill="#fff" d="M0 0H20V20H0z" transform="translate(0 .5)"></path>
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
};
