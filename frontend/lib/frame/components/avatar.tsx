import React from "react";

interface AvatarProps {
  imageUrl: string;
  username: string;
  bio?: string;
}

const Avatar: React.FC<AvatarProps> = ({ imageUrl, username, bio }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        color: "#316CF0",
        width: "150px" // Set the width to the value you want
      }}
    >
      <img
        src={imageUrl}
        alt={username}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          objectFit: "cover"
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginLeft: "1rem"
        }}
      >
        <span style={{ marginTop: "4px", fontSize: "16px", fontFamily: "SpaceGrotesk-SemiBold" }}>{username}</span>
        {bio && (
          <span
            style={{
              marginTop: "4px",
              fontSize: "12px",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word"
            }}
          >
            {bio?.substring(0, 50)}...
          </span>
        )}
      </div>
    </div>
  );
};

export default Avatar;
