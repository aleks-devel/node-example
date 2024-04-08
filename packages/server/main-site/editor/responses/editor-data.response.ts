import { EditorObject } from "@server/main-site/editor/dto/get-editor-data.dto";

export type EditorResponseObject = EditorObject;

export type EditorResponse = {
  [key: string]: EditorResponseObject | EditorResponse;
};
