import SvgIcon from "@mui/joy/SvgIcon";
import { SvgIconProps } from "@mui/joy/SvgIcon/SvgIconProps";

export const EthIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="18" fill="none" viewBox="0 0 11 18">
        <path fill="currentColor" d="M5.307 12.179l5.116-3.024L5.307.667.191 9.155l5.116 3.024z"></path>
        <path fill="currentColor" d="M5.307 17.334l5.119-7.208-5.119 3.02-5.116-3.02 5.116 7.208z"></path>
      </svg>
    </SvgIcon>
  );
};
