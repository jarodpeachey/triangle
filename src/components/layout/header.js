/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-fragments */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { Link } from 'gatsby';
import Menu from './Menu';
// import MobileMenu from './MobileMenu';
import { AppContext } from '../../providers/AppProvider';
import Button from '../Button';
import Row from '../grid/row';

const Header = ({ siteTitle }) => {
  const { scrolled, setScrolled } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  // const closeMobileMenu = () => {
  //   setOpen(false);
  // };

  // const openMobileMenu = () => {
  //   setOpen(true);
  // };

  // const mobileMenuToggle = () => {
  //   if (open) {
  //     closeMobileMenu();
  //   } else {
  //     openMobileMenu();
  //   }
  // };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);

    const inner = document.getElementById('blur')
      ? document.getElementById('blur').offsetWidth
      : 0;
    const outer = document.getElementById('mobile-menu')
      ? document.getElementById('mobile-menu').offsetWidth
      : 0;

    setWidth(outer - inner);

    return () => {
      setWidth();
      window.removeEventListener('scroll', onScroll);
    };
  });

  const toggleFunction = () => {
    if (open) {
      // document.getElementById('blur').classList.remove('blur');
    } else {
      // document.getElementById('blur').classList.add('blur');
    }

    setOpen(!open);
  };

  const onScroll = () => {
    if (window.scrollY > 40) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  return (
    <>
      {typeof window !== 'undefined' &&
      !window.location.pathname.includes('/signup') &&
      !window.location.pathname.includes('/login') ? (
        <>
          <Wrapper id='header' open={open} scrolled={scrolled}>
            <div className='container'>
              <Flex>
                <SiteTitle className='logo' scrolled={scrolled}>
                  Triangle
                </SiteTitle>
                <Menu scrolled={scrolled} />
                {/* <MobileMenu scrolled={scrolled} /> */}
                <MobileMenuToggle onClick={toggleFunction} open={open}>
                  <MobileMenuRotate open={open}>
                    <span />
                    <span />
                    <span />
                  </MobileMenuRotate>
                </MobileMenuToggle>
              </Flex>
            </div>
            {/* <MobileMenuOverlay open={open}> */}
            {/* </MobileMenuOverlay> */}
          </Wrapper>
          <MobileMenu
            width={width}
            id='mobile-menu'
            scrolled={scrolled}
            open={open}
          >
            <div className='container'>
              <Row spacing={[8]} breakpoints={[576]} flexDirections={['row']}>
                <div widths={[8]}>
                  <MobileMenuItems open={open}>
                    <MobileMenuItem to='/'>Home</MobileMenuItem>
                    <MobileMenuItem to='https://github.com/jarodpeachey/triangle-comments'>
                      Docs
                    </MobileMenuItem>
                  </MobileMenuItems>
                </div>
                <div widths={[4]}>
                  <Row
                    spacing={[8]}
                    breakpoints={[0, 576]}
                    flexDirections={['row', 'column']}
                  >
                    <div widths={[6, 12]}>
                      <Button
                        link='/signup'
                        medium
                        className='full-width'
                        outlined
                      >
                        Sign Up
                      </Button>
                    </div>
                    <div widths={[6, 12]}>
                      <Button
                        link='/login'
                        medium
                        className='full-width'
                        outlined
                      >
                        Log In
                      </Button>
                    </div>
                  </Row>
                </div>
              </Row>
            </div>
          </MobileMenu>
        </>
      ) : null}
    </>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: '',
};

const Wrapper = styled.header`
  .container {
    padding-top: ${(props) => (props.scrolled ? '8px' : '20px')};
    padding-bottom: ${(props) => (props.scrolled ? '8px' : '20px')};
  }
  background: ${(props) => (props.scrolled ? 'white' : 'transparent')};
  color: ${(props) =>
    props.scrolled ? 'inherit' : 'rgb(81, 160, 249)'} !important;
  transition-duration: 0.25s;
  transition: all 0.25s ease-out;
  box-shadow: ${(props) =>
    props.open
      ? 'none'
      : props.scrolled
      ? '1px 0px 60px -5px rgba(81, 160, 249, 0.4)'
      : ''};
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: auto;
  z-index: 999;
  max-height: 80px;
  background: white !important;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
`;

const SiteTitle = styled.h1`
  margin: 0;
  text-transform: uppercase;
  margin-bottom: -8px;
  font-size: ${(props) => (props.scrolled ? '32px' : '40px')};
  transition-duration: 0.25s;
  z-index: 999;
`;

const MobileMenuToggle = styled.div`
  z-index: 9999;
  width: 35px;
  height: 35px;
  @media (min-width: 769px) {
    display: none;
  }
  transform: rotate(0deg);
  transition: 0.5s ease-out;
  cursor: pointer;
  margin-left: auto;
  position: ${(props) => (props.open ? 'relative' : 'static')};
  // right: ${(props) => (props.open ? '12px' : 'none')};
  span {
    display: block;
    position: absolute;
    height: 6px;
    width: 100%;
    background: #3e4348;
    border-radius: 9px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: ${(props) =>
      props.open ? 'all 0.25s ease-in' : 'all 0.25s ease-out'};
  }

  span:nth-child(1) {
    top: ${(props) => (props.open ? 'calc(50% - 3px)' : '10%')};
    transform-origin: left center;
  }
  span:nth-child(2) {
    top: ${(props) => (props.open ? 0 : 'calc(50% - 3px)')};
    left: ${(props) => (props.open ? 'calc(50% - 3px)' : null)};
    width: ${(props) => (props.open ? '6px' : null)};
    height: ${(props) => (props.open ? '100%' : null)};
    transform-origin: left center;
  }
  span:nth-child(3) {
    top: calc(90% - 6px);
    transform-origin: left center;
    width: ${(props) => (props.open ? 0 : null)};
    opacity: ${(props) => (props.open ? 0 : 1)};
  }
`;

const MobileMenuRotate = styled.div`
  height: 100%;
  width: 100%;
  transition: ${(props) =>
    props.open ? 'all 0.25s ease-in' : 'all 0.25s ease-out'};
  transform: ${(props) => (props.open ? 'rotate(-45deg)' : 'none')};
`;

const MobileMenu = styled.div`
  line-height: 1;
  position: fixed;
  overflow: hidden;
  top: ${(props) => (props.open ? '0' : '-100%')};
  margin-top: ${(props) => (props.scrolled ? '51px' : '80px')};
  background: white;
  z-index: 999;
  width: 100%;
  transition: ${(props) =>
    props.open ? 'all 0.25s ease-out' : 'all 0.6s ease-out'};
  border-top: ${(props) => (props.open ? '2px solid #f7f7f7' : 'none')};
  box-shadow: 1px 0px 15px -5px rgba(81, 160, 249, 0.4),
    1px 0px 30px -5px rgba(81, 160, 249, 0.2);

  .container {
    padding: 12px 10vw;
  }
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const MobileMenuItems = styled.div`
  display: block;
`;

const MobileMenuItem = styled(Link)`
  text-decoration: none;
  transition-duration: 0.2s;
  color: #666 !important;
  font-weight: bold;
  text-align: center;
  font-size: 16px;
  border-bottom: 1px solid #e8e8e8;
  display: block;
  padding: 16px 0;
  width: 100%;
  :last-child {
    border: none;
  }
  transition-duration: 0.2s;
  :hover {
    background: #f7f7f7;
    transition-duration: 0.2s;
  }
`;

export default Header;
