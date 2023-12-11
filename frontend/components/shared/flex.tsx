import { Box, Skeleton, type BoxProps } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { forwardRef, type ReactNode } from "react";

interface Props extends BoxProps {
  children?: ReactNode;
  //direction x
  x?: boolean;
  //direction y
  y?: boolean;
  //positionning x start
  xs?: boolean;
  //positionning x center
  xc?: boolean;
  //positionning x end
  xe?: boolean;
  //positionning y start
  ys?: boolean;
  //positionning y center
  yc?: boolean;
  //positionning y end
  ye?: boolean;
  //positionning x space-between
  xsb?: boolean;
  //positionning y space-between
  ysb?: boolean;

  xsa?: boolean;
  ysa?: boolean;

  gap?: number;
  gap1?: boolean;
  gap2?: boolean;
  gap3?: boolean;
  sx?: SxProps;

  wrap?: boolean;
  grow?: boolean;
  loading?: boolean;
  fullwidth?: boolean;
  basis?: string;
  pointer?: boolean;
  hover?: boolean;
}

const Flex = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      x,
      y,
      xs,
      xc,
      xe,
      ys,
      yc,
      ye,
      xsb,
      ysb,
      gap,
      gap1,
      gap2,
      gap3,
      sx,
      xsa,
      ysa,
      fullwidth,
      wrap,
      grow,
      loading,
      basis,
      pointer,
      hover,
      ...rest
    },
    ref
  ) => {
    const style: SxProps = { display: "flex" };
    if (x) style.flexDirection = "row";
    if (y) style.flexDirection = "column";
    if (xs) style[x ? "justifyContent" : "alignItems"] = "flex-start";
    if (xc) style[x ? "justifyContent" : "alignItems"] = "center";
    if (xe) style[x ? "justifyContent" : "alignItems"] = "flex-end";
    if (xsb) style[x ? "justifyContent" : "alignItems"] = "space-between";
    if (xsa) style[x ? "justifyContent" : "alignItems"] = "space-around";

    if (ys) style[y ? "justifyContent" : "alignItems"] = "flex-start";
    if (yc) style[y ? "justifyContent" : "alignItems"] = "center";
    if (ye) style[y ? "justifyContent" : "alignItems"] = "flex-end";
    if (ysb) style[y ? "justifyContent" : "alignItems"] = "space-between";
    if (ysa) style[y ? "justifyContent" : "alignItems"] = "space-around";

    if (gap1) {
      style.columnGap = 1;
      style.rowGap = 1;
    }

    if (gap2) {
      style.columnGap = 2;
      style.rowGap = 2;
    }

    if (gap3) {
      style.columnGap = 3;
      style.rowGap = 3;
    }

    if (gap) {
      style.columnGap = gap;
      style.rowGap = gap;
    }

    if (fullwidth) {
      style.width = "100%";
    }

    if (wrap) {
      style.flexWrap = "wrap";
    }

    if (grow) {
      style.flexGrow = 1;
    }

    if (basis) {
      style.flexBasis = basis;
    }

    if (pointer) {
      style.cursor = "pointer";
    }

    if (hover) {
      // @ts-expect-error this exists on MUI sx Props
      style["&:hover"] = {
        backgroundColor: "neutral.100"
      };
    }

    return (
      <Skeleton animation="wave" loading={loading || false}>
        <Box ref={ref} {...rest} sx={{ ...style, ...sx }}>
          {children}
        </Box>
      </Skeleton>
    );
  }
);

Flex.displayName = "Flex";
export { Flex };
