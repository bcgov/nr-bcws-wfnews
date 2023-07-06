/**
 * Used by MapService to manage map instances
 */
export interface MapInstance {
  name: string;
  isInitialized: boolean;
  api?: any;
}
