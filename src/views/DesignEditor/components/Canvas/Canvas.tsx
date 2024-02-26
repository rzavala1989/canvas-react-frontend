import React, { useEffect } from "react"
import { Canvas as LayerhubCanvas, useEditor } from "@layerhub-io/react"
import Playback from "../Playback"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import ContextMenu from "../ContextMenu"

const Canvas = () => {
  const { displayPlayback } = useDesignEditorContext()
  const editor = useEditor()
  useEffect(() => {
    if (editor) {
      editor.on('object:selected', function(options: { target: any }) {
        if (options.target) {
          const button = document.createElement('button');
          button.innerText = 'AI actions';
          button.style.position = 'absolute';
          button.style.right = '10px'; // Adjust the position
          button.style.top = '10px'; // Adjust the position
          button.style.backgroundColor = 'white'; // Add a background color
          button.style.zIndex = '1000'; // Make sure the button appears above other elements
          button.onclick = function() {
            // Perform the desired action here
          };

          const container = document.querySelector('.canvas-container');
          // @ts-ignore
          container.appendChild(button);
        }
      });

      // @ts-ignore
      editor.on('before:selection:cleared', function(options) {
        const container = document.querySelector('.canvas-container');
        // @ts-ignore
        const button = container.querySelector('button');
        if (button) {
          // @ts-ignore
          container.removeChild(button);
        }
      });
    }
  }, [editor]);

  return (
    <div style={{ flex: 1, display: "flex", position: "relative" }}>
      {displayPlayback && <Playback />}
      <ContextMenu />
      <LayerhubCanvas
        config={{
          background: "#bebec5",
          controlsPosition: {
            rotation: "BOTTOM",
          },
          shadow: {
            blur: 4,
            color: "#fcfcfc",
            offsetX: 0,
            offsetY: 0,
          },
        }}
      />
    </div>
  )
}

export default Canvas
