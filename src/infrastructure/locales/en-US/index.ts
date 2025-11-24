/**
 * en-US Translation Module
 *
 * Direct loading for maximum compatibility across platforms
 * - Explicit imports for reliable bundling
 * - Flattened with dot notation
 * - Production-ready and tested
 */

import alerts from './alerts.json';
import auth from './auth.json';
import branding from './branding.json';
import clipboard from './clipboard.json';
import datetime from './datetime.json';
import device from './device.json';
import editor from './editor.json';
import errors from './errors.json';
import general from './general.json';
import goals from './goals.json';
import haptics from './haptics.json';
import home from './home.json';
import navigation from './navigation.json';
import onboarding from './onboarding.json';
import projects from './projects.json';
import settings from './settings.json';
import sharing from './sharing.json';
import templates from './templates.json';

/**
 * Flatten nested objects with dot notation
 */
const flattenObject = (
  obj: Record<string, any>,
  prefix = '',
): Record<string, string> => {
  const flattened: Record<string, string> = {};

  Object.keys(obj).forEach((key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], newKey));
    } else {
      flattened[newKey] = obj[key];
    }
  });

  return flattened;
};

// Create flattened translations object
const translations = {
  ...flattenObject(alerts, 'alerts'),
  ...flattenObject(auth, 'auth'),
  ...flattenObject(branding, 'branding'),
  ...flattenObject(clipboard, 'clipboard'),
  ...flattenObject(datetime, 'datetime'),
  ...flattenObject(device, 'device'),
  ...flattenObject(editor, 'editor'),
  ...flattenObject(errors, 'errors'),
  ...flattenObject(general, 'general'),
  ...flattenObject(goals, 'goals'),
  ...flattenObject(haptics, 'haptics'),
  ...flattenObject(home, 'home'),
  ...flattenObject(navigation, 'navigation'),
  ...flattenObject(onboarding, 'onboarding'),
  ...flattenObject(projects, 'projects'),
  ...flattenObject(settings, 'settings'),
  ...flattenObject(sharing, 'sharing'),
  ...flattenObject(templates, 'templates'),
};

export default translations;
