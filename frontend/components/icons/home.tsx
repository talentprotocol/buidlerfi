import { SvgIcon, SvgIconProps } from "@mui/joy";

export const HomeIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M21.662 9.288L12.003 2 2.335 9.288c-.2.184-.32.44-.335.71v11.13a.872.872 0 00.87.87h5.796v-4.664a3.333 3.333 0 116.666 0V22h5.795a.873.873 0 00.87-.87V10a1.05 1.05 0 00-.335-.711z"
        ></path>
      </svg>
    </SvgIcon>
  );
};
