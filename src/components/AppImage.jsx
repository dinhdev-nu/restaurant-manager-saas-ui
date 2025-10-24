import React, { useState } from 'react';

function Image({
  src,
  alt = 'Image Name',
  className = '',
  ...props
}) {
  const [errored, setErrored] = useState(false);

  return (
    <img
      src={errored || !src ? '/assets/images/no_image.png' : src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        setErrored(true);
        e.target.src = '/assets/images/no_image.png';
      }}
      {...props}
    />
  );
}

export default Image;
