import { Question, Reaction, User } from "@prisma/client";
import * as fs from "fs";
import { join } from "path";
import satori from "satori";
import { BASE_URL } from "../constants";
import Avatar from "./components/avatar";

const regularFontPath = join(process.cwd(), "public/assets", "SpaceGrotesk-Regular.ttf");
const regularFontData = fs.readFileSync(regularFontPath);

const boldFontPath = join(process.cwd(), "public/assets", "SpaceGrotesk-SemiBold.ttf");
const boldFontData = fs.readFileSync(boldFontPath);

export interface Profile {
  imageUrl: string;
  username: string;
}

export interface QuestionWithInfo extends Question {
  questioner?: User;
  replier?: User;
  reactions?: Reaction[];
}

export const generateImageSvg = async (question: QuestionWithInfo): Promise<string> => {
  return await satori(
    <div
      style={{
        backgroundColor: "#F3F5F6",
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        alignItems: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around", // This will space your main divs evenly
          gap: "1rem",
          height: "100%" // Make sure your div takes up the full height for 'space-between' to have effect
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "2rem"
          }}
        >
          <img src={`${BASE_URL}/bf-logoword-blue.png`} height={"12px"} />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.5rem"
            }}
          >
            <Avatar
              imageUrl={question.questioner?.avatarUrl as string}
              username={question.questioner?.displayName as string}
              bio={question!.questioner?.bio as string}
            />
            <img src={`${BASE_URL}/arrows.png`} style={{ width: "48px" }} />
            <Avatar
              imageUrl={question.replier?.avatarUrl as string}
              username={question.replier?.displayName as string}
              bio={question.replier?.bio as string}
            />
          </div>
        </div>
        <div
          style={{
            border: "2px solid white",
            padding: "1rem",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <span
            style={{
              color: "#316CF0",
              fontSize: "24px"
            }}
          >
            {question.questionContent}
          </span>
        </div>
      </div>
    </div>,
    {
      width: 600,
      height: 400,
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
