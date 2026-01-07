/**
 * Language Type
 * Generic language interface for localization packages
 * This is a base configuration that can be extended by consuming applications
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isRTL?: boolean;
}
