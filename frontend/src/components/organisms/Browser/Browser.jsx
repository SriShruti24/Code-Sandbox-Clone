import { useEffect, useRef } from "react";
import { Input, Row } from "antd";
import { useEditorSocketStore } from "../../../stores/editorSocketStore.js";
import { usePortStore } from "../../../stores/portStore.js";
import { ReloadOutlined } from "@ant-design/icons";

export const Browser = ({ projectId }) => {

    const browserRef = useRef(null);
    const { port } = usePortStore();

    const { editorSocket } = useEditorSocketStore();

    useEffect(() => {
        if(!port) {
            editorSocket?.emit("getPort", {
                containerName: projectId
            })
        }
    }, [port, editorSocket,projectId]);

    useEffect(() => {
        const handleFileChange = (data) => {
            // Give Vite a moment to restart before refreshing the iframe
            setTimeout(() => {
                if(browserRef.current) {
                    const url = new URL(browserRef.current.src);
                    url.searchParams.set('t', Date.now().toString());
                    browserRef.current.src = url.toString();
                }
            }, 1500);
        };

        editorSocket?.on("fileChanged", handleFileChange);

        return () => {
            editorSocket?.off("fileChanged", handleFileChange);
        };
    }, [editorSocket]);

    if(!port) {
        return <div style={{ color: "white", padding: "20px" }}>Spinning up sandbox...</div>
    }

    function handleRefresh() {
        if(browserRef.current) {
            const url = new URL(browserRef.current.src);
            url.searchParams.set('t', Date.now().toString());
            browserRef.current.src = url.toString();
        }
    }

    return (
        <Row
            style={{
                backgroundColor: "#22212b"
            }}
        >
            <Input 
                style={{
                    width: "100%",
                    height: "30px",
                    color: "white",
                    fontFamily: "Fira Code",
                    backgroundColor: "#282a35",
                }}
                prefix={<ReloadOutlined onClick={handleRefresh} />}
                value={`http://${window.location.hostname}:${port}`}
                readOnly
            />

            <iframe 
                ref={browserRef}
                src={`http://${window.location.hostname}:${port}`}
                style={{
                    width: "100%",
                    height: "95vh",
                    border: "none"
                }}
            />

        </Row>
    )

}