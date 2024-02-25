import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { WEB3_SOCIALS_IMAGE } from "@/lib/assets";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { FC } from "react";

interface Props {
  onSkip: () => void;
}

export const LinkWalletModal: FC<Props> = ({ onSkip }) => {
  const { refetch } = useUserContext();
  const { linkWallet, isLoading } = useLinkExternalWallet();
  const handleLinkWallet = async () => {
    linkWallet(async () => {
      await refetch();
    });
  };

  return (
    <Modal open={true}>
      <ModalDialog sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex p={3} y grow gap={2}>
          <Flex y gap={3}>
            <Flex y>
              <Typography my={1} level="h3">
                Import your web3 socials
              </Typography>
              <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
                builder.fi is built on top of web3 social graphs like Farcaster or Talent Protocol. Connect your main
                web3 wallet to automatically import your profile info and find your web3 friends. No on-chain
                transaction required.
              </Typography>
            </Flex>
          </Flex>
          <Flex y yc xc grow>
            <img src={WEB3_SOCIALS_IMAGE} width="100%" />
          </Flex>
          <Flex y gap1>
            <Button size="lg" fullWidth loading={isLoading} onClick={() => handleLinkWallet()}>
              Connect web3 socials
            </Button>
            <Button size="lg" fullWidth variant="plain" disabled={isLoading} onClick={() => onSkip()}>
              Connect later
            </Button>
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
