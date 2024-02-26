import React, {useContext, useEffect} from "react"
import { Block } from "baseui/block"
import AngleDoubleLeft from "~/components/Icons/AngleDoubleLeft"
import Scrollable from "~/components/Scrollable"
import { Button, SIZE } from "baseui/button"
import DropZone from "~/components/Dropzone"
import { useEditor } from "@layerhub-io/react"
import useSetIsSidebarOpen from "~/hooks/useSetIsSidebarOpen"
import { nanoid } from "nanoid"
import { captureFrame, loadVideoResource } from "~/utils/video"
import { ILayer } from "@layerhub-io/types"
import { toBase64 } from "~/utils/data"
import theme from "~/theme"
import { Input } from "baseui/input"
import Search from "~/components/Icons/Search"
import api from "~/services/api"
import useAppContext from "~/hooks/useAppContext"
import { LoadingSpinner } from "~/components/Loading/LoadingSpinner"
import { use } from "i18next"
import { GenImageType } from "~/interfaces/editor"

export default function () {
  const inputFileRef = React.useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = React.useState<any[]>([])
  const [prompt, setPrompt] = React.useState("");
  const editor = useEditor()
  const setIsSidebarOpen = useSetIsSidebarOpen()
  const { isLoading, setLoading, generatedImages, setGeneratedImages } = useAppContext()

  useEffect(() => {
    const fetchImages = async () => {
      const images = await api.fetchGeneratedImages();
      setGeneratedImages(
        images?.map((image: any) => ({
          id: image.task_id,
          src: image.task_result.image_url,
          preview: image.task_result.image_url,
          type: "StaticImage",
        }))
      );
    };
    fetchImages();}, []);

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const response = await api.generateImage(prompt);
      const image: GenImageType = {
        id: response.data.task_id,
        src: response.data.task_result.image_url,
        preview: response.data.task_result.image_url,
        type: "StaticImage",
      };
      setGeneratedImages([...generatedImages, image]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropFiles = async (files: FileList) => {
    const file = files[0]

    const isVideo = file.type.includes("video")
    const base64 = (await toBase64(file)) as string
    let preview = base64
    if (isVideo) {
      const video = await loadVideoResource(base64)
      const frame = await captureFrame(video)
      preview = frame
    }

    const type = isVideo ? "StaticVideo" : "StaticImage"

    const upload = {
      id: nanoid(),
      src: base64,
      preview: preview,
      type: type,
    }

    setUploads([...uploads, upload])
  }

  const handleInputFileRefClick = () => {
    inputFileRef.current?.click()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDropFiles(e.target.files!)
  }

  const addImageToCanvas = (props: Partial<ILayer>) => {
    const img = new Image();
    console.log(img)
    // @ts-ignore
    img.src = props.src;
    img.onload = () => {
      // @ts-ignore
      const canvasWidth = editor.canvas.options.width;
      // @ts-ignore
      const canvasHeight = editor.canvas.options.height;

      // Calculate the scale factor - THIS IS AN ARBITRARY FIGURE
      const scaleFactor = (Math.min(
        canvasWidth / img.naturalWidth,
        canvasHeight / img.naturalHeight
      )) * 0.7;

      console.log(scaleFactor)

      // Create a new object with the scaled dimensions
      const scaledProps = {
        ...props,
        scaleX: scaleFactor,
        scaleY: scaleFactor,
      };

      // Add the scaled object to the canvas
      editor.objects.add(scaledProps);
    };
  };
  return (
    <DropZone handleDropFiles={handleDropFiles}>
      <Block $style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Block
          $style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
            justifyContent: "space-between",
            color: theme.colors.white,
            padding: "1.5rem",
          }}
        >
          <Block $style={{fontWeight: "bold"}}>Uploads</Block>

          <Block onClick={() => setIsSidebarOpen(false)} $style={{ cursor: "pointer", display: "flex" }}>
            <AngleDoubleLeft size={18} />
          </Block>
        </Block>
        <Scrollable>
          <Block padding={"0 1.5rem"}>
            <Button
              onClick={handleInputFileRefClick}
              size={SIZE.compact}
              overrides={{
                Root: {
                  style: {
                    width: "100%",
                  },
                },
              }}
            >
              Upload from Computer
            </Button>
            <input onChange={handleFileInput} type="file" id="file" ref={inputFileRef} style={{ display: "none" }} />

            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              {uploads?.map((upload) => (
                <div
                  key={upload.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    addImageToCanvas(upload)
                    console.log(upload)
                  }}
                >
                  <div>
                    <img width="100%" src={upload.preview ? upload.preview : upload.url} alt="preview" style={{
                      objectFit: "contain",
                      maxWidth: "100%",
                      maxHeight: "100%"
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </Block>
          <Block $style={{
            display: "flex",
            flexDirection: "column",
            fontWeight: 500,
            justifyContent: "space-between",
            color: theme.colors.white,
            padding: "5rem 1.5rem",
          }}>
            {isLoading && <LoadingSpinner />}

            <Block $style={{fontWeight: 'bold'}}>
              Generate an Image with Prompt
            </Block>
            <Block style={{ padding: "1rem 0" }}>
              <Input
                clearable
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt here"
                size={SIZE.compact}
                startEnhancer={<Search size={16} />}
              />
              <Button
                onClick={handleGenerateImage}
                size={SIZE.compact}
                overrides={{
                  Root: {
                    style: {
                      width: "100%",
                    },
                  },
                }}
              >
                Generate Image
              </Button>
              <div
                style={{
                  marginTop: "1rem",
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                {generatedImages?.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      addImageToCanvas(image)
                      console.log(image)
                    }}
                  >
                    <div>
                      <img
                        width="100%"
                        src={image.preview}
                        alt="preview"
                        style={{
                          objectFit: "contain",
                          maxWidth: "100%",
                          maxHeight: "100%"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          </Block>
        </Scrollable>
      </Block>
    </DropZone>
  )
}
