export type AdSlotKey = 'header' | 'sidebar' | 'footer' | 'inContent';

export interface DirectAdConfigItem {
  html: string; // Third-party ad HTML snippet (script/iframe). Will be sandboxed via iframe srcdoc.
  width?: number | string; // e.g., 300 or '100%'
  height?: number | string; // e.g., 250 or 'auto'
  responsive?: boolean; // if true, width 100%
  enabled?: boolean;
}

export type DirectAdsConfig = Partial<Record<AdSlotKey, DirectAdConfigItem>>;

// Fill this with your direct ad creatives. Example placeholders below.
export const directAds: DirectAdsConfig = {
  // header: {
  //   html: '<div style="width:728px;height:90px;background:#eee;display:flex;align-items:center;justify-content:center;font-family:sans-serif">Your Direct Ad 728x90</div>',
  //   width: 728,
  //   height: 90,
  //   enabled: false,
  // },
  // sidebar: {
  //   html: '<div style="width:300px;height:250px;background:#eee;display:flex;align-items:center;justify-content:center;font-family:sans-serif">Your Direct Ad 300x250</div>',
  //   width: 300,
  //   height: 250,
  //   enabled: false,
  // },
  // footer: {
  //   html: '<div style="width:728px;height:90px;background:#eee;display:flex;align-items:center;justify-content:center;font-family:sans-serif">Your Direct Ad 728x90</div>',
  //   width: 728,
  //   height: 90,
  //   enabled: false,
  // },
  // inContent: {
  //   html: '<div style="width:100%;height:280px;background:#eee;display:flex;align-items:center;justify-content:center;font-family:sans-serif">Your Direct Ad</div>',
  //   width: '100%',
  //   height: 280,
  //   responsive: true,
  //   enabled: false,
  // },
};