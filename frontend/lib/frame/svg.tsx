import { Question, Reaction, Tag, User } from "@prisma/client";
import * as fs from "fs";
import { join } from "path";
import satori from "satori";
import Avatar from "./components/avatar";

const regularFontPath = join(process.cwd(), "public/assets", "SpaceGrotesk-Regular.ttf");
const regularFontData = fs.readFileSync(regularFontPath);

const boldFontPath = join(process.cwd(), "public/assets", "SpaceGrotesk-SemiBold.ttf");
const boldFontData = fs.readFileSync(boldFontPath);

const imageQuestionMark = fs.readFileSync(join(process.cwd(), "public/assets", "question-mark.png"));
const imageBFLogoBlue = fs.readFileSync(join(process.cwd(), "public/assets", "bf-logoword-blue.png"));

export interface Profile {
  imageUrl: string;
  username: string;
}

export interface QuestionWithInfo extends Question {
  _count: {
    comments: number;
  };
  tags?: Tag[];
  questioner?: User;
  replier?: User;
  reactions?: Reaction[];
}

const getUsername = (fullUsername: string, fullAddress: string): string => {
  const username = fullUsername
    ? fullUsername.length > 15
      ? `@${fullUsername.substring(0, 15)}...`
      : `@${fullUsername}`
    : `${fullAddress?.substring(0, 4)}...${fullAddress?.substring(fullAddress.length - 4)}`;
  return username;
};

export const generateImageSvg = async (
  question: QuestionWithInfo,
  upvoted = false,
  downvoted = false,
  replied = false,
  userNotSignedUp = false,
  isReply = false,
  ownKeys = false
): Promise<string> => {
  const isOpenQuestion = !question?.replier?.id;
  const questionTag =
    question.tags && question.tags?.length > 0
      ? question.tags[0].name.length > 20
        ? `${question.tags[0].name.toLowerCase().substring(0, 20)}...`
        : question.tags[0].name.toLowerCase()
      : "";

  const questionerUsername = getUsername(
    question.questioner?.displayName as string,
    question.questioner?.wallet as string
  );
  const replierUsername = getUsername(question.replier?.displayName as string, question.replier?.wallet as string);
  const questionContent =
    question.questionContent.length > 130
      ? `${question.questionContent.substring(0, 130)}...`
      : question.questionContent;
  const answerText =
    question.reply && question.reply.length > 130 ? `${question.reply.substring(0, 130)}...` : question.reply;
  const answerContent = ownKeys
    ? answerText
    : `you don't own ${replierUsername}'s keys, buy them if you wanna see the answer`;

  return await satori(
    <div
      style={{
        backgroundColor: "#F3F5F6",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        alignItems: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "1rem",
          right: "1rem",
          alignItems: "center"
        }}
      >
        <img src={`data:image/png;base64,${imageBFLogoBlue.toString("base64")}`} height={"16px"} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around", // This will space your main divs evenly
          height: "100%" // Make sure your div takes up the full height for 'space-between' to have effect
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            height: "100%"
          }}
        >
          {!isOpenQuestion ? (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                width: "100%",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Avatar
                imageUrl={
                  !isReply ? (question.questioner?.avatarUrl as string) : (question.replier?.avatarUrl as string)
                }
                username={!isReply ? questionerUsername : replierUsername}
                isOpenQuestion={isOpenQuestion}
                tag={questionTag as string}
              />
              <span
                style={{
                  fontSize: "20px",
                  fontFamily: "SpaceGrotesk-SemiBold",
                  color: "#316CF0"
                }}
              >
                {!isReply ? "asked" : "answered"}
              </span>
              <Avatar
                imageUrl={
                  !isReply ? (question.replier?.avatarUrl as string) : (question.questioner?.avatarUrl as string)
                }
                username={!isReply ? replierUsername : questionerUsername}
                isOpenQuestion={isOpenQuestion}
                tag={questionTag as string}
              />
            </div>
          ) : null}
          <div
            style={{
              width: "100%",
              minHeight: "55vh",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              filter: `${userNotSignedUp || (!isOpenQuestion && isReply && !ownKeys) ? "blur(3px)" : "none"}`
            }}
          >
            {!(isReply && ownKeys) ? (
              <img
                src={`data:image/png;base64,${imageQuestionMark.toString("base64")}`}
                style={{ width: "7%", alignItems: "center" }}
              />
            ) : null}
            <span
              style={{
                width: "85%",
                color: "#316CF0",
                fontSize: "24px",
                marginLeft: "20px",
                marginRight: "20px",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isReply ? answerContent : questionContent}
            </span>
          </div>
          {isOpenQuestion ? (
            <div
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "flex-start"
              }}
            >
              <Avatar
                imageUrl={question.questioner?.avatarUrl as string}
                username={questionerUsername}
                isOpenQuestion={isOpenQuestion}
                tag={questionTag as string}
              />
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginBottom: "1.2rem"
            }}
          >
            {upvoted || downvoted || replied ? (
              <span
                style={{
                  backgroundColor: "#316CF0",
                  color: "#FFFFFF",
                  padding: "6px 10px", // paddingY paddingX
                  borderRadius: "4px",
                  marginTop: "1rem"
                }}
              >
                {upvoted ? "upvoted" : downvoted ? "downvoted" : "replied"} successfully!
              </span>
            ) : null}
          </div>
        </div>
        {userNotSignedUp ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: `${isOpenQuestion ? "15%" : "45%"}`,
              left: "0px",
              width: "80%",
              padding: "4px",
              fontSize: "15px",
              minHeight: "40vh",
              backgroundColor: "rgba(243,245,246,0.7)"
            }}
          >
            <h2>your farcaster account is not on builder.fi yet, sign up and connnect your social wallet!</h2>
          </div>
        ) : null}
        {!isOpenQuestion && isReply && !ownKeys ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: `${isOpenQuestion ? "15%" : "45%"}`,
              left: "0px",
              width: "100%",
              padding: "4px",
              fontSize: "15px",
              minHeight: "40vh",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "rgba(243,245,246,0.7)"
            }}
          >
            <h2 style={{ width: "70%" }}>
              {replierUsername}&rsquo;s answer is gated. reveal it buying {replierUsername}&rsquo;s key
            </h2>
          </div>
        ) : null}
      </div>
    </div>,
    {
      width: 600,
      height: 315,
      fonts: [
        {
          data: regularFontData,
          name: "SpaceGrotesk-Regular"
        },
        {
          data: boldFontData,
          name: "SpaceGrotesk-SemiBold"
        }
      ]
    }
  );
};
