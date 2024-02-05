import { useGetTopics } from "@/hooks/useTopicsAPI";
import { ListItemButton } from "@mui/joy";
import { List, ListItem, ListItemText, ListSubheader } from "@mui/material";
// import { Topic } from "@prisma/client";
import { FC } from "react";

interface Props {
  navigate: (path: string) => void;
}

export const SidebarTopics: FC<Props> = ({ navigate }) => {
  const { data: topics } = useGetTopics();
  const purchasedTopics = topics?.filter(topic => topic.purchased);
  const otherTopics = topics?.filter(topic => !topic.purchased);

  return (
    <List
      sx={{
        width: "100%",
        position: "relative",
        overflow: "auto",
        maxHeight: 350,
        "& ul": { padding: 0 }
      }}
      subheader={<li />}
    >
      {purchasedTopics !== undefined && purchasedTopics.length > 0 && (
        <li key={`purchased-topics-list`}>
          <ul
            style={{
              scrollbarColor: "transparent transparent"
            }}
          >
            <ListSubheader
              sx={{ fontWeight: 700, backgroundColor: "#FBFCFE", color: "#32383E" }}
            >{`purchased topics`}</ListSubheader>
            {purchasedTopics?.map(topic => (
              <ListItem key={`topic-${topic.id}`}>
                <ListItemButton onClick={() => navigate(`/topic/${topic.id}`)}>
                  <ListItemText primary={topic.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </ul>
        </li>
      )}
      <li key={`topics-list`}>
        <ListSubheader
          sx={{ fontWeight: 700, backgroundColor: "#FBFCFE", color: "#32383E", fontSize: "20px" }}
        >{`topics`}</ListSubheader>
        <div
          style={{
            overflowY: "scroll"
          }}
        >
          <ul>
            {otherTopics?.map(topic => (
              <ListItem key={`topic-${topic.id}`}>
                <ListItemButton onClick={() => navigate(`/topic/${topic.id}`)}>
                  <ListItemText primary={topic.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </ul>
        </div>
      </li>
    </List>
  );
};
