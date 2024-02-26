import { useActiveObject, useContextMenuRequest, useEditor } from "@layerhub-io/react"
import { useStyletron } from "baseui"
import BringToFront from "~/components/Icons/BringToFront"
import Delete from "~/components/Icons/Delete"
import Duplicate from "~/components/Icons/Duplicate"
import Elements from "~/components/Icons/Elements"
import Locked from "~/components/Icons/Locked"
import Paste from "~/components/Icons/Paste"
import SendToBack from "~/components/Icons/SendToBack"
import Unlocked from "~/components/Icons/Unlocked"
import api from "~/services/api"
import {LoadingSpinner} from "baseui/button/styled-components"
import { useState } from "react"
import theme from "~/theme"

const ContextMenu = () => {
  const [isLoading, setIsLoading] = useState(false);

  const contextMenuRequest = useContextMenuRequest()
  const editor = useEditor()
  let activeObject: any = useActiveObject()
  const handleAsComponentHandler = async () => {
    if (editor) {
      const component: any = await editor.scene.exportAsComponent()
      if (component) {
        console.log({ component })
      }
    }
  }

  const removeBackground = async () => {
    // Create a loading spinner element
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.style.position = 'absolute';
    spinner.style.top = '50%';
    spinner.style.left = '50%';
    spinner.style.transform = 'translate(-50%, -50%)';
    spinner.innerHTML = '<LoadingSpinner />';

    // Append the loading spinner to the canvas container
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.appendChild(spinner);
    }
    let response;
    if (editor && activeObject && activeObject.type === 'StaticImage') {
      // Get the image URL from the active object
      let imageUrl = activeObject._element.src;
      // Call the removeBackground method with the image URL
      response = await api.removeBackground(imageUrl);
      // Handle the response
      if (response) {
        // The response is a Blob representing the processed image
        const blob = response.data;
        // Create a URL for the blob
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'processed_image.png'; // Assuming the image is in PNG format
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link);
        console.log(activeObject);
        editor.objects.remove();

        // Add the new image to the editor
        const options = {
          type: "StaticImage",
          src: blobUrl,
        }
        console.log( options )
        editor.objects.add(options);
        // Revoke the blob URL to release memory once it's no longer needed
        URL.revokeObjectURL(blobUrl);
        // Cancel the context menu request
        editor.cancelContextMenuRequest();
      }
    }
    // Remove the loading spinner from the canvas container
    if (canvasContainer) {
      canvasContainer.removeChild(spinner);
    }
  };


  if (!contextMenuRequest || !contextMenuRequest.target) {
    return <></>
  }

  if (contextMenuRequest.target.type === "Background") {
    return (
      <div // @ts-ignore
        onContextMenu={(e: Event) => e.preventDefault()}
        style={{
          position: "absolute",
          top: `${contextMenuRequest.top}px`,
          left: `${contextMenuRequest.left}px`,
          zIndex: 129,
          width: "240px",
          borderRadius: "10px",
          boxShadow: "0.5px 2px 7px rgba(0, 0, 0, 0.1)",
          padding: "0.5rem 0",
        }}
      >
        <ContextMenuItem
          disabled={true}
          onClick={() => {
            editor.objects.copy()
            editor.cancelContextMenuRequest()
          }}
          icon="Duplicate"
          label="copy"
        >
          <Duplicate size={24} />
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            editor.objects.paste()
            editor.cancelContextMenuRequest()
          }}
          icon="Paste"
          label="paste"
        >
          <Paste size={24} />
        </ContextMenuItem>
        <ContextMenuItem
          disabled={true}
          onClick={() => {
            editor.objects.remove()
            editor.cancelContextMenuRequest()
          }}
          icon="Delete"
          label="delete"
        >
          <Delete size={24} />
        </ContextMenuItem>
      </div>
    )
  }
  return (
    <>
      {!contextMenuRequest.target.locked ? (
        <div // @ts-ignore
          onContextMenu={(e: Event) => e.preventDefault()}
          style={{
            position: "absolute",
            top: `${contextMenuRequest.top}px`,
            left: `${contextMenuRequest.left}px`,
            zIndex: 129,
            width: "240px",
            color: theme.colors.black100,
            backgroundColor: theme.colors.black800,
            borderRadius: "10px",
            boxShadow: "0.5px 2px 7px rgba(0, 0, 0, 0.1)",
            padding: "0.5rem 0",
          }}
        >
          <ContextMenuItem
            onClick={() => {
              editor.objects.copy()
              editor.cancelContextMenuRequest()
            }}
            icon="Duplicate"
            label="copy"
          >
            <Duplicate size={24} />
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor.objects.paste()
              editor.cancelContextMenuRequest()
            }}
            icon="Paste"
            label="paste"
          >
            <Paste size={24} />
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor.objects.remove()
              editor.cancelContextMenuRequest()
            }}
            icon="Delete"
            label="delete"
          >
            <Delete size={24} />
          </ContextMenuItem>
          <div style={{ margin: "0.5rem 0" }} />
          <ContextMenuItem
            onClick={() => {
              editor.objects.bringForward()
              editor.cancelContextMenuRequest()
            }}
            icon="Forward"
            label="bring forward"
          >
            <BringToFront size={24} />
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor.objects.sendBackwards()
              editor.cancelContextMenuRequest()
            }}
            icon="Backward"
            label="send backward"
          >
            <SendToBack size={24} />
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              handleAsComponentHandler()
              editor.cancelContextMenuRequest()
            }}
            icon="Elements"
            label="Save as component"
          >
            <Elements size={24} />
          </ContextMenuItem>
          <div style={{ margin: "0.5rem 0" }} />
          <ContextMenuItem
            onClick={() => {
              editor.objects.lock()
              editor.cancelContextMenuRequest()
            }}
            icon="Locked"
            label="lock"
          >
            <Locked size={24} />
          </ContextMenuItem>
          {activeObject?.type === "StaticImage" && (
            <ContextMenuItem
              onClick={() => {
                // handleAsComponentHandler()
                editor.objects.setAsBackgroundImage()
                editor.cancelContextMenuRequest()
              }}
              icon="Images"
              label="Set as background image"
            >
              <Elements size={24} />
            </ContextMenuItem>

          )}
          <ContextMenuItem
            label="Remove Background Image"
            icon="RemoveCircleOutline"
            onClick={removeBackground}
          >
            <Elements size={24} />
          </ContextMenuItem>
        </div>
      ) : (
        <div // @ts-ignore
          onContextMenu={(e: Event) => e.preventDefault()}
          style={{
            position: "absolute",
            top: `${contextMenuRequest.top}px`,
            left: `${contextMenuRequest.left}px`,
            zIndex: 129,
            width: "240px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0.5px 2px 7px rgba(0, 0, 0, 0.1)",
            padding: "0.5rem 0",
          }}
        >
          <ContextMenuItem
            onClick={() => {
              editor.objects.unlock()
              editor.cancelContextMenuRequest()
            }}
            icon="Unlocked"
            label="unlock"
          >
            <Unlocked size={24} />
          </ContextMenuItem>
        </div>
      )}
    </>
  )
}

const ContextMenuItem = ({
  label,
  onClick,
  children,
  disabled = false,
}: {
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) => {
  const [css] = useStyletron()
  return (
    <div
      onClick={onClick}
      className={css({
        display: "flex",
        height: "32px",
        fontSize: "14px",
        alignItems: "center",
        padding: "0 1rem",
        gap: "1rem",
        cursor: "pointer",
        pointerEvents: disabled ? "none" : "auto",
        opacity: disabled ? 0.4 : 1,
        ":hover": {
          backgroundColor: "rgba(0,0,0,0.075)",
        },
      })}
    >
      {children} {label}
    </div>
  )
}

export default ContextMenu
