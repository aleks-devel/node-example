import { EditorDataType } from "@server/main-site/editor/entities/editor-data-type.enum";

type BaseEditorObject = {
  client: boolean;
  attr?: string;
  hashId: string;
};

export type NumberEditorObject = BaseEditorObject & {
  type: EditorDataType.int | EditorDataType.float | EditorDataType.uint;
  value: number;
  enum?: number[];
};

export type StringEditorObject = BaseEditorObject & {
  type: EditorDataType.string;
  value: string;
  enum?: string[];
};

export type FileEditorObject = BaseEditorObject & {
  type: EditorDataType.file;
  value: string;
  enum?: undefined;
};

export type BooleanEditorObject = BaseEditorObject & {
  type: EditorDataType.boolean;
  value: boolean;
  enum?: undefined;
};

export type RichTextEditorObject = BaseEditorObject & {
  type: EditorDataType.richText;
  value: object | null;
  enum?: undefined;
};

export type ArrayEditorObject = BaseEditorObject & {
  type: EditorDataType.array;
  value: Record<string, string | number | boolean>[];
  scheme: any;
  enum?: undefined;
};

export type EditorObject =
  | NumberEditorObject
  | StringEditorObject
  | FileEditorObject
  | BooleanEditorObject
  | RichTextEditorObject
  | ArrayEditorObject;

export type EditorData = {
  [key: string]: EditorObject | EditorData;
};

export type InitializeData = Omit<EditorObject, "hashId"> & {
  key: string;
};

export type GetEditorDataDto = {
  token: string;
  data: InitializeData[];
};
