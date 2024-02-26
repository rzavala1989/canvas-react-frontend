import {  styled } from "baseui"
import { BASE_ITEMS, VIDEO_PANEL_ITEMS } from "~/constants/app-options"
import useAppContext from "~/hooks/useAppContext"
import Icons from "~/components/Icons"
import { useTranslation } from "react-i18next"
import useSetIsSidebarOpen from "~/hooks/useSetIsSidebarOpen"
import useEditorType from "~/hooks/useEditorType"
import Scrollable from "~/components/Scrollable"
import { Block } from "baseui/block"
import {StatefulTooltip} from "baseui/tooltip"
import theme from "~/theme"

const Container = styled("div", (props) => ({
  width: "80px",
  color: theme.colors.black100,
  backgroundColor: theme.colors.black900,
  display: "flex",
}))

const
  PanelsList = () => {
  const { activePanel } = useAppContext()
  const { t } = useTranslation("editor")
  const editorType = useEditorType()
  const PANEL_ITEMS = editorType === "VIDEO" ? VIDEO_PANEL_ITEMS : BASE_ITEMS
  return (
    <Container>
      <Scrollable autoHide={true}>
        {PANEL_ITEMS.map((panelListItem) => (
          <PanelListItem
            label={t(`panels.panelsList.${panelListItem.id}`)}
            name={panelListItem.name}
            key={panelListItem.name}
            icon={panelListItem.name}
            activePanel={activePanel}
          />
        ))}
      </Scrollable>
    </Container>
  )
}

const PanelListItem = ({ label, icon, activePanel, name }: any) => {
  const { setActivePanel } = useAppContext()
  const setIsSidebarOpen = useSetIsSidebarOpen()
  // @ts-ignore
  const Icon = Icons[icon]
  // @ts-ignore
  return (
    <StatefulTooltip
      content={label}
      placement="bottom"

      >
      <Block
        id="EditorPanelList"
        onClick={() => {
          setIsSidebarOpen(true)
          setActivePanel(name)
        }}
        $style={{
          width: "80px",
          height: "80px",
          color: name === activePanel ? theme.colors.black900 : theme.colors.black100,
          backgroundColor: name === activePanel ? theme.colors.white : theme.colors.black900,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
          fontFamily: "cursive", // make sure the font name matches exactly with the imported one
          fontWeight: 600,
          fontSize: "0.8rem",
          userSelect: "none",
          transition: "all 0.5s",
          gap: "0.1rem",
          ":hover": {
            cursor: "pointer",
            backgroundColor: theme.colors.primary500,
            transition: "all 1s",
          },
        }}
      >
        <Icon size={24} />
      </Block>
    </StatefulTooltip>
  )
}

export default PanelsList
