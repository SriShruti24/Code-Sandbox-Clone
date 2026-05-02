import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useActiveFileTabStore } from "../../../stores/activeFileTabStore";
import { useEditorSocketStore } from "../../../stores/editorSocketStore";
import { extensionToFileType } from '../../../utils/extensionToFileType';
import { EditorButton } from "../../atoms/EditorButton/EditorButton";

export const EditorComponent = () => {
  const timerId = useRef(null);
  const [theme, setTheme] = useState(null);

  const { activeFileTab, openTabs, switchTab, closeTab } = useActiveFileTabStore();
  const { editorSocket } = useEditorSocketStore();

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

  function handleChange(value) {
    if (timerId.current != null) {
      clearTimeout(timerId.current);
    }

    timerId.current = setTimeout(() => {
      const editorContent = value;
      editorSocket.emit("writeFile", {
        data: editorContent,
        pathToFileOrFolder: activeFileTab.path
      });
    }, 2000);
  }

  function handleTabSelect(path) {
    if (activeFileTab?.path !== path) {
      editorSocket.emit("readFile", { pathToFileOrFolder: path });
    }
    switchTab(path);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {openTabs.length > 0 && (
        <div className="editor-tab-bar">
          {openTabs.map((tab) => (
            <EditorButton
              key={tab.path}
              name={tab.name}
              extension={tab.extension}
              isActive={activeFileTab?.path === tab.path}
              onSelect={() => handleTabSelect(tab.path)}
              onClose={() => closeTab(tab.path)}
            />
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflow: "hidden" }}>
        {theme && (
          <Editor
            defaultLanguage={undefined}
            language={extensionToFileType(activeFileTab?.extension)}
            onChange={handleChange}
            value={
              activeFileTab?.value
                ? activeFileTab.value
                : "// Welcome to the playground"
            }
            onMount={handleEditorMount}
          />
        )}
      </div>
    </div>
  );
};
