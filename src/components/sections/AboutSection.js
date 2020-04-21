import React, { useContext } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Section from '../layout/Section';
import Row from '../grid/row';
import { ThemeContext } from '../theme';

const AboutSection = ({ data }) => {
  const theme = useContext(ThemeContext);

  return (
    <Section background={theme.color.primary.backgroundLight}>
      <h1 className='center'>
        Drop-in commenting system built for speed and customization.
      </h1>
      <p className='center'>
        Triangle takes care of everything. Simply customize your comment form,
        copy the code and paste it wherever you want in your site.
      </p>
    </Section>
  );
};

export default AboutSection;
