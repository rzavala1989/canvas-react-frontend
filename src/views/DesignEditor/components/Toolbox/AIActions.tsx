import React, {useState, useEffect, useRef, useContext} from "react"
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from "baseui/modal";
import { KIND } from "baseui/button";
import { Input } from "baseui/input"
import createLasso from "lasso-canvas-image"
import { styled } from "baseui"
import Select from "react-select"
import theme from "~/theme"
import api from "~/services/api"
import useAppContext from "~/hooks/useAppContext"

interface AIActionsProps {
  isOpen: boolean;
  onClose: () => void;
  activeObject: any;
}

const rightButtonStyle = {
  borderTopLeftRadius: '0', //  Removes border radius on the top-left
  borderBottomLeftRadius: '0', // Removes border radius on the bottom-left
  marginLeft: '0', // Removes right margin
};

const leftButtonStyle = {
  borderTopRightRadius: '0', // Removes border radius on the top-right
  borderBottomRightRadius: '0', // Removes border radius on the bottom-right
  marginRight: '0', // Removes left margin
};




const Button = styled(ModalButton, (props) => ({
  background: `linear-gradient(to bottom right, ${theme.colors.primary}, black)`,
}))

const AIActions: React.FC<AIActionsProps> = ({ isOpen, onClose, activeObject }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef(null);
  const polygonRef = useRef<SVGPolygonElement>(null);
  const lassoRef = useRef<any>(null); // Replace 'LassoTool' with the correct type for your lasso tool
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImageLoaded] = useState(false);
  const [base64Image, setBase64Image] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomRatio, setZoomRatio] = useState("1");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [prompt, setPrompt] = useState("");

  const {  setLoading, generatedImages, setGeneratedImages } = useAppContext();

  const options = [
    { value: "1", label: "Image 1" },
    { value: "2", label: "Image 2" },
    { value: "3", label: "Image 3" },
    { value: "4", label: "Image 4" },
  ];

  const zoomRatios = [
    { value: "1", label: "1" },
    { value: "1.5", label: "1.5" },
    { value: "2", label: "2" },
  ];

  const aspectRatios = [
    { value: "1:1", label: "1:1" },
    { value: "2:3", label: "2:3" },
    { value: "3:2", label: "3:2" },
  ];

  const resetLasso = () => {
    if (lassoRef.current) {
      lassoRef.current.reset();
      lassoRef.current = null; // Add this line
    }
    setBase64Image("");
  };

  const resetCanvas = () => {
  if (canvasRef.current) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
};

const handleClear = () => {
  resetLasso();
  resetCanvas();
  setSelectedImage("");
  setBase64Image("");
  setZoomRatio("1");
  setAspectRatio("1:1");
}

  useEffect(() => {
    if (imgLoaded && imageRef.current) {
      createLassoCanvas(canvasRef?.current, imageRef.current);
    }
  }, [imgLoaded, imageRef]);


  useEffect(() => {
    const handleImageLoad = () => {
      // Once the image is loaded, we can set the canvas size and initialize the lasso
      if (canvasRef.current && imageRef.current) {
        const canvas = canvasRef.current;
        const image = imageRef.current;

        // Set the canvas dimensions to match the image dimensions
        canvas.width = image.width;
        canvas.height = image.height;

        // Create the lasso canvas and attach lasso logic
        createLassoCanvas(canvas, image);
      }
    };

    if (imageRef.current) {
      const image = imageRef.current;
      if (image.complete && image.naturalHeight !== 0) {
        // If the image is already loaded, initialize the lasso
        handleImageLoad();
      } else {
        // If the image is not yet loaded, set up an event listener
        image.addEventListener('load', handleImageLoad);
        // Clean up the event listener when the component unmounts or the image changes
        return () => image.removeEventListener('load', handleImageLoad);
      }
    }
  }, [imageRef, canvasRef]); // Dependency on imgLoaded might not be necessary if we rely on the image's 'load' event

  const createLassoCanvas = (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
    console.log('createLassoCanvas'); // Debugging line
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imageElement = imageContainerRef.current.querySelector('img');

      if (imageElement instanceof HTMLImageElement) {

        lassoRef.current = createLasso({
          element: imageElement,
          onUpdate(polygon) {
            console.log('polygon:', polygon); // Debugging line
            if (polygonRef.current && typeof polygon === "string") {
              polygonRef.current.setAttribute("points", polygon);
              console.log('polygonRef:', polygonRef); // Debugging line
              const coordinates = polygon
                .split(" ")
                .map((point) => point.split(",").map(Number));

              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = "black";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              ctx.beginPath();
              for (let i = 0; i < coordinates.length; i++) {
                const [x, y] = coordinates[i];
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
              }
              ctx.closePath();
              ctx.fillStyle = "white";
              ctx.fill();
              const base64Image = canvas.toDataURL("image/webp").replace("data:image/webp;base64,", "");
              ;
              setBase64Image(base64Image);
            }
          },
        });
      }
    }
    console.log('lassoRef:', lassoRef); // Debugging line
  };

  const handleUpscale = async (selectedImage: string | undefined) => {
    if (selectedImage) {
      setLoading(true);
      onClose()
      handleClear()
      try {
        const response = await api.upscale(activeObject.id, selectedImage);
        const image = {
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
    } else {
      console.log("No image selected for upscale");
    }
  };

  const handleInpaint = async (prompt: string) => {
    setLoading(true);
    onClose()
    handleClear()
    try {
      const response = await api.inpaint(activeObject.id, prompt, base64Image);
      const image = {
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

  const handleOutpaint = async (prompt: string) => {
    setLoading(true);
    onClose();
    handleClear();
    try {
      const response = await api.outpaint(activeObject.id, zoomRatio, aspectRatio, prompt);
      const image = {
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


  return (
    <Modal onClose={() => {
      resetLasso();
      setImageLoaded(false)
      onClose();
    }} isOpen={isOpen} overrides={{
      Dialog: {
        style: {
          width: '1000px',
          height: 'auto',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        },
      },
    }}>

      <ModalHeader
        style={{  margin: "auto", width: "80%", maxWidth: "80%" }}>
        <h2>AI Actions</h2>
      </ModalHeader>
      <div style={{justifyContent: "space-between", maxWidth: "80%", margin: 'auto', width:'80%', display: "flex", flexDirection: "row" }}>

        <section style={{ display: "flex", flexDirection: "row" }}>
          <Button style={leftButtonStyle} onClick={() => handleUpscale(selectedImage)}>
            Upscale
          </Button>
          <Select
            options={options}
            value={options.find(option => option.value === selectedImage)}
            onChange={(selectedOption: { value: any; }) => {
              setSelectedImage(selectedOption?.value || "")
            }}
            styles={{
              control: (provided) => ({
                ...provided,
                height: "100%"
              })
            }}
          />
        </section>
        <section>
          <ModalButton
            onClick={resetLasso}
            style={rightButtonStyle}
          >
            Reset Lasso
          </ModalButton>
        </section>

      </div>

      <ModalBody>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {activeObject && (
            <div ref={imageContainerRef} style={{ position: "relative" }}>
              <img
                src={activeObject.preview || activeObject?.src}
                alt="preview"
                ref={imageRef}
                onLoad={() => {
                  setImageLoaded(true)
                }}
                style={{ margin: "auto", objectFit: "contain", maxWidth: "80%", maxHeight: "80%" }}
                onError={(e) => {
                  console.error("Failed to load image", e)
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          )}
          <div style={{ display: "flex", width: "80%", padding: '1rem 0' }}>
            <Button type={KIND.tertiary} style={leftButtonStyle} onClick={() => {
              handleInpaint(prompt)
            }}>
              Inpaint
            </Button>
            <Input placeholder="Enter a prompt" onChange={(e) => setPrompt(e.target.value)} />
            <Button style={rightButtonStyle} onClick={() => {
              handleOutpaint(prompt)
            }}>
              Outpaint
            </Button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "80%", padding: '1rem 0' }}>
          <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
            <label>Zoom Ratio</label>
            <Select
              options={zoomRatios}
              value={zoomRatios.find(option => option.value === zoomRatio)}
              onChange={(selectedOption: { value: any; }) => {
                setZoomRatio(selectedOption?.value || "1")
              }}
              styles={{
                control: (provided) => ({
                  ...provided,
                  height: "100%",
                  width: "100%", // Adjust as needed
                  fontSize: "1.2rem", // Adjust as needed
                  padding: "0.5rem", // Adjust as needed
                })
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
            <label>Aspect Ratio</label>
            <Select
              options={aspectRatios}
              value={aspectRatios.find(option => option.value === aspectRatio)}
              onChange={(selectedOption: { value: any; }) => {
                setAspectRatio(selectedOption?.value || "1:1")
              }}
              styles={{
                control: (provided) => ({
                  ...provided,
                  height: "100%",
                  width: "100%", // Adjust as needed
                  fontSize: "1.2rem", // Adjust as needed
                  padding: "0.5rem", // Adjust as needed
                })
              }}
            />
          </div>
        </div>

        </div>
        <ModalFooter>
          <svg width="0" height="0">
            <polygon ref={polygonRef} points="" style={{ display: "none" }} />
          </svg>
        </ModalFooter>
      </ModalBody>

    </Modal>
  );
};

export default AIActions;