import { useGetTopics } from "@/hooks/useTopicsAPI";
import { ListItemButton } from "@mui/joy";
import { List, ListItem, ListItemText, ListSubheader } from "@mui/material";
// import { Topic } from "@prisma/client";
import { FC } from "react";

export const SidebarTopics: FC = () => {
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
                <ListItemButton onClick={() => {}}>
                  <ListItemText primary={topic.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </ul>
        </li>
      )}
      <li key={`topics-list`}>
        <ul
          style={{
            scrollbarColor: "transparent transparent"
          }}
        >
          <ListSubheader
            sx={{ fontWeight: 700, backgroundColor: "#FBFCFE", color: "#32383E" }}
          >{`topics`}</ListSubheader>
          {otherTopics?.map(topic => (
            <ListItem key={`topic-${topic.id}`}>
              <ListItemButton onClick={() => {}}>
                <ListItemText primary={topic.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </ul>
      </li>
    </List>
  );
};
