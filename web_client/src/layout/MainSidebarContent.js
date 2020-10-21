import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Icon from "@material-ui/core/Icon";
import Divider from "@material-ui/core/Divider";
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

const list = [
  {
    primaryText: "My Files",
    icon: "folder"
  },
  {
    primaryText: "Shared with me",
    icon: "people"
  },
  {
    primaryText: "Starred",
    icon: "star"
  },
  {
    primaryText: "Recent",
    icon: "schedule"
  },
  {
    primaryText: "Offline",
    icon: "offline_pin"
  },
  {
    primaryText: "Uploads",
    icon: "publish"
  },
  {
    primaryText: "Backups",
    icon: "backup"
  },
  {
    primaryText: "Trash",
    icon: "delete"
  }
];

const MainSidebarContent = () => (
  <List>
    {list.map(({ primaryText, icon }, i) => (
      <ListItem key={primaryText} selected={i === 0} button>
        <ListItemIcon>
          {/*<Icon>{icon}</Icon>*/}
            <InboxIcon />
        </ListItemIcon>
        <ListItemText
          primary={primaryText}
          primaryTypographyProps={{ noWrap: true }}
        />
      </ListItem>
    ))}
    <Divider style={{ margin: "12px 0" }} />
    <ListItem button>
      <ListItemIcon>
        <Icon>settings</Icon>
      </ListItemIcon>
      <ListItemText
        primary={"Settings & account"}
        primaryTypographyProps={{ noWrap: true }}
      />
    </ListItem>
  </List>
);

MainSidebarContent.propTypes = {};
MainSidebarContent.defaultProps = {};

export default MainSidebarContent;


// import React from "react";
// import List from '@material-ui/core/List';
// import Divider from '@material-ui/core/Divider';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
// import ListItemText from '@material-ui/core/ListItemText';
//
// const MainSidebarContent = () => (
//     <List>
//       {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
//         <ListItem button key={text}>
//           <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
//           <ListItemText primary={text} primaryTypographyProps={{ noWrap: true }} />
//         </ListItem>
//       ))}
//     </List>
// )
//
// export default MainSidebarContent




