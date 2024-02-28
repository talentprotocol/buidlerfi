"use client";
import { KeyIcon } from "@/components/icons/key";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUserProfile } from "@/hooks/useUserProfile";
import { shortAddress } from "@/lib/utils";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import Button from "@mui/joy/Button";
import { FC } from "react";
import { QuestionEntry } from "./question-entry";

interface Props {
  type: "answers" | "questions";
  profile?: ReturnType<typeof useUserProfile>;
}

export const QuestionsList: FC<Props> = ({ type, profile }) => {
  const router = useBetterRouter();
  const questionsToUse = type === "answers" ? profile?.questionsAnswered : profile?.questionsAsked;
  const hasQuestion: boolean = !!questionsToUse?.length;
  // const hasQuestion: boolean = false;
  if (!profile || profile.isLoading) {
    return <LoadingPage />;
  }

  const getMessage = () => {
    if (hasQuestion) {
      return null;
    }

    if (type === "questions") {
      if (!profile?.isOwnProfile) {
        return {
          title: "no questions to show",
          icon: <AccessTimeOutlined />,
          text: profile?.user?.displayName + " didn’t ask any questions to other builders yet"
        };
      } else {
        return {
          title: "no questions to show",
          icon: <AccessTimeOutlined />,
          text: "You haven't asked any questions to other builders yet"
        };
      }
    }

    if (!profile?.isOwnProfile) {
      if (profile?.hasLaunchedKeys) {
        if (!profile?.hasKeys) {
          return {
            title: `you don't hold any keys of ${profile?.user?.displayName}`,
            icon: <AccessTimeOutlined />,
            text: "hold " + profile?.user?.displayName + "'s keys to ask him a question"
          };
        } else {
          return {
            title: "you have a key",
            icon: <KeyIcon />,
            text: "ask the first question to " + profile?.user?.displayName,
            button: (
              <Button
                onClick={() =>
                  router.replace({ pathname: "/question", searchParams: { ask: true, wallet: profile.user?.wallet } })
                }
              >
                Ask question
              </Button>
            )
          };
        }
      } else {
        if (profile?.user) {
          return {
            title: "this profile is public",
            icon: <KeyIcon />,
            text: "ask the first question to " + profile?.user?.displayName || shortAddress(profile.user.wallet),
            button: (
              <Button
                onClick={() =>
                  router.replace({ pathname: "/question", searchParams: { ask: true, wallet: profile.user?.wallet } })
                }
              >
                Ask question
              </Button>
            )
          };
        }
        const profileName =
          profile?.recommendedUser?.talentProtocol ||
          profile?.recommendedUser?.farcaster ||
          profile?.recommendedUser?.ens ||
          profile?.recommendedUser?.lens;
        if (profile?.recommendedUser?.farcaster) {
          return {
            title: `${profile.recommendedUser.farcaster} isn't on builder.fi yet`,
            icon: <KeyIcon />,
            text: "but you can show your interest in their knowledge asking a question or sending an invite",
            button: (
              <Button
                onClick={() =>
                  router.replace({
                    pathname: "/question",
                    searchParams: { ask: true, wallet: profile.recommendedUser?.wallet }
                  })
                }
              >
                Ask question
              </Button>
            )
          };
        } else {
          return {
            title: "not accepting questions yet",
            icon: <AccessTimeOutlined />,
            text: profileName + " didn’t create their keys, but we can notify you when they do"
          };
        }
      }
    } else {
      return {
        title: "no answers to show",
        icon: <AccessTimeOutlined />,
        text: "You haven't received any questions yet"
      };
    }
  };

  const message = getMessage();
  if (message && profile.questionsAnswered?.length === 0) {
    return (
      <Flex y grow>
        <PageMessage title={message.title} icon={message.icon} text={message.text} />
        {!message.button ? null : (
          <Flex y gap2 xc grow yc>
            {message.button}
          </Flex>
        )}
      </Flex>
    );
  }

  return (
    <Flex y grow>
      <Flex y grow sx={{ "& > div:last-child": { border: "none" } }}>
        {questionsToUse?.map(question => {
          return <QuestionEntry refetch={profile.refetch} key={question.id} question={question} />;
        })}
        <LoadMoreButton query={profile?.getQuestionsFromReplierQuery} />
      </Flex>
    </Flex>
  );
};
