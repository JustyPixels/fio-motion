export const locales=['pt-BR','en','es','fr','de','ja','zh-CN'] as const;
export type Locale=typeof locales[number];
export type PanelLayout={left:number;right:number;timeline:number;leftClosed:boolean;rightClosed:boolean};
export type Preferences={locale:Locale;updates:boolean;layouts:Record<string,PanelLayout>};
export const defaultLayout=():PanelLayout=>({left:270,right:300,timeline:250,leftClosed:false,rightClosed:false});
export function detectLocale(language=typeof navigator==='undefined'?'en':navigator.language):Locale{return locales.find(l=>l.toLowerCase()===language.toLowerCase())??locales.find(l=>l.split('-')[0]===language.split('-')[0])??'en';}
export function readPreferences():Preferences{try{const p=JSON.parse(localStorage.getItem('fio.preferences')??'{}');return {locale:(window.puppet as any)?.testingLocale??(locales.includes(p.locale)?p.locale:detectLocale()),updates:p.updates===true,layouts:p.layouts&&typeof p.layouts==='object'?p.layouts:{}};}catch{return {locale:detectLocale(),updates:false,layouts:{}};}}
export function writePreferences(p:Preferences){localStorage.setItem('fio.preferences',JSON.stringify(p));void window.puppet?.preferencesSave({locale:p.locale,updates:p.updates});}
