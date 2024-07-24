import Close from "@mui/icons-material/Close";
import { Alert, IconButton, Typography } from "@mui/joy";
import { useState } from "react";
import { Flex } from "../shared/flex";

export const MaintenanceAlert = () => {
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  return (
    <>
      {isAlertVisible && (
        <Alert
          variant="outlined"
          color="warning"
          size="sm"
          sx={{
            borderRadius: 0,
            position: "sticky",
            top: "55px"
          }}
          endDecorator={
            <IconButton onClick={() => setIsAlertVisible(false)} color="warning" size="sm">
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Flex y grow>
            <Typography level="title-sm" textColor={"warning.600"}>
              Builder.fi is sunsetting until end of Aug, 2024. Please withdraw your funds asap.
            </Typography>
          </Flex>
        </Alert>
      )}
    </>
  );
};
