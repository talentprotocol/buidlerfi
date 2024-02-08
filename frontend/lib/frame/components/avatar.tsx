import * as fs from "fs";
import { join } from "path";
import React from "react";

interface AvatarProps {
  imageUrl: string;
  username: string;
  userAddress: string;
  bio?: string;
}

const imageDefaultProfile = fs.readFileSync(join(process.cwd(), "public/assets", "default-profile.png"));

const Avatar: React.FC<AvatarProps> = ({ imageUrl, username, userAddress, bio }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "0.5rem",
        color: "#316CF0",
        padding: "0.4rem",
        width: "100%"
      }}
    >
      <img
        src={imageUrl !== null ? imageUrl : `data:image/png;base64,${imageDefaultProfile.toString("base64")}`}
        alt={username}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          objectFit: "cover"
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          flexWrap: "wrap",
          width: "80%"
        }}
      >
        <span style={{ marginTop: "4px", fontSize: "20px", fontFamily: "SpaceGrotesk-SemiBold" }}>
          {username ? username : `${userAddress?.substring(0, 4)}...${userAddress?.substring(userAddress.length - 4)}`}
        </span>
        {bio ? (
          <span
            style={{
              marginTop: "4px",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word"
            }}
          >
            {bio.length > 50 ? `${bio?.substring(0, 50)}...` : bio}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Avatar;
