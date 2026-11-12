export type Preset = 'calm' | 'signature' | 'playful';
export type CaseMode = 'original' | 'upper' | 'lower' | 'mixed';
export interface BrewturaOptions { seed?: string | number; preset?: Preset; caseMode?: CaseMode }
export interface BrewturaGlyph { index: number; text: string; face: string; scale: number; whitespace: boolean }
export interface BrewturaRun { version: number; source: string; text: string; seed: string; preset: Preset; caseMode: CaseMode; glyphs: BrewturaGlyph[] }
export interface BrewturaFace { readonly id: string; readonly family: string; readonly file: string; readonly weight: number; readonly oblique: boolean }
export const ENGINE_VERSION: number;
export const FACES: readonly BrewturaFace[];
export const PRESETS: Readonly<Record<Preset, Readonly<{ variation: number; oblique: boolean; minWeight: number; maxWeight: number }>>>;
export function graphemes(text: string): string[];
export function createBrewtura(text: string, options?: BrewturaOptions): BrewturaRun;
