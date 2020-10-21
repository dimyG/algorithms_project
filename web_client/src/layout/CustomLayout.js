// This is a custom layout created with MUI treasury library
import styled from 'styled-components';
import Layout, { Root, getHeader, getContent, getFooter, getDrawerSidebar, getSidebarTrigger, getCollapseBtn, getSidebarContent  } from '@mui-treasury/layout';
import { HeaderMockUp, NavHeaderMockUp, NavContentMockUp, FooterMockUp, ContentMockUp } from '@mui-treasury/mockup/layout';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import React from "react";

import AppContent from "./AppContent";
import MainSidebarContent from "./MainSidebarContent";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import ListItemText from "@material-ui/core/ListItemText";

const Header = getHeader(styled);
const DrawerSidebar = getDrawerSidebar(styled);
const Content = getContent(styled)
const Footer = getFooter(styled)
const SidebarTrigger = getSidebarTrigger(styled)
const SidebarContent = getSidebarContent(styled)
const CollapseBtn = getCollapseBtn(styled)

const scheme = Layout();

scheme.configureHeader(builder => {
  builder
    .registerConfig('xs', {
      position: 'sticky',
    })
    .registerConfig('md', {
      position: 'relative', // won't stick to top when scroll down
    });
});

scheme.configureEdgeSidebar(builder => {
  builder
    .create('main_sidebar', { anchor: 'left' })
    .registerTemporaryConfig('xs', {
      anchor: 'left',
      width: 'auto', // 'auto' is only valid for temporary variant
    })
    .registerPermanentConfig('md', {
      width: 256, // px, (%, rem, em is compatible)
      collapsible: true,
      collapsedWidth: 74,
    })
    // change permanentConfig to persistentConfig so that our EdgeSidebar can be closed at breakpoint >= md
    // .registerPersistentConfig('md', {
    //   width: 256,
    //   collapsible: true,
    //   collapsedWidth: 74,
    //   persistentBehavior: {
    //     whatever_id: 'fit',
    //     _others: 'none',
    //   },
    // });
});

const CustomLayout = () => {
    return(
        <Root scheme={scheme}>
            {({ state: { sidebar }, setOpen, setCollapsed }) => (
                <>
                <CssBaseline />
                <Header>
                    <Toolbar>
                        <SidebarTrigger sidebarId={'main_sidebar'} />
                        <HeaderMockUp />
                    </Toolbar>
                </Header>

                <DrawerSidebar sidebarId={'main_sidebar'}>
                    <SidebarContent>
                        {/* the collapsed prop of NavHeaderMockUp instruct the user icon to shrink when sidebar is collapsed */}
                        <NavHeaderMockUp collapsed={sidebar.main_sidebar.collapsed}/>
                        {/*<NavContentMockUp />*/}
                        <MainSidebarContent />
                    </SidebarContent>
                    <CollapseBtn />
                </DrawerSidebar>

                <Content>
                    <Container maxWidth="md">
                      <Box pt={2}>
                        {sidebar.main_sidebar.open && !sidebar.main_sidebar.collapsed && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setCollapsed('main_sidebar', true)}
                          >
                            Collapse
                          </Button>
                        )}
                        {sidebar.main_sidebar.open && (
                          <Button
                            variant="contained"
                            onClick={() => setOpen('main_sidebar', false)}
                          >
                            Close
                          </Button>
                        )}
                      </Box>
                    </Container>
                  <AppContent/>
                </Content>

                    <Footer><FooterMockUp /></Footer>
                </>
            )}
        </Root>
    )
}

export default CustomLayout