import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useEditorSocketStore } from "../../../stores/editorSocketStore";
import { useActiveFileTabStore } from "../../../stores/activeFileTabStore";

export const EditorComponent = () => {
  const [theme, setTheme] = useState(null);
  const { editorSocket } = useEditorSocketStore();
  const { activeFileTab, setActiveFileTab } = useActiveFileTabStore();

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
  editorSocket?.on("readFileSuccess", (data) => {
    console.log("Read file success", data);
    setActiveFileTab(data.path, data.value);
  });

  return (
    <>
      {theme && (
        <Editor
          height="80vh"
          defaultLanguage={undefined}
          value={activeFileTab?.value ? activeFileTab.value : '// Welcome to the playground'}
          onMount={handleEditorMount}
        />
      )}
    </>
  );
};

