/**
 * Translation loader for en-US with namespace support
 *
 * Each JSON file represents a namespace that can be accessed via:
 *   t('namespace:key') or t('namespace:nested.key')
 *
 * Example:
 *   t('common:cancel') -> "Cancel"
 *   t('auth:login.title') -> "Sign In"
 */

import alerts from './alerts.json';
import auth from './auth.json';
import branding from './branding.json';
import clipboard from './clipboard.json';
import common from './common.json';
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

const translations = {
  alerts,
  auth,
  branding,
  clipboard,
  common,
  datetime,
  device,
  editor,
  errors,
  general,
  goals,
  haptics,
  home,
  navigation,
  onboarding,
  projects,
  settings,
  sharing,
  templates,
};

export default translations;
