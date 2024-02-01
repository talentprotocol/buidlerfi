import { useGetTopics } from "@/hooks/useTopicsAPI";
import { ListItemButton } from "@mui/joy";
import { List, ListItem, ListItemText, ListSubheader } from "@mui/material";
// import { Topic } from "@prisma/client";
import { FC } from "react";

export const SidebarTopics: FC = () => {
  const { data: topics } = useGetTopics();

  return (
    <>
      {/* <ListItemText primary={"All topics"} sx={{ fontWeight: "700" }} /> */}
      <List
        sx={{
          width: "100%",
          maxWidth: 360,
          position: "relative",
          overflow: "auto",
          maxHeight: 250,
          "& ul": { padding: 0 }
        }}
        subheader={<li />}
      >
        <li key={`topics-list`}>
          <ul
            style={{
              scrollbarColor: "transparent transparent"
            }}
          >
            <ListSubheader
              sx={{ fontWeight: 700, backgroundColor: "#FBFCFE", color: "#32383E" }}
            >{`Topics`}</ListSubheader>
            {topics?.map(topic => (
              <ListItem key={`topic-${topic.id}`}>
                <ListItemButton onClick={() => {}}>
                  <ListItemText primary={topic.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </ul>
        </li>
      </List>
      {/* <List>
        {topics.map(topic => (
          <ListItem key={topic.id}>
            <ListItemButton onClick={() => {}}>
              <ListItemText primary={topic.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </>
  );
};
