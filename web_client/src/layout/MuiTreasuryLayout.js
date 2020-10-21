// This is a prebuilt (preset) layout created with MUI treasury library
import React from 'react';
import styled from 'styled-components';
import { StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import { HeaderMockUp, NavHeaderMockUp, NavContentMockUp, FooterMockUp } from '@mui-treasury/mockup/layout';
import { Root, getHeader, getContent, getDrawerSidebar, getSidebarContent, getFooter, getSidebarTrigger,
  getCollapseBtn, getMuiTreasuryScheme} from '@mui-treasury/layout';
import AppContent from "./AppContent";
import MainSidebarContent from "./MainSidebarContent";
import HeaderContent from "./HeaderContent";

const Header = getHeader(styled);
const Content = getContent(styled);
const DrawerSidebar = getDrawerSidebar(styled);
const SidebarContent = getSidebarContent(styled);
const Footer = getFooter(styled);
const SidebarTrigger = getSidebarTrigger(styled);
const CollapseBtn = getCollapseBtn(styled);

const muiTreasuryScheme = getMuiTreasuryScheme();

// mutate the muiTreasuryScheme preset
muiTreasuryScheme.configureHeader(builder => {
  builder.registerConfig("md", {
        clipped: false,
      })
});

const MuiTreasuryLayout = () => {
  return (
    <StylesProvider injectFirst>
      <CssBaseline />
      <Root scheme={muiTreasuryScheme}>
        {({ state: { sidebar } }) => (
          <>
            <Header>
              <Toolbar>
                <SidebarTrigger sidebarId="primarySidebar" />
                {/*<HeaderMockUp />*/}
                <HeaderContent />
              </Toolbar>
            </Header>

            <DrawerSidebar sidebarId="primarySidebar">
              <SidebarContent>
                <NavHeaderMockUp collapsed={sidebar.primarySidebar.collapsed} />
                {/*<NavContentMockUp />*/}
                <MainSidebarContent/>
              </SidebarContent>
              <CollapseBtn />
            </DrawerSidebar>

            <Content>
              <AppContent/>
            </Content>

            <Footer>
              <FooterMockUp />
            </Footer>
          </>
        )}
      </Root>
    </StylesProvider>
  );
};


export default MuiTreasuryLayout;