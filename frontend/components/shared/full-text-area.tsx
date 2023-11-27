import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { Avatar, Textarea } from "@mui/joy";
import { ChangeEvent, FC, useRef } from "react";
import { Flex } from "./flex";

interface Props {
  avatarUrl?: string;
  placeholder: string;
  value: string;
  onChange: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

export const FullTextArea: FC<Props> = ({ avatarUrl, placeholder, value, onChange }) => {
  const textAreadRef = useRef<HTMLDivElement>(null);

  return (
    <Flex y grow minHeight="100px">
      <Flex x ys gap={1}>
        <Avatar size="sm" src={avatarUrl || DEFAULT_PROFILE_PICTURE} />
        <Flex grow>
          <Textarea
            ref={textAreadRef}
            sx={{
              flexGrow: 1,
              border: "none",
              boxShadow: "none",
              "::before": {
                boxShadow: "none"
              },
              "&>*": {
                textTransform: "none"
              }
            }}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        </Flex>
      </Flex>
      <Flex
        mt={-2}
        y
        grow
        sx={{ cursor: "text" }}
        onClick={() => {
          (textAreadRef.current?.firstChild as HTMLInputElement).focus();
        }}
      />
    </Flex>
  );
};
