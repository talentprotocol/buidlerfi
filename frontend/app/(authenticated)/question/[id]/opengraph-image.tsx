import { getQuestion } from "@/backend/question/question";
import { DEFAULT_PROFILE_PICTURE, OG_BACKGROUND_IMAGE, OG_BACKGROUND_IMAGE_FALLBACK } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import { format } from "date-fns";
import { ImageResponse } from "next/og";
// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "builder.fi by Talent Protocol";
export const size = {
  width: 1200,
  height: 630
};

const baseUrl =
  process.env.ENVIRONMENT === "localhost"
    ? "http://localhost:3000"
    : process.env.ENVIRONMENT === "development"
    ? "https://dev.builder.fi"
    : "https://app.builder.fi";

export const contentType = "image/png";
// Image generation
export default async function Image({ params }: { params: { id: string } }) {
  const question = (await fetch(`${baseUrl}/api/question/${params.id}`)
    .then(res => res.json())
    .catch(err => {
      console.error(err);
      return undefined;
    })) as Awaited<ReturnType<typeof getQuestion>>;
  const interLight = await fetch(new URL(`${baseUrl}/assets/Inter-Light.ttf`)).then(res => res.arrayBuffer());
  const interRegular = await fetch(new URL(`${baseUrl}/assets/Inter-Regular.ttf`)).then(res => res.arrayBuffer());

  //Fallback if error when fetching question
  if (!question) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            backgroundImage: `url("${baseUrl}${OG_BACKGROUND_IMAGE_FALLBACK}")`,
            backgroundSize: "100% 100%"
          }}
        ></div>
      )
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: "150px",
          paddingLeft: "50px",
          justifyContent: "space-between",
          height: "100vh",
          width: "100vw",
          backgroundImage: `url("${baseUrl}${OG_BACKGROUND_IMAGE}")`,
          backgroundSize: "100% 100%",
          gap: "30px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <img
              width="80px"
              height="80px"
              src={question.data.questioner.avatarUrl || `${baseUrl}${DEFAULT_PROFILE_PICTURE}`}
              style={{ borderRadius: "50%" }}
            />
            <img
              width="80px"
              height="80px"
              src={question.data.replier?.avatarUrl || `${baseUrl}${DEFAULT_PROFILE_PICTURE}`}
              style={{ borderRadius: "50%", marginLeft: "-40px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "38px",
              fontFamily: "Inter Regular",
              color: "#171a1c"
            }}
          >
            <span>
              {question.data.questioner.displayName || shortAddress(question.data.questioner?.wallet)}
              <span style={{ marginLeft: "15px", marginRight: "15px", fontFamily: "Inter Light" }}>asked</span>
              {question.data.replier?.displayName || shortAddress(question.data.replier?.wallet)}
            </span>
            <div style={{ fontSize: "24px", color: "grey" }}>
              {format(new Date(question.data.createdAt), "MMM dd, yyyy")}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: "34px",
            fontFamily: "Inter Light",
            maxWidth: "60%",
            flexGrow: 1
          }}
        >
          {question.data.questionContent}
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: "Inter Regular",
          data: interRegular
        },
        {
          name: "Inter Light",
          data: interLight
        }
      ]
    }
  );
}
