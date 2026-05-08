Drop factory floor photos here (JPG/PNG, ideally 1920x1080 or square).

To use a photo in FactoryPanels.tsx, replace the <div> containing
`blurredArt(...)` with:

  import {staticFile, Img} from 'remotion';
  <Img src={staticFile('assets/photos/floor-01.jpg')}
       style={{width: '100%', height: '100%',
               objectFit: 'cover',
               filter: 'blur(6px) saturate(0.85)'}} />
