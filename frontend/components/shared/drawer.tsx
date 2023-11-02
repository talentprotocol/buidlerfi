import { useLayoutContext } from "@/contexts/layoutContext";
import { Sheet } from "@mui/joy";
import { ClickAwayListener, Slide, SxProps } from "@mui/material";
import { FC, useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  children?: React.ReactNode;
  sx?: SxProps;
}

export const Drawer: FC<Props> = ({ isOpen, close, children, sx }) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const { rootContainerRef } = useLayoutContext();

  useEffect(() => {
    setIsOpenInternal(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    close();
  };

  console.log(rootContainerRef);

  return (
    <ClickAwayListener onClickAway={isOpenInternal ? handleClose : () => {}}>
      <Slide container={rootContainerRef.current} in={isOpenInternal} direction="right">
        <Sheet
          variant="outlined"
          sx={{
            position: "absolute",
            height: "100vh",
            minWidth: "300px",
            top: 0,
            left: 0,
            zIndex: 3,
            ...sx
          }}
        >
          {children}
        </Sheet>
      </Slide>
    </ClickAwayListener>
  );
};
