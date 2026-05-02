import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";
import { usePortStore } from "./portStore";

export const useEditorSocketStore = create((set) => ({
    editorSocket: null,
    setEditorSocket: (incomingSocket) => {

        const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;
        const projectTreeStructureSetter = useTreeStructureStore.getState().setTreeStructure;
         const portSetter = usePortStore.getState().setPort;

        incomingSocket?.on("readFileSuccess", (data) => {
            const fileExtension = data.path.split('.').pop();
            activeFileTabSetter(data.path, data.value, fileExtension);
        });

        incomingSocket?.on("writeFileSuccess", (data) => {
        });

        incomingSocket?.on("deleteFileSuccess", () => {
            projectTreeStructureSetter();
        });

        incomingSocket?.on("deleteFolderSuccess", () => {
            projectTreeStructureSetter();
        });

        incomingSocket?.on("createFileSuccess", () => {
            projectTreeStructureSetter();
        });

        incomingSocket?.on("createFolderSuccess", () => {
            projectTreeStructureSetter();
        });

          incomingSocket?.on("getPortSuccess", ({ port }) => {
            portSetter(port);
        })

        incomingSocket?.on("fileChanged", (data) => {
            projectTreeStructureSetter();
            if (data.event === "change" || data.event === "add") {
                const currentTab = useActiveFileTabStore.getState().activeFileTab;
                if (currentTab?.path === data.path) {
                    incomingSocket?.emit("readFile", { pathToFileOrFolder: data.path });
                }
            }
        })

        set({
            editorSocket: incomingSocket
        });
    }
}));