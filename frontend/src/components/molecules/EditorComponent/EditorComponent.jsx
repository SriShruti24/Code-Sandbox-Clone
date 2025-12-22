import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

export const EditorComponent = () => {
  const [theme, setTheme] = useState(null);

  
  useEffect(() => {
    let mounted = true;

    async function downloadTheme() {
      const response = await fetch("/Dracula.json");
      const data = await response.json();
      if (mounted) setTheme(data);
    }

    downloadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  
  function handleEditorMount(editor, monaco) {
    if (!theme) return;

    monaco.editor.defineTheme("dracula", theme);
    monaco.editor.setTheme("dracula");
  }

  return (
    <>
      {theme && (
        <Editor
          height="80vh"
          defaultLanguage="javascript"
          defaultValue="// Welcome to the playground"
          onMount={handleEditorMount}
        />
      )}
    </>
  );
};
// i made the changes here
