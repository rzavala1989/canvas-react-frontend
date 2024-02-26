import React from "react"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import getSelectionType from "~/utils/get-selection-type"
import { styled } from "baseui"
import Items from "./Items"
import useAppContext from "~/hooks/useAppContext"
import { ILayer } from "@layerhub-io/types"
import { Button } from "baseui/button"
import AIActions from "./AIActions"

const DEFAULT_TOOLBOX = "Canvas"

interface ToolboxState {
  toolbox: string
}

const Container = styled("div", (props) => ({
  boxShadow: "rgb(0 0 0 / 15%) 0px 1px 1px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
}))

const Toolbox = () => {
  const [state, setState] = React.useState<ToolboxState>({ toolbox: "Text" })
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { setActiveSubMenu } = useAppContext()
  const activeObject = useActiveObject() as ILayer
  const editor = useEditor()


  React.useEffect(() => {
    const selectionType = getSelectionType(activeObject)
    if (selectionType) {
      if (selectionType.length > 1) {
        setState({ toolbox: "Multiple" })
      }
      else if (selectionType.includes("Frame")) {
        setState({ toolbox: `Frame: ${activeObject.width} x ${activeObject.height}` });
      }
      else {
        setState({ toolbox: selectionType[0] })
      }
    } else {
      setState({ toolbox: DEFAULT_TOOLBOX })
      setActiveSubMenu("")
    }
  }, [activeObject])

  React.useEffect(() => {
    let watcher = async () => {
      if (activeObject) {
        // @ts-ignore
        const selectionType = getSelectionType(activeObject) as any

        if (selectionType.length > 1) {
          setState({ toolbox: "Multiple" })
        } else {
          setState({ toolbox: selectionType[0] })
        }
      }
    }
    if (editor) {
      editor.on("history:changed", watcher)
    }
    return () => {
      if (editor) {
        editor.off("history:changed", watcher)
      }
    }
  }, [editor, activeObject])

  const handleAIActions = () => {
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };
  // @ts-ignore
  const Component = Items[state.toolbox]

  return (
    <Container>
      {Component ? <Component /> : state.toolbox}
      {activeObject && activeObject.id !== 'frame' && <Button onClick={handleAIActions}>AI actions</Button>}
      <AIActions isOpen={isModalOpen} onClose={closeModal} activeObject={activeObject} />

    </Container>
  )}

export default Toolbox
