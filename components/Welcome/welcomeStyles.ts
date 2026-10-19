import layout from './layout.module.css';
import hero from './hero.module.css';
import artwork from './artwork.module.css';
import features from './features.module.css';
import preview from './preview.module.css';

// Selector groups remain together so shared illustration rules keep their original specificity.
const styles: Record<string, string> = { ...layout, ...hero, ...artwork, ...features, ...preview };
export default styles;
