import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// This component acts as a wrapper for FontAwesome icons to be used as inline SVGs.
// This is to avoid the build error and ensure the component works without issues.
const FontAwesome = ({ iconName, ...props }) => {
  switch (iconName) {
    case 'FaChevronLeft':
      return <FaChevronLeft {...props} />;
    case 'FaChevronRight':
      return <FaChevronRight {...props} />;
    default:
      return null;
  }
};

export default FontAwesome;
