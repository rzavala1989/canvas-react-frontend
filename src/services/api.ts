import axios, { AxiosInstance } from "axios"
import { GenImageType, Resource } from "~/interfaces/editor"

type IElement = any
type IFontFamily = any
type Template = any

class ApiService {
  base: AxiosInstance
  constructor() {
    this.base = axios.create({
      baseURL: "http://localhost:5000",
      // baseURL: "https://burly-note-production.up.railway.app",
      headers: {
        Authorization: "Bearer QYT8s1NavSTpTAxURji98Fpg",
      },
    })
  }

  signin(props: any) {
    return new Promise((resolve, reject) => {
      this.base
        .post("/auth/signin", props)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }


  // This function now accepts either a File object or an image URL
  removeBackground(imageInput: string | File): Promise<any> {
    // Check if the input is a File object (image upload)
    if (imageInput instanceof File) {
      const formData = new FormData();
      formData.append('image', imageInput);

      return this.base.post('/remove-background', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },

      });
    }
    // If the input is not a File, assume it's an image URL
    else {
      const payload = {
        image_url: imageInput // Assuming imageInput is a string URL here
      };

      return this.base.post('/remove-background', payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });
    }
  }
  generateImage(text: string): Promise<GenImageType> {
    const url = `http://localhost:5000/generate-image`;
    return this.base.post(url, { text }).then(response => {
      const image: GenImageType = {
        id: response.data.task_id,
        src: response.data.task_result.image_url,
        preview: response.data.task_result.image_url,
        type: "StaticImage",
      };
      return image;
    });
  }

  upscale(origin_task_id: string, index: string = '1', webhook_endpoint: string = '', webhook_secret: string = ''): Promise<GenImageType> {
    const url = `http://localhost:5000/upscale`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.VITE_APP_GOAPI_KEY
    }
    const data = {
      'origin_task_id': origin_task_id,
      'index': index,
    };
    return this.base.post(url, data, { headers }).then(response => {
      const image: GenImageType = {
        id: response.data.task_id,
        src: response.data.task_result.image_url,
        preview: response.data.task_result.image_url,
        type: "StaticImage",
      };
      return image;
    });
  }
    // Upscale API call


  // Inpaint API call
  inpaint(origin_task_id: string, prompt: string, mask: string, skip_prompt_check: boolean = false, webhook_endpoint: string = "", webhook_secret: string = ""): Promise<GenImageType> {
    const url = `http://localhost:5000/inpaint`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.VITE_APP_GOAPI_KEY
    }
    const data = {
      'origin_task_id': origin_task_id,
      'prompt': prompt,
      'mask': mask,
    };
    return this.base.post(url, data, { headers }).then(response => {
      const image: GenImageType = {
        id: response.data.task_id,
        src: response.data.task_result.image_url,
        preview: response.data.task_result.image_url,
        type: "StaticImage",
      };
      return image;
    });
  }

  outpaint(origin_task_id: string, zoom_ratio: string = '1', aspect_ratio: string = '1:1', prompt: string = '', skip_prompt_check: boolean = false, webhook_endpoint: string = '', webhook_secret: string = ''): Promise<GenImageType> {
    const url = `http://localhost:5000/outpaint`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.VITE_APP_GOAPI_KEY
    }
    const data = {
      'origin_task_id': origin_task_id,
      'zoom_ratio': zoom_ratio,
      'aspect_ratio': aspect_ratio,
      'prompt': prompt,
    };
    return this.base.post(url, data, { headers }).then(response => {
      const image: GenImageType = {
        id: response.data.task_id,
        src: response.data.task_result.image_url,
        preview: response.data.task_result.image_url,
        type: "StaticImage",
      };
      return image;
    });
  }

  fetchGeneratedImages = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-images');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };


  // TEMPLATES

  createTemplate(props: Partial<Template>): Promise<Template> {
    return new Promise((resolve, reject) => {
      this.base
        .post("/templates", props)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }

  createComponent(props: Partial<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.base
        .post("/components", props)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }

  getComponents(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.base.get("/components")
        resolve(data)
      } catch (err) {
        reject(err)
      }
    })
  }

  deleteTemplate(id: string): Promise<Template> {
    return new Promise((resolve, reject) => {
      this.base
        .delete(`/templates/${id}`)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }

  deleteComponent(id: string): Promise<Template> {
    return new Promise((resolve, reject) => {
      this.base
        .delete(`/components/${id}`)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }

  downloadTemplate(props: Partial<Template>): Promise<{ source: string }> {
    return new Promise((resolve, reject) => {
      this.base
        .post("/templates/download", props)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }

  getTemplates(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.base.get("/templates")
        resolve(data)
      } catch (err) {
        reject(err)
      }
    })
  }

  getTemplateById(id: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.base.get(`/templates/${id}`)
        resolve(data)
      } catch (err) {
        reject(err)
      }
    })
  }
  //CREATIONS TODO



  // ELEMENTS
  getElements(): Promise<IElement[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.base.get("/elements")
        resolve(data)
      } catch (err) {
        reject(err)
      }
    })
  }
  updateTemplate(id: string, props: Partial<Template>): Promise<Template> {
    return new Promise((resolve, reject) => {
      this.base
        .put(`/templates/${id}`, props)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((err) => reject(err))
    })
  }

  // FONTS
  getFonts(): Promise<IFontFamily[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.base.get("/fonts")
        resolve(data)
      } catch (err) {
        reject(err)
      }
    })
  }


}

export default new ApiService()
