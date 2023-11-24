import { Flex } from "@/components/shared/flex";
import { Button, Modal, ModalClose, ModalDialog, Typography } from "@mui/joy";
import { useCallback, useEffect, useState } from "react";

interface DialogOptions {
  title?: string;
  body?: string;
  type: DialogType;
  submit: () => void;
}

export type DialogType = "delete" | "confirm" | "discard";

const eventEmitter = (() => {
  let callbackList: ((options: DialogOptions) => unknown)[] = [];

  return {
    on(callback: (options: DialogOptions) => unknown) {
      callbackList.push(callback);
    },
    clear() {
      callbackList = [];
    },
    emit(options: DialogOptions) {
      callbackList.forEach(callback => {
        callback(options);
      });
    }
  };
})();

export const DialogContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<DialogType>("confirm");
  const [submitAction, setSubmitAction] = useState<() => void>(() => null);

  const openDialog = useCallback((dialogOptions: DialogOptions) => {
    if (dialogOptions.title) setTitle(dialogOptions.title);
    else setTitle("");

    if (dialogOptions.body) setBody(dialogOptions.body);
    else setBody("");

    setSubmitAction(() => dialogOptions.submit);

    setType(dialogOptions.type);
    setIsOpen(true);
  }, []);

  const renderDialogButtons = () => {
    if (type === "discard") {
      return (
        <Flex x yc gap1 alignSelf={"flex-end"}>
          <Button color="neutral" variant="outlined" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={() => {
              setIsOpen(false);
              submitAction();
            }}
          >
            Discard
          </Button>
        </Flex>
      );
    }
    if (type === "confirm") {
      return (
        <Flex x yc gap1 alignSelf={"flex-end"}>
          <Button color="neutral" variant="outlined" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              submitAction();
            }}
          >
            Confirm
          </Button>
        </Flex>
      );
    } else if (type === "delete") {
      return (
        <Flex x yc gap1 alignSelf={"flex-end"}>
          <Button variant="plain" title="Cancel" onClick={() => setIsOpen(false)}></Button>
          <Button
            color="danger"
            title="Delete"
            onClick={() => {
              setIsOpen(false);
              submitAction();
            }}
          ></Button>
        </Flex>
      );
    }
  };

  const getTitle = () => {
    if (title) return title;

    if (type === "confirm") return "Confirmation";

    if (type === "delete") return "Confirm deletion";

    if (type === "discard") return "Discard changes?";

    return "";
  };

  const getBody = () => {
    if (body) return body;

    if (type === "confirm") return "Are you sure ?";

    if (type === "delete") return "Are you sure you want to delete this item";

    if (type === "discard") return "This can't be undone and you'll lose all changes.";
  };

  useEffect(() => {
    eventEmitter.on(openDialog);

    return () => {
      eventEmitter.clear();
    };
  }, [openDialog]);

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalDialog sx={{ padding: 0 }}>
        <ModalClose />
        <Flex y gap1 p={2}>
          <Typography level={"title-lg"}>{getTitle()}</Typography>
          <Flex y gap3>
            <Typography textColor="neutral.600" level="body-lg">
              {getBody()}
            </Typography>
            {renderDialogButtons()}
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};

export const OpenDialog = (options: DialogOptions) => {
  eventEmitter.emit(options);
};
