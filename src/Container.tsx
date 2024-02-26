import React, { useEffect, useContext, useRef, useState } from "react"
import ResizeObserver from "resize-observer-polyfill"
import useAppContext from "~/hooks/useAppContext"
import Loading from "./components/Loading"
import { editorFonts } from "./constants/fonts"
import { getFonts } from "./store/slices/fonts/actions"
import { getUploads } from "./store/slices/uploads/actions"
import { useAppDispatch } from "./store/store"
import { AppContext } from "~/contexts/AppContext"
import { LoadingSpinner } from "~/components/Loading/LoadingSpinner"

const Container = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useContext(AppContext);

  const containerRef = useRef<HTMLDivElement>(null)
  const { isMobile, setIsMobile } = useAppContext()
  const [loaded, setLoaded] = useState(false)
  const dispatch = useAppDispatch()
  const updateMediaQuery = (value: number) => {
    if (!isMobile && value >= 800) {
      setIsMobile(false)
    } else if (!isMobile && value < 800) {
      setIsMobile(true)
    } else {
      setIsMobile(false)
    }
  }
  useEffect(() => {
    const containerElement = containerRef.current!
    const containerWidth = containerElement.clientWidth
    updateMediaQuery(containerWidth)
    const resizeObserver = new ResizeObserver((entries) => {
      const { width = containerWidth } = (entries[0] && entries[0].contentRect) || {}
      updateMediaQuery(width)
    })
    resizeObserver.observe(containerElement)
    return () => {
      if (containerElement) {
        resizeObserver.unobserve(containerElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    dispatch(getFonts())
    dispatch(getUploads())
    loadFonts()
    setTimeout(() => {
      setLoaded(true)
    }, 1000)
  }, [])

  const loadFonts = () => {
    const promisesList = editorFonts.map(async (font) => {
      // @ts-ignore
      try {
        // @ts-ignore
        return await new FontFace(font.name, `url(${font.url})`, font.options).load()
      } catch (err) {
        return err
      }
    })
    Promise.all(promisesList)
      .then((res) => {
        res.forEach((uniqueFont) => {
          // @ts-ignore
          if (uniqueFont && uniqueFont.family) {
            // @ts-ignore
            document.fonts.add(uniqueFont)
          }
        })
      })
      .catch((err) => console.log({ err }))
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        height: "100vh",
        width: "100vw",
      }}
    >
      {loaded ? <>{children} </> : <Loading />}
    </div>
  )
}

export default Container
