import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBolt,
  faDesktop,
  faBars,
  faPuzzlePiece,
  faCog,
  faUser,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { fab, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import Footer from './footer';
import Header from './header';
import { AuthProvider } from '../../providers/AuthProvider';
import { AppProvider } from '../../providers/AppProvider';
import { pathnameIncludes } from '../../utils/pathnameIncludes';

library.add(
  faBars,
  faBolt,
  faDesktop,
  faPuzzlePiece,
  faCog,
  faEnvelope,
  faLinkedin,
  faGithub,
  faUser
);

if (typeof window !== 'undefined') {
  window.MemberfulOptions = { site: 'https://trianglecomments.memberful.com' };
}

const Layout = (props) => {
  console.log(props.children);

  useEffect(() => {
    const s =
      typeof document !== 'undefined' && document.createElement('script');

    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://d35xxde4fgg0cx.cloudfront.net/assets/embedded.js';

    const setup = function () {
      typeof window !== 'undefined' && window.MemberfulEmbedded.setup();
    };

    s.addEventListener('load', setup, false);

    (
      (typeof document !== 'undefined' &&
        document.getElementsByTagName('head')[0]) ||
      (typeof document !== 'undefined' &&
        document.getElementsByTagName('body')[0])
    ).appendChild(s);
  });

  return (
    // <Security {...config}>
    <Wrapper>
      <AppProvider>
        <AuthProvider>
          <Header siteTitle={props.title} />
          <div id='blur'>
            {!pathnameIncludes('/signup') && !pathnameIncludes('/login') && (
              <ContentWrapper />
            )}
            {props.children}
            <Footer />
          </div>
        </AuthProvider>
      </AppProvider>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  max-height: 99999999999999999px !important;
`;

const ContentWrapper = styled.div`
  height: 100%;
  padding-top: ${(props) => (props.scrolled ? '50px' : '60px')};
`;

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
