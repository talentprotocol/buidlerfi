import { SvgIcon, SvgIconProps } from "@mui/joy";

export const PointsIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" fill="none" viewBox="0 0 20 18">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M15.056 9.281l.927 1.668h1.838a.504.504 0 01.363.862l-1.688 1.842.935 2.149a.51.51 0 01-.725.637l-2.261-1.272-2.26 1.271a.51.51 0 01-.726-.637l.904-2.075M4.943 9.281l-.927 1.668H2.178a.504.504 0 00-.363.862l1.688 1.842-.935 2.149a.51.51 0 00.725.637l2.26-1.272 2.26 1.271a.51.51 0 00.727-.637l-.904-2.075M10.271 1.7l1.474 2.946 2.836.284a.36.36 0 01.218.611l-2.336 2.336.866 3.173a.359.359 0 01-.507.415L9.95 10.03 7.08 11.465a.36.36 0 01-.506-.415l.865-3.173L5.104 5.54a.36.36 0 01.217-.612l2.835-.283L9.628 1.7a.359.359 0 01.643 0z"
        ></path>
      </svg>
    </SvgIcon>
  );
};
