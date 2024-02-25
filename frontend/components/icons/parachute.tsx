import SvgIcon from "@mui/joy/SvgIcon";
import { SvgIconProps } from "@mui/joy/SvgIcon/SvgIconProps";

export const ParachuteIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
        <path
          stroke="currentColor"
          d="M6.347 16.06l5.114-5.302m-2.532 7.575l4.821-5M3.571 7.118l3.908 3.437m8.95-3.437l-3.908 3.437m-2.521 0V7.118m3.75 10.349a.85.85 0 01-.202.594.795.795 0 01-.548.272H7a.784.784 0 01-.526-.284.842.842 0 01-.188-.582v-6.045a.842.842 0 01.188-.582.784.784 0 01.526-.284h6a.77.77 0 01.548.271.829.829 0 01.202.595v6.045zm3.3-10.349a.504.504 0 00.357-.14.299.299 0 00.079-.311c-.872-2.593-3.915-5-7.486-5-3.571 0-6.614 2.407-7.486 5a.307.307 0 00.079.31.504.504 0 00.357.141h14.1z"
        ></path>
      </svg>
    </SvgIcon>
  );
};
