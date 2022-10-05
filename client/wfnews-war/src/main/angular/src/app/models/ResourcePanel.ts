export interface WildfireResource {
  title: string;
  subtitle: string;
  url: string;
  description: string;
};

export interface ResourcePanel {
  title: string;
  resources: WildfireResource[];
};
