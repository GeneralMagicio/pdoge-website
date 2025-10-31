import { type Address } from 'viem';

export type EASConfig = {
  EASDeployment: Address
  SchemaRegistry: Address
};

interface Config extends EASConfig {
  explorer: string
  gqlUrl: string
}

export const EASNetworks: Record<number, Config> = {
  // Polygon
  137: {
    EASDeployment: '0x5E634ef5355f45A855d02D66eCD687b1502AF790',
    SchemaRegistry: '0x7876EEF51A891E737AF8ba5A5E0f0Fd29073D5a7',
    explorer: 'https://polygon.easscan.org',
    gqlUrl: 'https://polygon.easscan.org/graphql',
  },
};

