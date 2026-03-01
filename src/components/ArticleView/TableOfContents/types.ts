export interface TOCHeading {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4;
}

export interface TOCState {
  headings: TOCHeading[];
  activeId: string | null;
  progress: number;
}
