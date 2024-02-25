import Close from "@mui/icons-material/Close";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import { FC } from "react";
import { Flex } from "./flex";

interface Props {
  title: string;
  onClose?: () => void;
  body: string;
  children?: React.ReactNode;
}

export const BannerCard: FC<Props> = ({ body, title, children, onClose }) => {
  return (
    <Card
      sx={{
        backgroundColor: theme => theme.palette.primary[50],
        ".MuiTypography-root": {
          color: theme => theme.palette.primary[500]
        }
      }}
    >
      <Flex x xsb>
        <Typography textColor="primary.400" fontWeight="600" level="title-sm">
          {title}
        </Typography>
        {onClose && (
          <Close
            onClick={() => onClose()}
            color="primary"
            fontSize="small"
            sx={{ cursor: "pointer", ":hover": { opacity: 0.8 } }}
          />
        )}
      </Flex>
      <Typography textColor="primary.400" level="body-sm">
        {body}
      </Typography>
      {children}
    </Card>
  );
};
