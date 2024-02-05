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
        flexDirection: "row",
        alignItems: "center",
        gap: "0.5rem",
        color: "#316CF0",
        padding: "0.5rem",
        width: "100%"
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
          flexWrap: "wrap",
          width: "80%"
        }}
      >
        <span style={{ marginTop: "4px", fontSize: "16px", fontFamily: "SpaceGrotesk-SemiBold" }}>{username}</span>
        {bio ? (
          <span
            style={{
              marginTop: "4px",
              fontSize: "12px",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word"
            }}
          >
            {bio.length > 52 ? `${bio?.substring(0, 52)}...` : bio}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Avatar;
