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

export const generateImageSvg = async (
  question: QuestionWithInfo,
  upvoted = false,
  downvoted = false,
  replied = false,
  userNotSignedUp = false
): Promise<string> => {
  const numberOfReplies = question._count.comments ? question._count.comments : 0;
  const isAwaitingAnswer = (question?.replier && !question.repliedOn) || (!question?.replier && numberOfReplies === 0);
  const isOpenQuestion = !question?.replier?.id;
  const questionTag = question.tags && question.tags?.length > 0 ? question.tags[0].name.toLowerCase() : "";

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center"
              }}
            >
              <Avatar
                imageUrl={
                  isOpenQuestion || isAwaitingAnswer
                    ? (question.questioner?.avatarUrl as string)
                    : (question.replier?.avatarUrl as string)
                }
                username={
                  isOpenQuestion || isAwaitingAnswer
                    ? (question.questioner?.displayName as string)
                    : (question.replier?.displayName as string)
                }
                userAddress={
                  isOpenQuestion || isAwaitingAnswer
                    ? (question.questioner?.wallet as string)
                    : (question.replier?.wallet as string)
                }
                isOpenQuestion={isOpenQuestion}
                tag={questionTag as string}
              />
              {!isOpenQuestion ? (
                <div
                  style={{
                    alignItems: "center",
                    display: "flex"
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontFamily: "SpaceGrotesk-SemiBold",
                      color: "#316CF0"
                    }}
                  >
                    {isAwaitingAnswer ? "asked" : "answered"}
                  </span>
                  <Avatar
                    imageUrl={
                      isAwaitingAnswer
                        ? (question.replier?.avatarUrl as string)
                        : (question.questioner?.avatarUrl as string)
                    }
                    username={
                      isAwaitingAnswer
                        ? (question.replier?.displayName as string)
                        : (question.questioner?.displayName as string)
                    }
                    userAddress={
                      isAwaitingAnswer ? (question.replier?.wallet as string) : (question.questioner?.wallet as string)
                    }
                    isOpenQuestion={isOpenQuestion}
                    tag={questionTag as string}
                  />
                </div>
              ) : null}
            </div>
          </div>
          <div
            style={{
              minHeight: "40%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              filter: `${userNotSignedUp ? "blur(3px)" : "none"}`
            }}
          >
            <img
              src={`data:image/png;base64,${imageQuestionMark.toString("base64")}`}
              style={{ width: "7%", alignItems: "center" }}
            />
            <span
              style={{
                width: "85%",
                color: "#316CF0",
                fontSize: "24px",
                marginLeft: "20px",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {question.questionContent.length > 130
                ? `${question.questionContent.substring(0, 130)}...`
                : question.questionContent}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginBottom: "1rem"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                minHeight: "1.2rem"
              }}
            >
              {upvoted || downvoted || replied ? (
                <span style={{ backgroundColor: "#316CF0", color: "#FFFFFF", padding: "6px", borderRadius: "4px" }}>
                  {upvoted ? "upvoted" : downvoted ? "downvoted" : "replied"} successfully!
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {userNotSignedUp ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "40%",
              left: "0px",
              width: "100%",
              padding: "4px",
              fontSize: "15px",
              minHeight: "40vh",
              backgroundColor: "rgba(243,245,246,0.7)"
            }}
          >
            <h2>your farcaster account is not on builder.fi yet, sign up and connnect your social wallet!</h2>
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
