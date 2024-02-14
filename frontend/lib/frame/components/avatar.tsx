import * as fs from "fs";
import { join } from "path";
import React from "react";

interface AvatarProps {
  imageUrl: string;
  username: string;
  isOpenQuestion?: boolean;
  tag?: string;
}

const imageDefaultProfile = fs.readFileSync(join(process.cwd(), "public/assets", "default-profile.png"));

const Avatar: React.FC<AvatarProps> = ({ imageUrl, username, isOpenQuestion, tag }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: `${isOpenQuestion ? "row" : "column"}`,
        alignItems: "center",
        gap: "0.5rem",
        color: "#316CF0",
        padding: "0.4rem"
      }}
    >
      <img
        src={imageUrl !== null ? imageUrl : `data:image/png;base64,${imageDefaultProfile.toString("base64")}`}
        alt={`${username} profile photo`}
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          border: "1px solid #316CF0",
          objectFit: "cover"
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "center" }}>
        <span style={{ fontSize: "16px", fontFamily: "SpaceGrotesk-SemiBold" }}>{username}</span>
        {isOpenQuestion ? (
          <span style={{ fontSize: "16px", fontFamily: "SpaceGrotesk-Regular" }}>
            asked an open question {!!tag && tag != "" ? " about " : ""}
            {!!tag && tag != "" ? (
              <span
                style={{
                  fontSize: "16px",
                  fontFamily: "SpaceGrotesk-SemiBold",
                  alignItems: "center",
                  lineHeight: "0.8rem",
                  padding: "0.3rem 0.55rem", // paddingY paddingX
                  border: "1px solid #0b0d0e40",
                  borderRadius: "7999px",
                  marginLeft: "0.4rem"
                }}
              >
                {tag}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Avatar;
